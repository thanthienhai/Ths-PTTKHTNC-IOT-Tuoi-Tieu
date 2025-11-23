#!/usr/bin/env python3
"""
Edge Controller for Smart Irrigation IoT System
Runs on Raspberry Pi or ESP32
"""

import time
import json
import sqlite3
import requests
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
CLOUD_URL = "http://api-gateway:3000"
DEVICE_ID = "edge-001"
SECURITY_KEY = "your-security-key-here"
SYNC_INTERVAL = 60  # seconds
SENSOR_INTERVAL = 300  # 5 minutes

class EdgeController:
    def __init__(self):
        self.db = self.init_database()
        self.authenticated = False
        self.offline_mode = False
        
    def init_database(self) -> sqlite3.Connection:
        """Initialize local SQLite database"""
        conn = sqlite3.connect('edge_data.db')
        cursor = conn.cursor()
        
        # Sensor readings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sensor_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sensor_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT NOT NULL,
                quality TEXT DEFAULT 'good',
                synced INTEGER DEFAULT 0
            )
        ''')
        
        # Schedules table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT PRIMARY KEY,
                zone_id TEXT NOT NULL,
                start_time TEXT NOT NULL,
                duration INTEGER NOT NULL,
                flow_rate REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                executed INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        return conn
    
    def authenticate(self) -> bool:
        """Authenticate with cloud"""
        try:
            response = requests.post(
                f"{CLOUD_URL}/api/devices/authenticate",
                json={"deviceId": DEVICE_ID, "securityKey": SECURITY_KEY},
                timeout=5
            )
            
            if response.status_code == 200:
                self.authenticated = True
                self.offline_mode = False
                print("✅ Authenticated with cloud")
                return True
        except Exception as e:
            print(f"⚠️  Authentication failed: {e}")
            self.offline_mode = True
        
        return False
    
    def read_sensors(self) -> List[Dict]:
        """Read sensor data (mock implementation)"""
        # In production, read from actual sensors via GPIO/I2C/SPI
        readings = [
            {
                "sensorId": "sensor-001",
                "timestamp": datetime.now().isoformat(),
                "type": "soil_moisture",
                "value": 65.5,
                "unit": "%",
                "quality": "good"
            },
            {
                "sensorId": "sensor-002",
                "timestamp": datetime.now().isoformat(),
                "type": "temperature",
                "value": 25.3,
                "unit": "°C",
                "quality": "good"
            }
        ]
        
        # Store locally
        cursor = self.db.cursor()
        for reading in readings:
            cursor.execute('''
                INSERT INTO sensor_readings 
                (sensor_id, timestamp, type, value, unit, quality)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                reading["sensorId"],
                reading["timestamp"],
                reading["type"],
                reading["value"],
                reading["unit"],
                reading["quality"]
            ))
        self.db.commit()
        
        return readings
    
    def sync_to_cloud(self):
        """Sync local data to cloud"""
        if not self.authenticated:
            if not self.authenticate():
                return
        
        try:
            # Sync sensor readings
            cursor = self.db.cursor()
            cursor.execute('''
                SELECT id, sensor_id, timestamp, type, value, unit, quality
                FROM sensor_readings WHERE synced = 0 LIMIT 100
            ''')
            
            readings = cursor.fetchall()
            if readings:
                data = [{
                    "sensorId": r[1],
                    "timestamp": r[2],
                    "type": r[3],
                    "value": r[4],
                    "unit": r[5],
                    "quality": r[6]
                } for r in readings]
                
                response = requests.post(
                    f"{CLOUD_URL}/api/sensors/readings",
                    json=data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    # Mark as synced
                    ids = [r[0] for r in readings]
                    cursor.execute(f'''
                        UPDATE sensor_readings 
                        SET synced = 1 
                        WHERE id IN ({','.join('?' * len(ids))})
                    ''', ids)
                    self.db.commit()
                    print(f"✅ Synced {len(readings)} readings")
        
        except Exception as e:
            print(f"⚠️  Sync failed: {e}")
            self.offline_mode = True
    
    def fetch_schedules(self):
        """Fetch schedules from cloud"""
        if not self.authenticated:
            return
        
        try:
            response = requests.get(
                f"{CLOUD_URL}/api/irrigation/schedules",
                timeout=5
            )
            
            if response.status_code == 200:
                schedules = response.json().get("data", [])
                
                # Store locally
                cursor = self.db.cursor()
                for schedule in schedules:
                    cursor.execute('''
                        INSERT OR REPLACE INTO schedules
                        (id, zone_id, start_time, duration, flow_rate, status)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        schedule["id"],
                        schedule["zoneId"],
                        schedule["startTime"],
                        schedule["duration"],
                        schedule["flowRate"],
                        schedule["status"]
                    ))
                self.db.commit()
                print(f"✅ Fetched {len(schedules)} schedules")
        
        except Exception as e:
            print(f"⚠️  Failed to fetch schedules: {e}")
    
    def execute_schedules(self):
        """Execute pending schedules"""
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT id, zone_id, start_time, duration, flow_rate
            FROM schedules 
            WHERE status = 'pending' AND executed = 0
            AND datetime(start_time) <= datetime('now')
        ''')
        
        schedules = cursor.fetchall()
        
        for schedule in schedules:
            schedule_id, zone_id, start_time, duration, flow_rate = schedule
            print(f"🚿 Executing schedule {schedule_id} for zone {zone_id}")
            
            # In production: control actual valves/pumps via GPIO
            # GPIO.output(VALVE_PIN, GPIO.HIGH)
            # time.sleep(duration * 60)
            # GPIO.output(VALVE_PIN, GPIO.LOW)
            
            # Mark as executed
            cursor.execute('''
                UPDATE schedules 
                SET executed = 1, status = 'completed'
                WHERE id = ?
            ''', (schedule_id,))
            self.db.commit()
    
    def cleanup_old_data(self):
        """Clean up old synced data"""
        cursor = self.db.cursor()
        cursor.execute('''
            DELETE FROM sensor_readings 
            WHERE synced = 1 AND datetime(timestamp) < datetime('now', '-7 days')
        ''')
        deleted = cursor.rowcount
        self.db.commit()
        
        if deleted > 0:
            print(f"🧹 Cleaned up {deleted} old readings")
    
    def run(self):
        """Main loop"""
        print("🚀 Edge Controller starting...")
        
        last_sensor_read = 0
        last_sync = 0
        last_cleanup = 0
        
        while True:
            try:
                current_time = time.time()
                
                # Read sensors every 5 minutes
                if current_time - last_sensor_read >= SENSOR_INTERVAL:
                    print("📊 Reading sensors...")
                    self.read_sensors()
                    last_sensor_read = current_time
                
                # Sync every minute
                if current_time - last_sync >= SYNC_INTERVAL:
                    print("☁️  Syncing to cloud...")
                    self.sync_to_cloud()
                    self.fetch_schedules()
                    last_sync = current_time
                
                # Execute schedules
                self.execute_schedules()
                
                # Cleanup old data every hour
                if current_time - last_cleanup >= 3600:
                    self.cleanup_old_data()
                    last_cleanup = current_time
                
                # Sleep for a bit
                time.sleep(10)
            
            except KeyboardInterrupt:
                print("\n👋 Shutting down...")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(10)
        
        self.db.close()

if __name__ == "__main__":
    controller = EdgeController()
    controller.run()
