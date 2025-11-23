# Tài liệu Yêu cầu - Hệ thống IoT Tưới Tiêu Nông Nghiệp Thông Minh

## Giới thiệu

Hệ thống IoT Tưới Tiêu Nông Nghiệp Thông Minh là một giải pháp tự động hóa toàn diện nhằm tối ưu hóa việc sử dụng nước, giảm chi phí nhân công, và tăng năng suất cây trồng thông qua việc giám sát môi trường liên tục và điều khiển tưới tiêu thông minh. Hệ thống được thiết kế theo kiến trúc microservices để đảm bảo khả năng mở rộng và triển khai CI/CD.

## Bảng thuật ngữ (Glossary)

- **Hệ thống IoT**: Hệ thống Internet of Things bao gồm các cảm biến, bộ điều khiển, và phần mềm quản lý
- **Bộ điều khiển trung tâm**: Thiết bị máy tính nhúng thu thập và xử lý dữ liệu từ cảm biến
- **Cảm biến môi trường**: Thiết bị đo lường các thông số như nhiệt độ, độ ẩm đất, pH, ánh sáng
- **Module tưới tiêu**: Hệ thống van nước và máy bơm được điều khiển tự động
- **API Gateway**: Điểm truy cập trung tâm cho các microservices
- **Dashboard quản lý**: Giao diện web/mobile để giám sát và điều khiển hệ thống
- **Vùng tưới**: Khu vực canh tác được phân chia để quản lý tưới tiêu riêng biệt
- **Lịch trình tưới**: Kế hoạch tưới tự động được tính toán dựa trên nhu cầu cây trồng
- **Chế độ Offline**: Chế độ hoạt động độc lập khi mất kết nối Internet
- **Microservice**: Dịch vụ độc lập thực hiện một chức năng cụ thể trong hệ thống

## Yêu cầu

### Yêu cầu 1: Giám sát môi trường và thu thập dữ liệu

**User Story:** Là một người nông dân, tôi muốn hệ thống tự động giám sát các thông số môi trường, để tôi có thể nắm bắt tình trạng đất và khí hậu mà không cần kiểm tra thủ công.

#### Tiêu chí chấp nhận

1. WHEN cảm biến đo lường thông số môi trường THEN Bộ điều khiển trung tâm SHALL thu thập dữ liệu nhiệt độ, độ ẩm đất, độ pH, ánh sáng, và CO2 mỗi 5 phút
2. WHEN dữ liệu cảm biến được thu thập THEN Bộ điều khiển trung tâm SHALL áp dụng hệ số hiệu chuẩn và lọc nhiễu trước khi lưu trữ
3. WHEN dữ liệu cảm biến nằm ngoài phạm vi hợp lệ THEN Hệ thống IoT SHALL ghi nhật ký lỗi và đánh dấu cảm biến cần bảo trì
4. WHEN kết nối Internet khả dụng THEN Bộ điều khiển trung tâm SHALL đồng bộ dữ liệu đã lưu trữ cục bộ lên máy chủ đám mây trong vòng 1 phút
5. WHILE mất kết nối Internet THEN Bộ điều khiển trung tâm SHALL lưu trữ dữ liệu cục bộ và tiếp tục hoạt động theo lịch trình đã lập

### Yêu cầu 2: Tích hợp dự báo thời tiết

**User Story:** Là một quản lý trang trại, tôi muốn hệ thống tích hợp dữ liệu dự báo thời tiết, để lịch trình tưới có thể điều chỉnh dựa trên khả năng mưa và nhiệt độ dự kiến.

#### Tiêu chí chấp nhận

1. WHEN Hệ thống IoT khởi động THEN API Gateway SHALL kết nối với dịch vụ dự báo thời tiết bên ngoài
2. WHEN dữ liệu dự báo thời tiết được truy xuất THEN Hệ thống IoT SHALL lưu trữ thông tin nhiệt độ, lượng mưa dự kiến, và độ ẩm không khí cho 7 ngày tới
3. WHEN dự báo có mưa lớn trong 24 giờ tới THEN Module tưới tiêu SHALL hủy hoặc hoãn lịch trình tưới đã lập
4. WHEN không thể kết nối dịch vụ dự báo thời tiết THEN Hệ thống IoT SHALL sử dụng dữ liệu dự báo đã lưu trữ gần nhất

### Yêu cầu 3: Tính toán nhu cầu nước thông minh

**User Story:** Là một chuyên gia nông học, tôi muốn hệ thống tính toán chính xác nhu cầu nước cho từng loại cây trồng, để đảm bảo cây được tưới đúng lượng nước cần thiết.

#### Tiêu chí chấp nhận

1. WHEN người dùng cấu hình thông tin cây trồng cho vùng tưới THEN Dashboard quản lý SHALL lưu trữ loại cây, giai đoạn sinh trưởng, và hệ số thoát hơi nước
2. WHEN Module tưới tiêu tính toán nhu cầu nước THEN Module tưới tiêu SHALL sử dụng độ ẩm đất hiện tại, loại cây trồng, giai đoạn sinh trưởng, và dự báo thời tiết
3. WHEN độ ẩm đất thấp hơn ngưỡng tối thiểu cho loại cây THEN Module tưới tiêu SHALL tính toán lượng nước cần bù đắp
4. WHEN nhiệt độ cao và độ ẩm không khí thấp THEN Module tưới tiêu SHALL tăng hệ số thoát hơi nước trong công thức tính toán

### Yêu cầu 4: Lập lịch trình tưới tự động

**User Story:** Là một người nông dân, tôi muốn hệ thống tự động lập lịch trình tưới cho các vùng khác nhau, để tôi không phải lên kế hoạch thủ công mỗi ngày.

#### Tiêu chí chấp nhận

1. WHEN Module tưới tiêu xác định nhu cầu nước cho vùng tưới THEN Module tưới tiêu SHALL tạo lịch trình tưới với thời gian bắt đầu, thời lượng, và lưu lượng nước
2. WHEN nhiều vùng tưới cần tưới cùng lúc THEN Module tưới tiêu SHALL phân bổ thời gian tưới để tránh xung đột tài nguyên
3. WHEN nguồn nước không đủ cho tất cả vùng tưới THEN Module tưới tiêu SHALL ưu tiên vùng có cây trồng quan trọng hơn
4. WHEN lịch trình tưới được tạo THEN Module tưới tiêu SHALL kiểm tra xung đột với lịch trình hiện có trước khi lưu
5. WHEN thời gian tưới tối ưu là sáng sớm hoặc chiều mát THEN Module tưới tiêu SHALL ưu tiên lập lịch trong khung giờ 5-8h sáng hoặc 17-19h chiều

### Yêu cầu 5: Điều khiển tưới tiêu tự động

**User Story:** Là một người nông dân, tôi muốn hệ thống tự động bật/tắt van nước và máy bơm theo lịch trình, để tôi không phải thao tác thủ công.

#### Tiêu chí chấp nhận

1. WHEN thời gian trong lịch trình tưới đến THEN Bộ điều khiển trung tâm SHALL gửi lệnh mở van nước cho vùng tưới tương ứng
2. WHEN van nước được mở THEN Bộ điều khiển trung tâm SHALL kích hoạt máy bơm với lưu lượng đã cấu hình
3. WHEN thời lượng tưới hoàn tất THEN Bộ điều khiển trung tâm SHALL gửi lệnh đóng van nước và tắt máy bơm
4. WHEN lệnh điều khiển không được thiết bị xác nhận trong 10 giây THEN Bộ điều khiển trung tâm SHALL thử gửi lại lệnh tối đa 3 lần
5. WHEN thiết bị không phản hồi sau 3 lần thử THEN Hệ thống IoT SHALL tạo cảnh báo lỗi thiết bị và ghi nhật ký

### Yêu cầu 6: Điều khiển từ xa qua Dashboard

**User Story:** Là một quản lý trang trại, tôi muốn điều khiển hệ thống tưới từ xa qua điện thoại hoặc máy tính, để tôi có thể can thiệp khi cần thiết mà không cần có mặt tại trang trại.

#### Tiêu chí chấp nhận

1. WHEN người dùng đăng nhập vào Dashboard quản lý THEN API Gateway SHALL xác thực thông tin đăng nhập và cấp token truy cập
2. WHEN người dùng gửi lệnh bật/tắt van nước thủ công THEN API Gateway SHALL chuyển lệnh đến Bộ điều khiển trung tâm trong vòng 5 giây
3. WHEN người dùng ghi đè lịch trình tưới THEN Dashboard quản lý SHALL lưu lịch trình mới và đánh dấu là điều chỉnh thủ công
4. WHEN người dùng xem trạng thái thiết bị THEN Dashboard quản lý SHALL hiển thị dữ liệu cập nhật trong vòng 1 phút
5. WHEN người dùng không có quyền điều khiển THEN API Gateway SHALL từ chối yêu cầu và trả về mã lỗi 403

### Yêu cầu 7: Quản lý tài nguyên nước

**User Story:** Là một quản lý tài nguyên, tôi muốn giám sát mức nước sẵn có và phân bổ hợp lý, để đảm bảo không lãng phí nước và ưu tiên vùng quan trọng khi thiếu nước.

#### Tiêu chí chấp nhận

1. WHEN người dùng cấu hình nguồn nước THEN Dashboard quản lý SHALL lưu trữ dung lượng tối đa, mức nước hiện tại, và tốc độ bơm
2. WHEN cảm biến mức nước đo lường THEN Bộ điều khiển trung tâm SHALL cập nhật mức nước sẵn có mỗi 10 phút
3. WHEN mức nước thấp hơn 20% dung lượng THEN Hệ thống IoT SHALL tạo cảnh báo thiếu nước và gửi thông báo đến người dùng
4. WHEN mức nước không đủ cho tất cả vùng tưới THEN Module tưới tiêu SHALL kích hoạt chế độ tiết kiệm nước và ưu tiên vùng quan trọng
5. WHEN chế độ tiết kiệm nước được kích hoạt THEN Module tưới tiêu SHALL giảm 30% lượng nước cho các vùng không ưu tiên

### Yêu cầu 8: Phát hiện bất thường và cảnh báo

**User Story:** Là một người nông dân, tôi muốn nhận cảnh báo khi có bất thường về môi trường hoặc thiết bị, để tôi có thể xử lý kịp thời và tránh thiệt hại.

#### Tiêu chí chấp nhận

1. WHEN thông số môi trường vượt ngưỡng cảnh báo THEN Hệ thống IoT SHALL tạo cảnh báo với mức độ ưu tiên (thấp, trung bình, cao)
2. WHEN cảnh báo được tạo THEN API Gateway SHALL gửi thông báo đến Dashboard quản lý và ứng dụng mobile trong vòng 30 giây
3. WHEN cảm biến không gửi dữ liệu trong 15 phút THEN Hệ thống IoT SHALL tạo cảnh báo lỗi cảm biến
4. WHEN van nước hoặc máy bơm không hoạt động đúng THEN Bộ điều khiển trung tâm SHALL tạo cảnh báo lỗi thiết bị
5. WHEN người dùng xác nhận cảnh báo THEN Dashboard quản lý SHALL đánh dấu cảnh báo đã xử lý và lưu ghi chú

### Yêu cầu 9: Báo cáo và phân tích dữ liệu

**User Story:** Là một chuyên gia nông học, tôi muốn xem báo cáo và biểu đồ về lịch sử tưới tiêu và môi trường, để tôi có thể phân tích xu hướng và tối ưu hóa quy trình.

#### Tiêu chí chấp nhận

1. WHEN người dùng yêu cầu báo cáo THEN Dashboard quản lý SHALL tạo báo cáo với dữ liệu lịch sử từ khoảng thời gian được chọn
2. WHEN báo cáo được tạo THEN Dashboard quản lý SHALL hiển thị biểu đồ nhiệt độ, độ ẩm đất, lượng nước sử dụng, và số lần tưới
3. WHEN người dùng xuất báo cáo THEN Dashboard quản lý SHALL tạo file PDF hoặc CSV chứa dữ liệu chi tiết
4. WHEN dữ liệu lịch sử được phân tích THEN Dashboard quản lý SHALL hiển thị xu hướng và đề xuất cải tiến
5. WHEN người dùng so sánh nhiều vùng tưới THEN Dashboard quản lý SHALL hiển thị biểu đồ so sánh hiệu quả sử dụng nước

### Yêu cầu 10: Quản lý thiết bị và người dùng

**User Story:** Là một quản trị viên hệ thống, tôi muốn quản lý thiết bị và phân quyền người dùng, để đảm bảo hệ thống hoạt động an toàn và hiệu quả.

#### Tiêu chí chấp nhận

1. WHEN quản trị viên thêm thiết bị mới THEN Dashboard quản lý SHALL đăng ký thiết bị với ID duy nhất và khóa bảo mật
2. WHEN thiết bị kết nối lần đầu THEN API Gateway SHALL xác thực thiết bị bằng khóa bảo mật trước khi cho phép giao tiếp
3. WHEN quản trị viên cập nhật firmware thiết bị THEN Hệ thống IoT SHALL tải firmware mới xuống Bộ điều khiển trung tâm và cài đặt
4. WHEN quản trị viên tạo tài khoản người dùng THEN Dashboard quản lý SHALL gán vai trò (nông dân, quản lý, chuyên gia, kỹ thuật viên)
5. WHEN người dùng truy cập chức năng THEN API Gateway SHALL kiểm tra quyền dựa trên vai trò trước khi cho phép thực hiện

### Yêu cầu 11: Kiến trúc Microservices và khả năng mở rộng

**User Story:** Là một kiến trúc sư hệ thống, tôi muốn hệ thống được thiết kế theo kiến trúc microservices, để dễ dàng mở rộng và bảo trì khi số lượng trang trại tăng lên.

#### Tiêu chí chấp nhận

1. WHEN Hệ thống IoT được triển khai THEN Hệ thống IoT SHALL bao gồm các microservices độc lập: Sensor Service, Irrigation Service, Weather Service, Alert Service, User Service, Device Service
2. WHEN một microservice gặp lỗi THEN các microservices khác SHALL tiếp tục hoạt động bình thường
3. WHEN tải hệ thống tăng THEN Hệ thống IoT SHALL tự động mở rộng số lượng instance của microservice bị quá tải
4. WHEN microservices giao tiếp với nhau THEN Hệ thống IoT SHALL sử dụng message queue hoặc REST API qua API Gateway
5. WHEN microservice được cập nhật THEN Hệ thống IoT SHALL triển khai phiên bản mới mà không gián đoạn dịch vụ (zero-downtime deployment)

### Yêu cầu 12: CI/CD và tự động hóa triển khai

**User Story:** Là một kỹ sư DevOps, tôi muốn hệ thống có quy trình CI/CD tự động, để đảm bảo mỗi thay đổi code được kiểm tra và triển khai nhanh chóng, an toàn.

#### Tiêu chí chấp nhận

1. WHEN developer commit code lên repository THEN CI pipeline SHALL tự động chạy unit tests và integration tests
2. WHEN tất cả tests pass THEN CI pipeline SHALL build Docker images cho các microservices
3. WHEN Docker images được build thành công THEN CD pipeline SHALL triển khai lên môi trường staging để kiểm tra
4. WHEN kiểm tra staging thành công THEN CD pipeline SHALL triển khai lên môi trường production với chiến lược blue-green hoặc canary
5. WHEN triển khai production thất bại THEN CD pipeline SHALL tự động rollback về phiên bản ổn định trước đó

### Yêu cầu 13: Hiệu năng và độ tin cậy

**User Story:** Là một người dùng hệ thống, tôi muốn hệ thống phản hồi nhanh và hoạt động ổn định, để tôi có thể tin tưởng vào các quyết định tưới tiêu tự động.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi lệnh điều khiển từ Dashboard quản lý THEN Bộ điều khiển trung tâm SHALL nhận và thực thi lệnh trong vòng 5 giây
2. WHEN Dashboard quản lý yêu cầu dữ liệu mới nhất THEN API Gateway SHALL trả về dữ liệu trong vòng 1 phút
3. WHEN Hệ thống IoT thu thập dữ liệu cảm biến THEN Hệ thống IoT SHALL đảm bảo độ chính xác 99.9% cho dữ liệu đã lưu trữ
4. WHEN máy chủ xử lý dữ liệu THEN máy chủ SHALL xử lý được ít nhất 1000 bản ghi cảm biến mỗi giây
5. WHEN Hệ thống IoT hoạt động liên tục THEN Hệ thống IoT SHALL đạt uptime tối thiểu 99.5% trong một tháng

### Yêu cầu 14: Hoạt động Offline và đồng bộ dữ liệu

**User Story:** Là một người nông dân ở vùng sâu vùng xa, tôi muốn hệ thống vẫn hoạt động khi mất kết nối Internet, để việc tưới tiêu không bị gián đoạn.

#### Tiêu chí chấp nhận

1. WHILE mất kết nối Internet THEN Bộ điều khiển trung tâm SHALL tiếp tục thực hiện lịch trình tưới đã lập trước đó
2. WHILE mất kết nối Internet THEN Bộ điều khiển trung tâm SHALL lưu trữ dữ liệu cảm biến và nhật ký hoạt động vào bộ nhớ cục bộ
3. WHEN kết nối Internet được khôi phục THEN Bộ điều khiển trung tâm SHALL đồng bộ tất cả dữ liệu đã lưu trữ cục bộ lên máy chủ đám mây
4. WHEN đồng bộ dữ liệu THEN Hệ thống IoT SHALL giải quyết xung đột nếu có thay đổi từ cả local và cloud
5. WHEN bộ nhớ cục bộ đầy 80% THEN Bộ điều khiển trung tâm SHALL xóa dữ liệu cũ nhất đã được đồng bộ thành công

### Yêu cầu 15: Bảo mật và xác thực

**User Story:** Là một quản trị viên hệ thống, tôi muốn hệ thống được bảo mật chặt chẽ, để ngăn chặn truy cập trái phép và bảo vệ dữ liệu nhạy cảm.

#### Tiêu chí chấp nhận

1. WHEN người dùng đăng nhập THEN API Gateway SHALL xác thực bằng username/password và trả về JWT token có thời hạn
2. WHEN API nhận request THEN API Gateway SHALL xác thực JWT token trước khi chuyển request đến microservice
3. WHEN dữ liệu được truyền giữa thiết bị và máy chủ THEN Hệ thống IoT SHALL mã hóa dữ liệu bằng TLS/SSL
4. WHEN dữ liệu nhạy cảm được lưu trữ THEN Hệ thống IoT SHALL mã hóa dữ liệu trong database
5. WHEN phát hiện nhiều lần đăng nhập thất bại THEN API Gateway SHALL khóa tài khoản tạm thời trong 15 phút
