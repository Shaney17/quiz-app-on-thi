# Hệ thống Trắc nghiệm Chứng khoán

Ứng dụng web trắc nghiệm được xây dựng bằng React để thực hành các câu hỏi về chứng khoán.

## Tính năng

- ✅ Tạo bộ đề ngẫu nhiên với 30 câu hỏi từ ngân hàng câu hỏi
- ✅ Xáo trộn câu hỏi mỗi lần làm bài
- ✅ Theo dõi tiến độ làm bài
- ✅ Kiểm tra kết quả chi tiết sau khi hoàn thành
- ✅ Thống kê số câu đúng/sai
- ✅ Hiển thị đáp án đúng cho các câu trả lời sai
- ✅ Giao diện đẹp, responsive trên mobile
- ✅ Có thể tạo đề mới liên tục

## Cách sử dụng

1. Truy cập website
2. Bắt đầu làm bài với 30 câu hỏi được chọn ngẫu nhiên
3. Chọn đáp án cho từng câu hỏi
4. Nhấn "Nộp bài và xem kết quả" khi hoàn thành
5. Xem kết quả chi tiết và các đáp án đúng
6. Nhấn "Làm bài mới" để tạo đề khác

## Cài đặt và chạy local

```bash
# Clone repository
git clone <repository-url>
cd quiz-app

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Build cho production
npm run build

# Deploy lên GitHub Pages
npm run deploy
```

## Deploy lên GitHub Pages

1. Fork repository này
2. Cập nhật field `homepage` trong `package.json` với URL GitHub Pages của bạn
3. Chạy `npm run deploy`
4. Ứng dụng sẽ được deploy tại `https://yourusername.github.io/quiz-app`

## Cấu trúc dự án

- `src/data/questions.json` - Ngân hàng câu hỏi
- `src/App.js` - Component chính
- `src/App.css` - Styling cho ứng dụng

## Công nghệ sử dụng

- React 19
- CSS3 với Flexbox và Grid
- Local Storage (có thể mở rộng)
- GitHub Pages để deploy

## Tính năng có thể mở rộng

- [ ] Lưu kết quả vào localStorage
- [ ] Thống kê chi tiết theo thời gian
- [ ] Chia danh mục câu hỏi
- [ ] Thời gian làm bài
- [ ] Xếp hạng
- [ ] Import/Export kết quả

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
