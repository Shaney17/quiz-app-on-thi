const fs = require('fs');
const path = require('path');

function comprehensiveFixQuestions() {
  try {
    // Đọc file JSON gốc
    const filePath = path.join(__dirname, '../../../questions_ck_ttck.json');
    const questionsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`🔄 Đang xử lý ${questionsData.length} câu hỏi...`);
    let fixedCount = 0;

    const fixedQuestions = questionsData.map((q, index) => {
      let question = { ...q };
      let wasFixed = false;

      // 1. Fix các câu có phần "Vậy..." trong options (như câu 2)
      if (question.options.some(opt => opt.startsWith('Vậy') || opt.includes('Như vậy'))) {
        const questionParts = [];
        const actualOptions = [];

        question.options.forEach(opt => {
          if (opt.startsWith('Vậy') || opt.includes('Như vậy') || opt.includes('hàng năm nhà đầu tư')) {
            questionParts.push(opt);
          } else if (opt.match(/^[a-d]\./)) {
            actualOptions.push(opt);
          } else {
            // Có thể là phần tiếp theo của câu hỏi
            questionParts.push(opt);
          }
        });

        if (questionParts.length > 0) {
          question.question = question.question + ' ' + questionParts.join(' ');
          question.options = actualOptions;
          wasFixed = true;
        }
      }

      // 2. Fix các câu có Roman numerals (I, II, III, IV)
      if (question.options.some(opt => opt.match(/^(I|II|III|IV)\.?\s/))) {
        const romanNumerals = [];
        const actualOptions = [];

        question.options.forEach(opt => {
          if (opt.match(/^(I|II|III|IV)\.?\s/)) {
            romanNumerals.push(opt);
          } else if (opt.match(/^[a-d]\./)) {
            actualOptions.push(opt);
          }
        });

        if (romanNumerals.length > 0) {
          question.question = question.question + ':\n' + romanNumerals.join('\n');
          question.options = actualOptions;
          wasFixed = true;
        }
      }

      // 3. Fix options bị tách dòng (không bắt đầu bằng a., b., c., d.)
      const fixedOptions = [];
      let i = 0;

      while (i < question.options.length) {
        const currentOpt = question.options[i];

        // Nếu option hiện tại bắt đầu bằng a., b., c., d. thì thêm vào
        if (currentOpt.match(/^[a-d]\./)) {
          fixedOptions.push(currentOpt);
        } else {
          // Nếu không bắt đầu bằng a., b., c., d. thì gộp với option trước
          if (fixedOptions.length > 0) {
            const lastIndex = fixedOptions.length - 1;
            fixedOptions[lastIndex] += ' ' + currentOpt;
            wasFixed = true;
          } else {
            // Nếu không có option trước đó, có thể là phần của câu hỏi
            if (!currentOpt.match(/^[a-d]\./)) {
              question.question += ' ' + currentOpt;
              wasFixed = true;
            } else {
              fixedOptions.push(currentOpt);
            }
          }
        }
        i++;
      }

      if (fixedOptions.length > 0 && fixedOptions.length !== question.options.length) {
        question.options = fixedOptions;
        wasFixed = true;
      }

      // 4. Đảm bảo có đủ 4 options (a, b, c, d)
      if (question.options.length < 4) {
        console.log(`⚠️  Câu ${index + 1} chỉ có ${question.options.length} options`);
      }

      // 5. Fix answer nếu cần thiết
      if (question.answer && !question.options.some(opt => opt === question.answer)) {
        // Tìm option gần giống nhất với answer
        const possibleAnswers = question.options.filter(opt =>
          opt.toLowerCase().includes(question.answer.toLowerCase()) ||
          question.answer.toLowerCase().includes(opt.toLowerCase())
        );

        if (possibleAnswers.length === 1) {
          question.answer = possibleAnswers[0];
          wasFixed = true;
        }
      }

      // 6. Làm sạch text (loại bỏ ký tự lạ, khoảng trắng thừa)
      question.question = question.question.replace(/\s+/g, ' ').trim();
      question.options = question.options.map(opt => opt.replace(/\s+/g, ' ').trim());
      if (question.answer) {
        question.answer = question.answer.replace(/\s+/g, ' ').trim();
      }

      if (wasFixed) {
        fixedCount++;
        console.log(`✅ Fixed câu ${index + 1}: ${question.question.substring(0, 60)}...`);
      }

      return question;
    });

    // Lưu file đã sửa
    const outputPath = path.join(__dirname, '../../../questions_ck_ttck_comprehensive_fixed.json');
    fs.writeFileSync(outputPath, JSON.stringify(fixedQuestions, null, 2), 'utf8');

    // Copy vào quiz app
    const quizAppPath = path.join(__dirname, 'questions.json');
    fs.writeFileSync(quizAppPath, JSON.stringify(fixedQuestions, null, 2), 'utf8');

    console.log(`\n🎉 HOÀN THÀNH!`);
    console.log(`📊 Tổng số câu hỏi xử lý: ${fixedQuestions.length}`);
    console.log(`🔧 Số câu đã sửa: ${fixedCount}`);
    console.log(`📁 File gốc đã sửa: ${outputPath}`);
    console.log(`📁 File quiz app: ${quizAppPath}`);

    // Kiểm tra một số câu mẫu
    console.log('\n📋 KIỂM TRA MẪU:');
    [1, 2, 33, 50, 100].forEach(num => {
      const q = fixedQuestions[num - 1];
      if (q) {
        console.log(`\nCâu ${num}:`);
        console.log(`Q: ${q.question.substring(0, 80)}...`);
        console.log(`Options: ${q.options.length} choices`);
        console.log(`Answer: ${q.answer ? q.answer.substring(0, 50) : 'N/A'}...`);
      }
    });

    return fixedQuestions;

  } catch (error) {
    console.error('❌ Lỗi khi xử lý:', error.message);
    console.error(error.stack);
    return null;
  }
}

// Chạy script
if (require.main === module) {
  comprehensiveFixQuestions();
}

module.exports = { comprehensiveFixQuestions };
