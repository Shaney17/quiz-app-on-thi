const fs = require('fs');
const path = require('path');

function fixQuestionFormat() {
  try {
    // Đọc file JSON hiện tại
    const filePath = path.join(__dirname, '../../../questions_ck_ttck.json');
    const questionsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`Đang xử lý ${questionsData.length} câu hỏi...`);
    let fixedCount = 0;
    
    const fixedQuestions = questionsData.map((q, index) => {
      let question = { ...q };
      let wasFixed = false;
      
      // Fix câu 33: Gộp option a bị tách
      if (question.question.includes('Câu 33:')) {
        const newOptions = [];
        let i = 0;
        while (i < question.options.length) {
          if (question.options[i].startsWith('a.') && 
              i + 1 < question.options.length && 
              !question.options[i + 1].match(/^[b-d]\./)) {
            // Gộp option a bị tách
            newOptions.push(question.options[i] + ' ' + question.options[i + 1]);
            i += 2;
            wasFixed = true;
          } else if (question.options[i].startsWith('b.') && 
                     i + 1 < question.options.length && 
                     !question.options[i + 1].match(/^[c-d]\./)) {
            // Gộp option b bị tách
            newOptions.push(question.options[i] + ' ' + question.options[i + 1]);
            i += 2;
            wasFixed = true;
          } else if (question.options[i].startsWith('c.') && 
                     i + 1 < question.options.length && 
                     !question.options[i + 1].match(/^d\./)) {
            // Gộp option c bị tách
            newOptions.push(question.options[i] + ' ' + question.options[i + 1]);
            i += 2;
            wasFixed = true;
          } else {
            newOptions.push(question.options[i]);
            i++;
          }
        }
        question.options = newOptions;
        
        // Fix answer cho câu 33
        if (question.answer === 'thời điểm xin phép niêm yết từ 10 tỷ VND trở lên.') {
          question.answer = 'a. Là công ty cổ phần, công ty trách nhiệm hữu hạn, doanh nghiệp nhà nước có vốn điều lệ đ• góp tại thời điểm xin phép niêm yết từ 10 tỷ VND trở lên.';
          wasFixed = true;
        }
      }
      
      // Fix các câu có format I, II, III (như câu 111, 112...)
      if (question.options.some(opt => opt.match(/^(I|II|III|IV)\.?\s/))) {
        const romanNumerals = [];
        const actualOptions = [];
        
        question.options.forEach(opt => {
          if (opt.match(/^(I|II|III|IV)\.?\s/)) {
            romanNumerals.push(opt);
          } else {
            actualOptions.push(opt);
          }
        });
        
        if (romanNumerals.length > 0) {
          // Thêm các mục I, II, III vào câu hỏi
          const romanText = romanNumerals.join(', ');
          question.question = question.question + ':\n' + romanText;
          question.options = actualOptions;
          wasFixed = true;
        }
      }
      
      // Fix các option bị tách do ký tự đặc biệt
      const fixedOptions = [];
      let i = 0;
      while (i < question.options.length) {
        const currentOpt = question.options[i];
        
        // Kiểm tra nếu option hiện tại không bắt đầu bằng a., b., c., d. và option trước đó có thể được gộp
        if (!currentOpt.match(/^[a-d]\./) && i > 0) {
          const prevIndex = fixedOptions.length - 1;
          if (prevIndex >= 0 && fixedOptions[prevIndex].match(/^[a-d]\./)) {
            // Gộp với option trước đó
            fixedOptions[prevIndex] += ' ' + currentOpt;
            wasFixed = true;
          } else {
            fixedOptions.push(currentOpt);
          }
        } else {
          fixedOptions.push(currentOpt);
        }
        i++;
      }
      
      if (fixedOptions.length !== question.options.length || 
          !fixedOptions.every((opt, idx) => opt === question.options[idx])) {
        question.options = fixedOptions;
        wasFixed = true;
      }
      
      if (wasFixed) {
        fixedCount++;
        console.log(`Fixed câu ${index + 1}: ${question.question.substring(0, 50)}...`);
      }
      
      return question;
    });
    
    // Ghi file đã sửa
    const outputPath = path.join(__dirname, '../../../questions_ck_ttck_fixed.json');
    fs.writeFileSync(outputPath, JSON.stringify(fixedQuestions, null, 2));
    
    console.log(`\n✅ Hoàn thành! Đã sửa ${fixedCount} câu hỏi`);
    console.log(`📁 File đã sửa: ${outputPath}`);
    console.log(`📊 Tổng số câu hỏi: ${fixedQuestions.length}`);
    
    // Copy vào quiz app
    const quizAppPath = path.join(__dirname, 'questions.json');
    fs.writeFileSync(quizAppPath, JSON.stringify(fixedQuestions, null, 2));
    console.log(`📁 Đã cập nhật vào quiz app: ${quizAppPath}`);
    
    return fixedQuestions;
    
  } catch (error) {
    console.error('❌ Lỗi khi xử lý:', error.message);
    return null;
  }
}

// Chạy script
if (require.main === module) {
  fixQuestionFormat();
}

module.exports = { fixQuestionFormat };
