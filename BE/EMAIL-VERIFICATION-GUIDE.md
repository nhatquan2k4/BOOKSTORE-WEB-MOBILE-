# 📧 Email Verification System - Hướng dẫn cấu hình

## ✅ Các thành phần đã hoàn thiện

### 1. **Database**
- ✅ Entity `EmailVerificationToken` với các trường:
  - `Id`, `UserId`, `Token`, `ExpiryDate`, `IsUsed`, `CreatedAt`
- ✅ Navigation property trong `User` entity
- ✅ Repository với đầy đủ methods

### 2. **Backend Services**
- ✅ `IEmailService` - Gửi email
- ✅ `IEmailVerificationService` - Quản lý xác minh email
- ✅ `EmailVerificationController` - API endpoints

### 3. **API Endpoints**
```
POST /api/EmailVerification/verify
Body: { "token": "verification-token-here" }

POST /api/EmailVerification/resend
Body: { "email": "user@example.com" }

GET /api/EmailVerification/status/{userId}
Header: Authorization: Bearer {token}
```

### 4. **Auth Flow**
- ✅ Đăng ký → User.IsActive = false
- ✅ Tự động gửi email xác minh với token
- ✅ User verify email → IsActive = true
- ✅ Gửi welcome email sau verify

## ⚙️ Cấu hình Email Settings

### Bước 1: Cấu hình Gmail (Khuyến nghị)

1. **Bật 2-Step Verification** trên tài khoản Gmail
2. **Tạo App Password**:
   - Truy cập: https://myaccount.google.com/apppasswords
   - Chọn app: "Mail"
   - Chọn device: "Other" → Nhập tên: "BookStore"
   - Copy password được tạo (16 ký tự)

### Bước 2: Cập nhật appsettings.json

```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",  // ← Thay email của bạn
    "SmtpPassword": "xxxx xxxx xxxx xxxx",   // ← Thay App Password (16 ký tự)
    "FromEmail": "your-email@gmail.com",     // ← Thay email của bạn
    "FromName": "BookStore",
    "EnableSsl": true,
    "TokenExpirationHours": 24,
    "FrontendUrl": "http://localhost:3000"
  }
}
```

### Bước 3: Cập nhật appsettings.Development.json (giống như trên)

## 🔧 Email Providers khác

### **Outlook/Hotmail**
```json
{
  "SmtpHost": "smtp-mail.outlook.com",
  "SmtpPort": 587,
  "SmtpUsername": "your-email@outlook.com",
  "SmtpPassword": "your-password"
}
```

### **SendGrid** (Production recommended)
```json
{
  "SmtpHost": "smtp.sendgrid.net",
  "SmtpPort": 587,
  "SmtpUsername": "apikey",
  "SmtpPassword": "SG.xxxxxxxxxxxx"  // SendGrid API Key
}
```

### **Mailtrap** (Development/Testing)
```json
{
  "SmtpHost": "smtp.mailtrap.io",
  "SmtpPort": 2525,
  "SmtpUsername": "your-mailtrap-username",
  "SmtpPassword": "your-mailtrap-password"
}
```

## 🚀 Test Email System

### 1. Test đăng ký
```bash
POST http://localhost:5000/api/Auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123456",
  "confirmPassword": "Test@123456"
}
```

**Expected:**
- ✅ User created with IsActive = false
- ✅ Email verification sent
- ✅ Check email inbox for verification link

### 2. Test verify email
```bash
POST http://localhost:5000/api/EmailVerification/verify
Content-Type: application/json

{
  "token": "token-from-email"
}
```

**Expected:**
- ✅ User.IsActive = true
- ✅ Welcome email sent
- ✅ Can login now

### 3. Test resend verification
```bash
POST http://localhost:5000/api/EmailVerification/resend
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## 📧 Email Templates

### Verification Email
- Subject: "Xác minh địa chỉ email của bạn - BookStore"
- Button: "Xác minh Email" (links to frontend verify page)
- Alternative: Token code để nhập thủ công
- Expiry: 24 giờ

### Welcome Email (sau verify)
- Subject: "Chào mừng đến với BookStore!"
- Content: Giới thiệu các tính năng

## 🛠️ Troubleshooting

### Lỗi "Failed to send email"
- ✅ Kiểm tra SMTP credentials
- ✅ Kiểm tra App Password (không phải password thường)
- ✅ Kiểm tra firewall/antivirus blocking port 587
- ✅ Test với Mailtrap.io trước

### Email không đến
- ✅ Kiểm tra Spam folder
- ✅ Kiểm tra email logs trong database
- ✅ Verify SMTP settings

### Token expired
- ✅ Mặc định expire sau 24h
- ✅ User có thể resend verification email
- ✅ Tự động invalidate old tokens khi resend

## 📋 Database Tables

### EmailVerificationTokens
```sql
SELECT TOP 10 * FROM EmailVerificationTokens 
ORDER BY CreatedAt DESC
```

### Check user verification status
```sql
SELECT Email, IsActive, CreateAt 
FROM identity.Users 
WHERE Email = 'test@example.com'
```

## 🔐 Security Best Practices

1. ✅ Token là cryptographically secure (32 bytes random)
2. ✅ Token chỉ dùng được 1 lần (IsUsed flag)
3. ✅ Token có expiry (24h default)
4. ✅ Old tokens tự động invalidate khi resend
5. ✅ User không thể login nếu chưa verify (IsActive = false)

## 📝 TODO - Frontend Integration

Cần tạo các trang sau trong frontend:

### 1. `/verify-email` page
```typescript
// app/(auth)/verify-email/page.tsx
- Nhận token từ URL query parameter
- Call API verify endpoint
- Show success/error message
- Redirect to login
```

### 2. `/resend-verification` page
```typescript
// app/(auth)/resend-verification/page.tsx
- Form nhập email
- Call API resend endpoint
- Show message check email
```

### 3. Update Register page
```typescript
// Sau khi register thành công:
- Hiển thị message: "Vui lòng kiểm tra email để xác minh tài khoản"
- Không auto-login nữa
- Có link "Gửi lại email xác minh"
```

### 4. Update Login page
```typescript
// Nếu login với user chưa verify:
- Show error: "Vui lòng xác minh email trước khi đăng nhập"
- Có button "Gửi lại email xác minh"
```

## ✅ Checklist

- [ ] Cấu hình EmailSettings trong appsettings.json
- [ ] Test gửi email verification
- [ ] Test verify email token
- [ ] Test resend verification
- [ ] Tạo frontend verify-email page
- [ ] Tạo frontend resend-verification page
- [ ] Update register flow
- [ ] Update login flow với verify check
- [ ] Test end-to-end flow

## 📞 Support

Nếu có lỗi, kiểm tra:
1. Backend logs trong console
2. Database EmailVerificationTokens table
3. SMTP settings đúng chưa
4. App Password được tạo đúng chưa (Gmail)
