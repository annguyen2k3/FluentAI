## Mục tiêu tổng quát

Xây dựng thành công một hệ thống website hoàn chỉnh, tích hợp Trí tuệ nhân tạo để tạo ra một môi trường học tiếng Anh tương tác, giúp người dùng chủ động luyện tập và cải thiện toàn diện các kỹ năng Viết, Nói, Nghe và Từ vựng thông qua cơ chế phản hồi thông minh, tức thì và được cá nhân hóa.

## Mục tiêu cụ thể

Để đạt được mục tiêu tổng quát, đề tài sẽ tập trung thực hiện các mục tiêu cụ thể sau:

Xây dựng các chức năng luyện tập cốt lõi cho người dùng:

- Phát triển chức năng Luyện kỹ năng Viết: Cho phép người dùng luyện dịch Việt-Anh theo từng câu hoặc cả đoạn văn. Hệ thống AI sẽ phân tích bản dịch, chỉ ra lỗi sai ở cấp độ từ/cụm từ, giải thích chi tiết về ngữ pháp, cách dùng từ và đưa ra gợi ý cải thiện.
- Phát triển chức năng Luyện kỹ năng Nói: Cung cấp các bài luyện phát âm theo chủ đề và trình độ. Hệ thống AI sẽ sử dụng công nghệ nhận dạng giọng nói để phân tích file ghi âm, chỉ rõ các từ phát âm đúng/sai và đưa ra hướng dẫn cụ thể để sửa lỗi.
- Phát triển chức năng Luyện kỹ năng Nghe: Cung cấp các bài luyện tập để người dùng có thể luyện Nghe và chép lại các câu nghe được. Hệ thống sẽ chỉ ra kết quả đúng hay sai.
- Phát triển chức năng Từ điển cá nhân: Xây dựng một công cụ để người dùng có thể lưu, quản lý và ôn tập từ vựng. Tích hợp AI để cung cấp bài giảng sâu về từ (ví dụ, đồng nghĩa, trái nghĩa) và tạo các bài kiểm tra trắc nghiệm cá nhân hóa.

Xây dựng hệ thống quản trị (Admin Panel) toàn diện:

- Phát triển chức năng Quản lý nội dung học tập: Cung cấp giao diện cho Quản trị viên để quản lý ngân hàng câu, đoạn văn, chủ đề, trình độ, đảm bảo nguồn học liệu luôn phong phú và chất lượng.
- Phát triển các chức năng quản lý hệ thống: Bao gồm quản lý người dùng, xem thống kê, giám sát hoạt động của hệ thống AI để đảm bảo website vận hành ổn định và hiệu quả.
- Nghiên cứu và tích hợp hiệu quả các mô hình AI:
- Tích hợp thành công các API từ Mô hình ngôn ngữ lớn (LLMs) để xử lý các tác vụ liên quan đến phân tích văn bản, chấm lỗi và đưa ra gợi ý trong kỹ năng Viết và Từ vựng.
- Tích hợp API nhận dạng giọng nói (Speech-to-Text) để phân tích và đánh giá độ chính xác trong phát âm của người dùng.

## Công nghệ sử dụng

Ứng dụng sẽ sử dụng template engineer của NodeJs để Render giao diện phía máy chủ:

1. Giao diện: Pug, CSS, JS, Bootstrap.
2. Server: NodeJs/Express + Typescript
3. Database: MongoDB
