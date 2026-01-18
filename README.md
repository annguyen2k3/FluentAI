# FLUENT-AI - Hệ thống học tiếng Anh tích hợp AI

Hệ thống website học tiếng Anh tích hợp Trí tuệ nhân tạo, giúp người dùng luyện tập và cải thiện toàn diện các kỹ năng Viết, Nói, Nghe hướng đến giao tiếp thông qua cơ chế phản hồi thông minh và được cá nhân hóa.

**🔗 Repository:** [https://github.com/annguyen2k3/FluentAI.git](https://github.com/annguyen2k3/FluentAI.git)

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js/Express + TypeScript
- **Database**: MongoDB
- **Template Engine**: Pug
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **AI Services**: Google Gemini AI, Google Cloud Speech-to-Text, Google Cloud Text-to-Speech
- **Cloud Services**: AWS S3, Google Cloud Monitoring
- **Email Service**: Nodemailer (Gmail)

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x hoặc yarn
- MongoDB (hoặc MongoDB Atlas)
- Tài khoản Google Cloud Platform (để sử dụng Gemini AI và Speech APIs)
- Tài khoản AWS (để sử dụng S3)
- Tài khoản Gmail (để gửi email qua Nodemailer)

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone repository

```bash
git clone https://github.com/annguyen2k3/FluentAI.git FLUENT-AI
cd FLUENT-AI
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc của dự án với các biến môi trường sau:

```env
# Server Configuration
PORT=3000
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your_session_secret_key
PREFIX_ADMIN=/admin

# Database Configuration
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
DB_NAME=your_database_name

# JWT Configuration
JWT_SECRET_ACCESS_TOKEN=your_jwt_access_token_secret
JWT_SECRET_REFRESH_TOKEN=your_jwt_refresh_token_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
GOOGLE_PROJECT_ID=your_google_project_id

# AWS Configuration (S3)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket_name
URL_AVATAR_DEFAULT=your_default_avatar_url

# Nodemailer Configuration (Gmail)
NODEMAILER_EMAIL=your_gmail_address@gmail.com
NODEMAILER_PASSWORD=your_gmail_app_password
```

**Lưu ý**: 
- Thay thế các giá trị `your_*` bằng thông tin thực tế của bạn
- Đảm bảo file `.env` không được commit lên Git (đã có trong `.gitignore`)
- `SESSION_SECRET` nên là một chuỗi ngẫu nhiên mạnh để bảo mật session
- Đối với `GOOGLE_APPLICATION_CREDENTIALS`, có thể sử dụng đường dẫn tuyệt đối hoặc tương đối đến file JSON credentials

### Bước 4: Cấu hình MongoDB

#### Option 1: Sử dụng MongoDB Atlas (Khuyến nghị)

1. Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới
3. Tạo database user và lấy connection string
4. Cập nhật `DB_USERNAME`, `DB_PASSWORD`, và `DB_NAME` trong file `.env`
5. Thêm IP của bạn vào whitelist trong MongoDB Atlas

#### Option 2: Sử dụng MongoDB Local

1. Cài đặt MongoDB trên máy local
2. Cập nhật connection string trong `src/services/database.service.ts` nếu cần

### Bước 5: Cấu hình Google Cloud Platform

1. Tạo project mới trên [Google Cloud Console](https://console.cloud.google.com/)
2. Bật các API sau:
   - Generative AI API (Gemini)
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
   - Cloud Monitoring API
3. **Cấu hình Gemini AI:**
   - Lấy API Key từ [Google AI Studio](https://makersuite.google.com/app/apikey) hoặc Google Cloud Console
   - Cập nhật `GEMINI_API_KEY` trong file `.env`
4. **Cấu hình Google Cloud Services:**
   - Tạo Service Account và download file JSON credentials
   - Đặt file credentials vào thư mục dự án (ví dụ: `gen-lang-client-*.json`)
   - Cập nhật `GOOGLE_APPLICATION_CREDENTIALS` với đường dẫn đến file credentials (ví dụ: `./gen-lang-client-xxx.json`)
   - Cập nhật `GOOGLE_PROJECT_ID` với Project ID của bạn
5. **Cấu hình Google OAuth (nếu sử dụng đăng nhập bằng Google):**
   - Tạo OAuth 2.0 Client ID trong Google Cloud Console
   - Thêm `http://localhost:3000/oauth/google` vào Authorized redirect URIs
   - Cập nhật `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong file `.env`

### Bước 6: Cấu hình Nodemailer (Gmail)

1. Đăng nhập vào tài khoản Gmail của bạn
2. Bật xác thực 2 bước (2-Step Verification) nếu chưa bật
3. Tạo App Password:
   - Truy cập [Google Account Settings](https://myaccount.google.com/apppasswords)
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên ứng dụng (ví dụ: "FluentAI")
   - Copy App Password được tạo
4. Cập nhật `NODEMAILER_EMAIL` và `NODEMAILER_PASSWORD` trong file `.env`

**Lưu ý**: Sử dụng App Password, không phải mật khẩu Gmail thông thường.

### Bước 7: Cấu hình AWS S3

1. Tạo tài khoản AWS
2. Tạo S3 bucket mới
3. Tạo IAM user với quyền truy cập S3
4. Lấy Access Key ID và Secret Access Key
5. Cập nhật các biến môi trường AWS trong file `.env`:
   - `AWS_ACCESS_KEY_ID` - AWS Access Key ID
   - `AWS_SECRET_ACCESS_KEY` - AWS Secret Access Key
   - `AWS_REGION` - Region của S3 bucket (ví dụ: `ap-southeast-1`)
   - `AWS_S3_BUCKET_NAME` - Tên S3 bucket
   - `URL_AVATAR_DEFAULT` - URL đến ảnh avatar mặc định trên S3 (ví dụ: `https://your-bucket.s3.region.amazonaws.com/avatar_default.png`)

### Bước 8: Build dự án

```bash
npm run build
```

Lệnh này sẽ:
- Xóa thư mục `dist` cũ (nếu có)
- Compile TypeScript sang JavaScript
- Xử lý path aliases
- Copy các file cần thiết

### Bước 9: Khởi chạy ứng dụng

#### Development mode (với hot reload):

```bash
npm run dev
```

#### Production mode:

```bash
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

### Bước 10: Cấu hình API Endpoints (Frontend)

File `src/public/js/api_breakpoint.js` chứa tất cả các API endpoints để giao tiếp giữa frontend và backend.

**Cấu hình:**

Nếu deploy lên production, cập nhật API URL trong file này:

```javascript
const apiUrl = 'http://localhost:3000'  // Thay đổi thành SERVER_URL của bạn
const adminApiUrl = 'http://localhost:3000/admin'
```

**Sử dụng:**

```javascript
import { ApiBreakpoint } from '/js/api_breakpoint.js'
import { AdminApiBreakpoint } from '/js/api_breakpoint.js'

// Sử dụng trong fetch request
fetch(ApiBreakpoint.LOGIN, { ... })
```

## 📁 Cấu trúc thư mục

```
FLUENT-AI/
├── src/                    # Source code TypeScript
│   ├── constants/         # Các hằng số
│   ├── controllers/       # Controllers xử lý request
│   ├── middlewares/       # Middlewares
│   ├── models/            # Database models và schemas
│   ├── routes/            # Route definitions
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── views/             # Pug templates
│   └── index.ts           # Entry point
├── dist/                  # Compiled JavaScript (sau khi build)
├── public/                # Static files (CSS, JS, images)
│   └── js/
│       └── api_breakpoint.js  # File định nghĩa tất cả API endpoints
├── uploads/               # Uploaded files
├── seeds/                 # Seed data
├── scripts/               # Build scripts
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🔧 Scripts có sẵn

- `npm run dev` - Chạy ứng dụng ở chế độ development với hot reload
- `npm run build` - Build dự án từ TypeScript sang JavaScript
- `npm start` - Chạy ứng dụng ở chế độ production
- `npm run lint` - Kiểm tra lỗi code style
- `npm run lint:fix` - Tự động sửa lỗi code style
- `npm run prettier` - Kiểm tra format code
- `npm run prettier:fix` - Tự động format code

## 🔐 Bảo mật

- **JWT Secrets**: Sử dụng các chuỗi ngẫu nhiên mạnh cho JWT secrets
- **Database Credentials**: Không commit thông tin database lên Git
- **API Keys**: Bảo mật các API keys và không chia sẻ công khai
- **Environment Variables**: Luôn sử dụng file `.env` cho các biến môi trường nhạy cảm

## 📝 Ghi chú

- Hệ thống tự động tạo các indexes cần thiết khi khởi động
- Cache được load tự động cho System Config, Gemini Config và Prompt Config
- Thư mục uploads sẽ được tự động tạo nếu chưa tồn tại

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB

- Kiểm tra thông tin đăng nhập trong file `.env`
- Đảm bảo IP của bạn đã được thêm vào whitelist (nếu dùng MongoDB Atlas)
- Kiểm tra kết nối internet

### Lỗi Google API

- Kiểm tra API Key có đúng không
- Đảm bảo các API đã được bật trong Google Cloud Console
- Kiểm tra quota và billing của Google Cloud project

### Lỗi gửi email (Nodemailer)

- Kiểm tra `NODEMAILER_EMAIL` và `NODEMAILER_PASSWORD` trong file `.env`
- Đảm bảo đã sử dụng App Password, không phải mật khẩu Gmail thông thường
- Kiểm tra xác thực 2 bước đã được bật trên tài khoản Gmail
- Kiểm tra kết nối internet

### Lỗi build TypeScript

- Xóa thư mục `dist` và `node_modules`, sau đó chạy lại `npm install` và `npm run build`
- Kiểm tra version Node.js có đúng không

## 👥 Tác giả

Nguyễn Mậu An
