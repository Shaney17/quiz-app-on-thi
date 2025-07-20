const fs = require('fs');

function cleanExtractedQuestions() {
  try {
    const questions = JSON.parse(fs.readFileSync('questions_complete_extracted.json', 'utf8'));
    
    console.log(`🧹 Đang làm sạch ${questions.length} câu hỏi...`);
    
    const cleanedQuestions = questions.map((q, index) => {
      const questionNum = index + 1;
      
      // Làm sạch câu hỏi
      let question = q.question
        .replace(/"/g, '') // Loại bỏ quotes
        .replace(/\s+/g, ' ') // Gộp khoảng trắng
        .replace(/[""]/g, '"') // Chuẩn hóa quotes
        .trim();
      
      // Đảm bảo câu hỏi bắt đầu đúng
      if (!question.startsWith(`Câu ${questionNum}:`)) {
        const match = question.match(/Câu \d+:(.*)/);
        if (match) {
          question = `Câu ${questionNum}:${match[1]}`;
        }
      }
      
      // Làm sạch options
      let options = q.options.map(opt => {
        return opt
          .replace(/"/g, '') // Loại bỏ quotes
          .replace(/\s+/g, ' ') // Gộp khoảng trắng
          .replace(/[""]/g, '"') // Chuẩn hóa quotes
          .replace(/,$/, '') // Loại bỏ dấu phay cuối
          .trim();
      });
      
      // Loại bỏ options trống hoặc trùng lặp
      options = [...new Set(options.filter(opt => opt.length > 0))];
      
      // Đảm bảo options có định dạng đúng (bắt đầu bằng a., b., c., d.)
      const correctOptions = [];
      const letters = ['a', 'b', 'c', 'd'];
      
      options.forEach((opt, idx) => {
        if (idx < 4) {
          let cleanOpt = opt;
          // Nếu không bắt đầu bằng letter, thêm vào
          if (!cleanOpt.match(/^[a-d][\.)]/)) {
            cleanOpt = `${letters[idx]}. ${cleanOpt}`;
          }
          correctOptions.push(cleanOpt);
        }
      });
      
      // Đảm bảo có đủ 4 options
      while (correctOptions.length < 4) {
        correctOptions.push(`${letters[correctOptions.length]}. [Option không xác định]`);
      }
      
      // Làm sạch answer
      let answer = q.answer
        .replace(/"/g, '') // Loại bỏ quotes
        .replace(/\s+/g, ' ') // Gộp khoảng trắng
        .replace(/[""]/g, '"') // Chuẩn hóa quotes
        .replace(/,$/, '') // Loại bỏ dấu phay cuối
        .trim();
      
      // Tìm answer phù hợp trong options
      let matchingOption = correctOptions.find(opt => opt === answer);
      
      if (!matchingOption) {
        // Thử tìm bằng cách so sánh nội dung
        matchingOption = correctOptions.find(opt => {
          const optContent = opt.replace(/^[a-d][\.)]\s*/, '').toLowerCase();
          const answerContent = answer.replace(/^[a-d][\.)]\s*/, '').toLowerCase();
          return optContent.includes(answerContent) || answerContent.includes(optContent);
        });
      }
      
      if (!matchingOption) {
        // Nếu vẫn không tìm thấy, dùng option đầu tiên
        matchingOption = correctOptions[0];
      }
      
      return {
        question,
        options: correctOptions,
        answer: matchingOption
      };
    });
    
    // Lưu file đã làm sạch
    const outputPath = 'questions_final_cleaned.json';
    fs.writeFileSync(outputPath, JSON.stringify(cleanedQuestions, null, 2), 'utf8');
    
    // Copy vào quiz app
    const quizAppPath = './quiz-app/src/data/questions.json';
    fs.writeFileSync(quizAppPath, JSON.stringify(cleanedQuestions, null, 2), 'utf8');
    
    console.log(`\n✨ HOÀN THÀNH!`);
    console.log(`📊 Tổng số câu hỏi đã làm sạch: ${cleanedQuestions.length}`);
    console.log(`📁 File cuối cùng: ${outputPath}`);
    console.log(`📁 File quiz app: ${quizAppPath}`);
    
    // Kiểm tra chất lượng
    let goodQuestions = 0;
    let problemQuestions = 0;
    
    cleanedQuestions.forEach((q, index) => {
      const hasGoodOptions = q.options.every(opt => opt.length > 5 && !opt.includes('[Option không xác định]'));
      const hasGoodAnswer = q.answer && q.answer.length > 5 && !q.answer.includes('[Option không xác định]');
      
      if (hasGoodOptions && hasGoodAnswer) {
        goodQuestions++;
      } else {
        problemQuestions++;
        if (problemQuestions <= 5) {
          console.log(`⚠️  Câu ${index + 1} có vấn đề: ${q.question.substring(0, 50)}...`);
        }
      }
    });
    
    console.log(`\n📈 THỐNG KÊ CHẤT LƯỢNG:`);
    console.log(`✅ Câu hỏi tốt: ${goodQuestions}`);
    console.log(`⚠️  Câu hỏi có vấn đề: ${problemQuestions}`);
    console.log(`📊 Tỷ lệ tốt: ${((goodQuestions / cleanedQuestions.length) * 100).toFixed(1)}%`);
    
    // Hiển thị mẫu
    console.log('\n📋 MẪU SAU KHI LÀM SẠCH:');
    [1, 2, 33, 100, 200, 300, 400, 500].forEach(num => {
      const q = cleanedQuestions[num - 1];
      if (q) {
        console.log(`\n--- Câu ${num} ---`);
        console.log(`Q: ${q.question.substring(0, 80)}...`);
        q.options.forEach((opt, idx) => {
          console.log(`   ${opt.substring(0, 60)}${opt.length > 60 ? '...' : ''}`);
        });
        console.log(`A: ${q.answer.substring(0, 60)}...`);
      }
    });
    
    return cleanedQuestions;
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return null;
  }
}

// Chạy script
if (require.main === module) {
  cleanExtractedQuestions();
}

module.exports = { cleanExtractedQuestions };
