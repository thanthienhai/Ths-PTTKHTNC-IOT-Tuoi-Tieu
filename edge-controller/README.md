# Edge Controller

Python-based edge controller for Raspberry Pi/ESP32 devices.

## Features

- Local sensor data collection
- Offline irrigation scheduling
- Device control (valves, pumps)
- Cloud synchronization
- Local SQLite storage

## Hardware Requirements

- Raspberry Pi 4 (2GB+ RAM) or ESP32
- SD Card (16GB+ recommended)
- Sensors: Soil moisture, temperature, pH, light
- Actuators: Solenoid valves, water pumps
- Power supply

## Setup

```bash
cd edge-controller
pip install -r requirements.txt
python main.py
```

## Configuration

Edit `config.yml` with:
- Cloud server URL
- Device credentials
- Sensor configurations
- GPIO pin mappings

This component will be implemented in task 13.
