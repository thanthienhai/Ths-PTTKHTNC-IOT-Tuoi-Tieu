### 1. Tài liệu Yêu cầu Kinh doanh (Business Requirements Document - BRD)

Tài liệu này định nghĩa rõ ràng vấn đề và giá trị cốt lõi mà hệ thống mang lại.

**1.1. Bối cảnh & Vấn đề (Problem Statement)**
* [cite_start]**Thách thức vĩ mô:** Dân số tăng, diện tích đất canh tác thu hẹp, biến đổi khí hậu và thời tiết cực đoan (lũ lụt, xâm nhập mặn)[cite: 198, 199].
* **Hạn chế quy trình hiện tại:**
    * [cite_start]Phương pháp tưới truyền thống dựa trên cảm tính hoặc lịch cố định gây lãng phí nước và năng lượng[cite: 202].
    * [cite_start]Chi phí nhân công cao cho việc giám sát và vận hành thủ công[cite: 202].
    * [cite_start]Tưới không chính xác gây mất cân bằng sinh lý cây trồng (thừa/thiếu nước), làm giảm năng suất và chất lượng nông sản[cite: 203].

**1.2. Mục tiêu Dự án (Project Objectives)**
* [cite_start]**Tự động hóa:** Loại bỏ thao tác thủ công, giảm tải sức lao động cho người nông dân[cite: 212, 215].
* [cite_start]**Tiết kiệm tài nguyên:** Chỉ kích hoạt tưới khi cần thiết, tối ưu hóa lượng nước sử dụng cho từng khu vực[cite: 218, 220].
* [cite_start]**Tăng năng suất:** Cung cấp nước chính xác theo nhu cầu từng loại cây và giai đoạn phát triển[cite: 223, 224].
* [cite_start]**Quản trị thông minh:** Cho phép giám sát và điều khiển từ xa qua điện thoại/máy tính[cite: 227].

---

### 2. Tài liệu Đặc tả Yêu cầu Hệ thống (SRS)

**2.1. Các thành phần hệ thống (System Components)**
* [cite_start]**Thiết bị cảm biến:** Đo nhiệt độ, độ ẩm, độ pH, chất lượng nước, độ bão hòa đất, ánh sáng, CO2[cite: 240, 255].
* [cite_start]**Thiết bị thu thập dữ liệu:** Máy tính nhúng hoặc bộ điều khiển để thu thập và chuyển dữ liệu[cite: 242, 243].
* [cite_start]**Hệ thống điều khiển:** Quản lý thiết bị, phân tích và ra quyết định, hỗ trợ điều khiển từ xa qua Internet[cite: 244, 245].
* [cite_start]**Phần mềm phân tích:** Cung cấp báo cáo, biểu đồ và dự đoán[cite: 248].

**2.2. Yêu cầu Chức năng (Functional Requirements)**

* **F-01: Giám sát môi trường & Thu thập dữ liệu**
    * [cite_start]Hệ thống phải liên tục giám sát thông số đất và khí hậu[cite: 254, 255].
    * [cite_start]Tích hợp dữ liệu dự báo thời tiết từ trạm dự báo[cite: 256].
    * [cite_start]Cho phép hiệu chuẩn cảm biến để đảm bảo độ chính xác[cite: 257].

* **F-02: Lập kế hoạch & Điều khiển tưới tiêu**
    * [cite_start]Tính toán nhu cầu nước dựa trên loại cây trồng và dữ liệu môi trường[cite: 259, 261].
    * [cite_start]Lập lịch tưới tự động theo khu vực[cite: 260].
    * [cite_start]Tự động điều khiển van nước và máy bơm[cite: 214].

* **F-03: Quản lý tài nguyên nước**
    * [cite_start]Giám sát mức độ sẵn có và phân bổ nguồn nước[cite: 263].
    * [cite_start]Triển khai chiến lược bảo tồn khi nguồn nước hạn chế[cite: 264].

* **F-04: Quản trị hệ thống & Báo cáo**
    * [cite_start]Quản lý thiết bị (đăng ký, cập nhật firmware) và người dùng[cite: 267, 268, 269].
    * [cite_start]Phát hiện bất thường sức khỏe cây trồng và đưa ra khuyến nghị[cite: 272, 273].

**2.3. Yêu cầu Phi chức năng (Non-functional Requirements)**

* **Hiệu năng (Performance):**
    * [cite_start]Độ trễ điều khiển (từ App đến thiết bị thực thi): < 5 giây[cite: 279].
    * [cite_start]Độ trễ cập nhật dữ liệu Dashboard: < 1 phút[cite: 281].
    * [cite_start]Máy chủ xử lý được ít nhất N bản ghi/giây[cite: 282].
* **Độ tin cậy (Reliability):**
    * [cite_start]Độ chính xác thu thập dữ liệu: 99,9%[cite: 285].
    * [cite_start]**Khả năng hoạt động Offline:** Bộ điều khiển phải lưu trữ dữ liệu cục bộ và tiếp tục tưới tự động theo lịch trình ngay cả khi mất kết nối Internet[cite: 286].
* [cite_start]**Giao diện (Usability):** Trực quan, thân thiện, dễ sử dụng trên Mobile/Web[cite: 227, 228].

---

### 3. Tài liệu Đặc tả Use Case (Use Case Specification)

Dựa trên Biểu đồ Use Case (Hình 2.4.1) và mô tả chi tiết:

**3.1. Các tác nhân (Actors)**
* [cite_start]Người nông dân, Quản lý trang trại, Quản lý tài nguyên, Chuyên gia nông học, Kỹ thuật viên thực địa, Quản trị viên hệ thống [cite: 292-296].

**3.2. Chi tiết Use Case: Giám sát thực địa (UC-01)**
* **Tác nhân:** Kỹ thuật viên, Hệ thống.
* **Luồng chính:**
    1.  [cite_start]Kỹ thuật viên cấu hình và hiệu chuẩn cảm biến[cite: 300].
    2.  [cite_start]Hệ thống liên tục giám sát điều kiện đất/môi trường[cite: 302].
    3.  [cite_start]Nếu chỉ số bất thường hoặc cảm biến lỗi -> Hệ thống tạo cảnh báo[cite: 303].
    4.  [cite_start]Xuất dữ liệu thời gian thực cho chuyên gia phân tích[cite: 304].

**3.3. Chi tiết Use Case: Lập kế hoạch tưới tiêu (UC-02)**
* **Tác nhân:** Quản lý trang trại, Chuyên gia nông học, Người vận hành.
* **Luồng chính:**
    1.  [cite_start]Quản lý xác định nhu cầu nước theo loại cây và giai đoạn sinh trưởng[cite: 318].
    2.  [cite_start]Cấu hình vùng tưới phù hợp địa hình[cite: 321].
    3.  [cite_start]Hệ thống tạo lịch tưới tối ưu dựa trên nhu cầu và dự báo thời tiết[cite: 323].
    4.  [cite_start]Chuyên gia nông học rà soát xung đột tiềm ẩn[cite: 324].
* [cite_start]**Luồng phụ (Exception):** Người vận hành có thể "Ghi đè lịch tưới tiêu" thủ công khi cần thiết[cite: 325].

**3.4. Chi tiết Use Case: Quản lý tài nguyên nước (UC-03)**
* **Tác nhân:** Quản lý tài nguyên.
* **Luồng chính:**
    1.  [cite_start]Cấu hình nguồn nước và dung lượng[cite: 329].
    2.  [cite_start]Giám sát liên tục mức nước sẵn có[cite: 330].
    3.  [cite_start]Nếu phát hiện thiếu nước -> Tạo cảnh báo và triển khai chiến lược bảo tồn[cite: 332, 333].

---

### 4. Tài liệu Quy trình Nghiệp vụ (Business Process Flow)

Dựa trên Biểu đồ hoạt động (Activity Diagrams) để mô tả logic xử lý của hệ thống.

**4.1. Quy trình Thu thập và Xử lý dữ liệu cảm biến**
* **Bước 1: Kết nối:** Khởi tạo mạng -> Kiểm tra kết nối. [cite_start]Nếu mất kết nối: Ghi nhật ký lỗi -> Thử kết nối lại -> Gửi thông báo kỹ thuật [cite: 341-347, 352].
* **Bước 2: Xác thực:** Nếu đã kết nối -> Xác thực phạm vi dữ liệu. [cite_start]Nếu lỗi -> Ghi nhật ký, kiểm tra tình trạng cảm biến, gán cờ bảo trì[cite: 339, 350, 356, 361].
* [cite_start]**Bước 3: Xử lý:** Dữ liệu hợp lệ -> Áp dụng hệ số hiệu chuẩn -> Lọc nhiễu -> Chuẩn hóa [cite: 353-355].
* **Bước 4: Lưu trữ & Cảnh báo:** Lưu dữ liệu đã xử lý -> Kiểm tra ngưỡng vi phạm. Nếu vượt ngưỡng -> Tạo cảnh báo. [cite_start]Cuối cùng đẩy dữ liệu lên trạm sự kiện[cite: 359, 360, 365, 362].

**4.2. Quy trình Tạo lịch trình tưới tiêu thông minh**
* [cite_start]**Bước 1: Tính toán nhu cầu:** Truy xuất thông tin cây trồng/giai đoạn sinh trưởng -> Lấy độ ẩm đất hiện tại -> Tính thiếu hụt -> Lấy dự báo thời tiết -> Tính tỷ lệ thoát hơi nước -> **Xác định lượng nước cần dùng** [cite: 384-398].
* **Bước 2: Kiểm tra nguồn nước:**
    * [cite_start]Nếu **Đủ nước**: Truy xuất vùng tưới đã cấu hình[cite: 403, 405].
    * [cite_start]Nếu **Không đủ**: Ưu tiên vùng quan trọng -> Truy xuất vùng tưới[cite: 406, 407].
* **Bước 3: Lập lịch:**
    * [cite_start]Tính nhu cầu cụ thể theo vùng -> Kiểm tra khả năng đáp ứng của hệ thống[cite: 409, 410].
    * [cite_start]Nếu vượt phạm vi cho phép -> Kích hoạt chế độ tiết kiệm nước[cite: 412].
    * [cite_start]Xác định thời gian tưới phù hợp -> Kiểm tra xung đột lịch trình -> Tạo lịch trình cuối[cite: 413, 415, 414].