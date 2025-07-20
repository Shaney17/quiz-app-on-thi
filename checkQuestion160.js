const fs = require('fs');

// Trước tiên, hãy kiểm tra câu 160 trong file JSON hiện tại
function checkQuestion160() {
  try {
    console.log('🔍 Kiểm tra câu 160 trong các file hiện có...\n');
    
    // Kiểm tra file gốc
    const originalFile = 'questions_ck_ttck.json';
    if (fs.existsSync(originalFile)) {
      const originalData = JSON.parse(fs.readFileSync(originalFile, 'utf8'));
      console.log('📄 File gốc questions_ck_ttck.json:');
      console.log(`   Tổng số câu: ${originalData.length}`);
      if (originalData[159]) {
        console.log(`   Câu 160: ${originalData[159].question.substring(0, 100)}...`);
        console.log(`   Options: ${originalData[159].options.length} choices`);
        console.log(`   Answer: ${originalData[159].answer.substring(0, 50)}...`);
      } else {
        console.log('   ❌ Không tìm thấy câu 160');
      }
    }
    
    // Kiểm tra file đã làm sạch
    const cleanedFile = 'questions_final_cleaned.json';
    if (fs.existsSync(cleanedFile)) {
      const cleanedData = JSON.parse(fs.readFileSync(cleanedFile, 'utf8'));
      console.log('\n📄 File đã làm sạch questions_final_cleaned.json:');
      console.log(`   Tổng số câu: ${cleanedData.length}`);
      if (cleanedData[159]) {
        console.log(`   Câu 160: ${cleanedData[159].question.substring(0, 100)}...`);
        console.log(`   Options: ${cleanedData[159].options.length} choices`);
        cleanedData[159].options.forEach((opt, idx) => {
          console.log(`      ${opt.substring(0, 80)}...`);
        });
        console.log(`   Answer: ${cleanedData[159].answer.substring(0, 50)}...`);
      } else {
        console.log('   ❌ Không tìm thấy câu 160');
      }
    }
    
    // Kiểm tra file trong quiz app
    const quizFile = './quiz-app/src/data/questions.json';
    if (fs.existsSync(quizFile)) {
      const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf8'));
      console.log('\n📄 File trong quiz app:');
      console.log(`   Tổng số câu: ${quizData.length}`);
      if (quizData[159]) {
        console.log(`   Câu 160: ${quizData[159].question.substring(0, 100)}...`);
        console.log(`   Options: ${quizData[159].options.length} choices`);
        console.log(`   Answer: ${quizData[159].answer.substring(0, 50)}...`);
      } else {
        console.log('   ❌ Không tìm thấy câu 160');
      }
    }
    
    console.log('\n📋 BẠN CÓ THỂ:');
    console.log('1. Cung cấp nội dung chính xác của câu 160 từ file Word');
    console.log('2. Hoặc tôi sẽ tạo script để đọc file Word trực tiếp');
    console.log('3. Hoặc bạn copy nội dung câu 160 từ Word để tôi so sánh và sửa');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

// Chạy kiểm tra
checkQuestion160();
