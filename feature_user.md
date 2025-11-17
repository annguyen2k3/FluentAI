# Chức năng chính của người dùng cuối (End-user)

| STT | Module            | Tính năng                      | Mô tả chi tiết                                                        | Tiến độ thực hiện | Ghi chú                                                   |
| --- | ----------------- | ------------------------------ | --------------------------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| 1   | Đăng nhập/Đăng ký | Đăng ký tài khoản              | Người dùng tạo tài khoản mới với email và mật khẩu                    | Hoàn thành        | Có gửi mã xác thực qua email                              |
| 2   | Đăng nhập/Đăng ký | Đăng nhập                      | Đăng nhập vào hệ thống bằng email/mật khẩu hoặc đăng nhập bằng Google | Hoàn thành        | Hỗ trợ OAuth Google                                       |
| 3   | Đăng nhập/Đăng ký | Quên mật khẩu                  | Đặt lại mật khẩu mới khi quên                                         | Hoàn thành        | Gửi OTP reset qua email, xác nhận và đặt lại mật khẩu mới |
| 4   | Tài khoản         | Bảng điều khiển cá nhân        | Tổng quan hoạt động, thống kê cá nhân, xếp hạng                       | Hoàn thành        | Hiển thị số ngày hoạt động, điểm tích góp, xếp hạng tháng |
| 5   | Tài khoản         | Xem hồ sơ cá nhân              | Xem thông tin cá nhân                                                 | Hoàn thành        | Có thể cập nhật thông tin                                 |
| 6   | Tài khoản         | Cập nhật thông tin             | Cập nhật thông tin cá nhân, thay đổi mật khẩu                         | Hoàn thành        | Cập nhật username, ngày sinh, số điện thoại, giới tính    |
| 7   | Tài khoản         | Cập nhật avatar                | Thay đổi avatar cá nhân                                               | Hoàn thành        | Upload file ảnh lên cloud lưu trữ (S3)                    |
| 8   | Tài khoản         | Đăng xuất                      | Thoát khỏi tài khoản                                                  | Hoàn thành        | Xóa session và cookies                                    |
| 9   | Luyện viết câu    | Chọn bài học có trong hệ thống | Chọn cấp độ và chủ đề từ danh sách có sẵn trong hệ thống              | Hoàn thành        | Hiển thị danh sách bài học theo cấp độ và chủ đề đã chọn  |
| 10  | Luyện viết câu    | AI tạo bài học                 | Nhập chủ đề tùy chỉnh, AI tự động tạo danh sách câu luyện tập         | Hoàn thành        | Có thể xem trước và tạo lại nếu không hài lòng            |
| 11  | Luyện viết câu    | Phòng luyện tập                | Vào phòng luyện tập với bài học đã chọn, dịch từng câu                | Hoàn thành        | Hiển thị tiến độ, điểm số, xu thưởng                      |
| 12  | Luyện viết câu    | Đánh giá từng câu              | Nộp bài dịch và nhận đánh giá chi tiết từ AI cho từng câu             | Hoàn thành        | AI phân tích ngữ pháp, từ vựng, gợi ý cải thiện           |
| 13  | Luyện viết câu    | Xem đánh giá tổng quan         | Xem feedback tổng quan sau khi hoàn thành tất cả câu trong bài học    | Hoàn thành        | Hiển thị đánh giá tổng hợp dưới dạng HTML                 |
| 14  | Luyện viết đoạn   | Chọn bài học có trong hệ thống | Chọn cấp độ, loại nội dung và chủ đề từ danh sách có sẵn              | Hoàn thành        | Hiển thị danh sách đoạn văn theo bộ lọc đã chọn           |
| 15  | Luyện viết đoạn   | AI tạo bài học từ chủ đề       | Nhập chủ đề tùy chỉnh, AI tự động tạo đoạn văn để luyện dịch          | Hoàn thành        | Có thể xem trước và tạo lại nếu không hài lòng            |
| 16  | Luyện viết đoạn   | AI tạo bài học từ nội dung     | Nhập đoạn văn tiếng Việt, AI xử lý và tạo bài học luyện dịch          | Hoàn thành        | Hỗ trợ nhập đoạn văn từ 3-8 câu                           |
| 17  | Luyện viết đoạn   | Phòng luyện tập                | Vào phòng luyện tập với đoạn văn đã chọn, dịch từng câu trong đoạn    | Hoàn thành        | Hiển thị tiến độ, điểm số, xu thưởng, gợi ý từ vựng       |
| 18  | Luyện viết đoạn   | Đánh giá từng câu              | Nộp bài dịch và nhận đánh giá chi tiết từ AI cho từng câu             | Hoàn thành        | AI phân tích ngữ pháp, từ vựng, gợi ý cải thiện           |
| 19  | Luyện viết đoạn   | Xem đánh giá tổng quan         | Xem feedback tổng quan sau khi hoàn thành tất cả câu trong đoạn văn   | Hoàn thành        | Hiển thị đánh giá tổng hợp dưới dạng HTML                 |
