const fs = require('fs');

function compareAndFixData() {
  try {
    console.log('🔍 So sánh dữ liệu từ Word với dữ liệu hiện tại...\n');
    
    // Đọc dữ liệu từ Word
    const wordQuestions = JSON.parse(fs.readFileSync('questions_from_word.json', 'utf8'));
    
    // Đọc dữ liệu hiện tại
    const currentQuestions = JSON.parse(fs.readFileSync('./quiz-app/src/data/questions.json', 'utf8'));
    
    console.log(`📄 Dữ liệu từ Word: ${wordQuestions.length} câu`);
    console.log(`📄 Dữ liệu hiện tại: ${currentQuestions.length} câu`);
    
    // So sánh từng câu
    let identicalCount = 0;
    let differentCount = 0;
    const differences = [];
    
    for (let i = 0; i < Math.min(wordQuestions.length, currentQuestions.length); i++) {
      const wordQ = wordQuestions[i];
      const currentQ = currentQuestions[i];
      
      // So sánh câu hỏi (bỏ qua số thứ tự)
      const wordQText = wordQ.question.replace(/^Câu\s+\d+:\s*/, '').trim();
      const currentQText = currentQ.question.replace(/^Câu\s+\d+:\s*/, '').trim();
      
      if (wordQText === currentQText) {
        identicalCount++;
      } else {
        differentCount++;
        if (differences.length < 10) { // Chỉ hiển thị 10 khác biệt đầu tiên
          differences.push({
            index: i + 1,
            wordQuestion: wordQ.question.substring(0, 80) + '...',
            currentQuestion: currentQ.question.substring(0, 80) + '...'
          });
        }
      }
    }
    
    console.log(`\n📊 KẾT QUẢ SO SÁNH:`);
    console.log(`✅ Câu giống nhau: ${identicalCount}`);
    console.log(`❌ Câu khác nhau: ${differentCount}`);
    console.log(`📈 Tỷ lệ chính xác: ${((identicalCount / Math.min(wordQuestions.length, currentQuestions.length)) * 100).toFixed(1)}%`);
    
    if (differences.length > 0) {
      console.log(`\n🔍 MỘT SỐ KHÁC BIỆT ĐẦU TIÊN:`);
      differences.forEach(diff => {
        console.log(`\nCâu ${diff.index}:`);
        console.log(`Word: ${diff.wordQuestion}`);
        console.log(`Hiện tại: ${diff.currentQuestion}`);
      });
    }
    
    // Kiểm tra cụ thể câu 160
    console.log(`\n🎯 KIỂM TRA CÂU 160:`);
    if (wordQuestions[159]) {
      console.log(`Word (câu 160): ${wordQuestions[159].question}`);
      console.log(`Options: ${wordQuestions[159].options.join(', ')}`);
    }
    if (currentQuestions[159]) {
      console.log(`Hiện tại (câu 160): ${currentQuestions[159].question}`);
      console.log(`Options: ${currentQuestions[159].options.join(', ')}`);
    }
    
    // Tạo đề xuất
    console.log(`\n💡 ĐỀ XUẤT:`);
    if (identicalCount > differentCount) {
      console.log(`✅ Dữ liệu chủ yếu đã chính xác (${((identicalCount / Math.min(wordQuestions.length, currentQuestions.length)) * 100).toFixed(1)}%)`);
      console.log(`🔧 Cần sửa ${differentCount} câu khác biệt`);
      
      // Tạo file sửa lỗi
      createFixedVersion(wordQuestions);
      
    } else {
      console.log(`❌ Có quá nhiều khác biệt, nên sử dụng dữ liệu từ Word làm chính`);
      
      // Sử dụng dữ liệu Word làm chính
      useWordDataAsMain(wordQuestions);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

function createFixedVersion(wordQuestions) {
  try {
    // Chuẩn hóa dữ liệu từ Word
    const standardizedQuestions = wordQuestions.map((q, index) => {
      const questionNum = index + 1;
      
      return {
        question: `Câu ${questionNum}: ${q.question.replace(/^Câu\s+\d+:\s*/, '').trim()}`,
        options: q.options.filter(opt => opt.trim().length > 0),
        answer: q.answer || q.options[0] || ''
      };
    });
    
    // Lưu file đã sửa
    const outputPath = 'questions_corrected_from_word.json';
    fs.writeFileSync(outputPath, JSON.stringify(standardizedQuestions, null, 2), 'utf8');
    
    // Copy vào quiz app
    const quizAppPath = './quiz-app/src/data/questions.json';
    fs.writeFileSync(quizAppPath, JSON.stringify(standardizedQuestions, null, 2), 'utf8');
    
    console.log(`✅ Đã tạo phiên bản sửa lỗi: ${outputPath}`);
    console.log(`📁 Đã cập nhật quiz app: ${quizAppPath}`);
    console.log(`📊 Tổng số câu: ${standardizedQuestions.length}`);
    
    // Kiểm tra câu 160 sau khi sửa
    if (standardizedQuestions[159]) {
      console.log(`\n✅ CÂU 160 SAU KHI SỬA:`);
      console.log(`Q: ${standardizedQuestions[159].question}`);
      console.log(`Options: ${standardizedQuestions[159].options.length} choices`);
      standardizedQuestions[159].options.forEach(opt => {
        console.log(`   ${opt}`);
      });
      console.log(`A: ${standardizedQuestions[159].answer}`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo phiên bản sửa:', error.message);
  }
}

function useWordDataAsMain(wordQuestions) {
  console.log('🔄 Sử dụng dữ liệu từ Word làm chính...');
  createFixedVersion(wordQuestions);
}

// Chạy so sánh
compareAndFixData();
