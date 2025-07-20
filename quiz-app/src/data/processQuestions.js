// Script để xử lý dữ liệu câu hỏi
// Chạy script này để copy toàn bộ câu hỏi từ file gốc

const fs = require('fs');
const path = require('path');

function processQuestions() {
  try {
    // Đọc file câu hỏi gốc
    const originalFile = path.join(__dirname, '../../questions_ck_ttck.json');
    const questionsData = JSON.parse(fs.readFileSync(originalFile, 'utf8'));
    
    console.log(`Đã đọc ${questionsData.length} câu hỏi từ file gốc`);
    
    // Ghi vào file trong src/data
    const outputFile = path.join(__dirname, 'questions.json');
    fs.writeFileSync(outputFile, JSON.stringify(questionsData, null, 2));
    
    console.log(`Đã ghi ${questionsData.length} câu hỏi vào ${outputFile}`);
    
    // Thống kê
    console.log('Thống kê:');
    console.log(`- Tổng số câu hỏi: ${questionsData.length}`);
    console.log(`- Ứng dụng sẽ chọn ngẫu nhiên 30 câu từ ${questionsData.length} câu này`);
    console.log(`- Số lượng đề có thể tạo: rất lớn (do xáo trộn ngẫu nhiên)`);
    
  } catch (error) {
    console.error('Lỗi khi xử lý file câu hỏi:', error.message);
    console.log('Đảm bảo file questions_ck_ttck.json tồn tại ở thư mục gốc project');
  }
}

// Chạy nếu được gọi trực tiếp
if (require.main === module) {
  processQuestions();
}

module.exports = { processQuestions };
