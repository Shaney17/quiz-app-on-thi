# Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Chuẩn bị Repository

1. Tạo repository mới trên GitHub với tên `quiz-app`
2. Clone hoặc upload project này lên repository

## Bước 2: Cấu hình package.json

Cập nhật field `homepage` trong `package.json`:
```json
{
  "homepage": "https://your-username.github.io/quiz-app"
}
```

Thay `your-username` bằng username GitHub của bạn.

## Bước 3: Cài đặt và Deploy

```bash
# Cài đặt dependencies
npm install

# Cài đặt gh-pages (nếu chưa có)
npm install --save-dev gh-pages

# Build và deploy
npm run deploy
```

## Bước 4: Cấu hình GitHub Pages

1. Vào Settings của repository trên GitHub
2. Scroll xuống phần "Pages"
3. Chọn Source: "Deploy from a branch"
4. Chọn Branch: "gh-pages"
5. Folder: "/ (root)"

## Bước 5: Truy cập Website

Sau khi deploy thành công, website sẽ có tại:
`https://your-username.github.io/quiz-app`

## Cập nhật nội dung

Mỗi khi bạn muốn cập nhật website:
```bash
npm run deploy
```

## Troubleshooting

### Lỗi: "Failed to get remote.origin.url"
```bash
git remote add origin https://github.com/your-username/quiz-app.git
```

### Lỗi: "Permission denied"
- Đảm bảo bạn đã login GitHub
- Kiểm tra SSH key hoặc dùng HTTPS

### Website không load
- Kiểm tra URL trong `package.json`
- Đợi 5-10 phút để GitHub Pages cập nhật
- Kiểm tra trong Settings > Pages có hiển thị URL không
