const fs = require('fs');

function fixWordDataExtraction() {
  try {
    console.log('🔧 Sửa lại việc trích xuất dữ liệu từ Word...');

    const content = fs.readFileSync('word_content_raw.txt', 'utf8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const questions = [];
    let currentQuestion = null;
    let collectingQuestion = false;
    let collectingOptions = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Tìm câu hỏi bắt đầu bằng "Câu X:"
      const questionMatch = line.match(/^Câu\s+(\d+):\s*(.*)/);
      if (questionMatch) {
        // Lưu câu hỏi trước đó
        if (currentQuestion && currentQuestion.options.length > 0) {
          // Đảm bảo có answer
          if (!currentQuestion.answer && currentQuestion.options.length > 0) {
            currentQuestion.answer = currentQuestion.options[0];
          }
          questions.push(currentQuestion);
        }

        currentQuestion = {
          question: line,
          options: [],
          answer: "",
          questionNumber: parseInt(questionMatch[1])
        };
        collectingQuestion = true;
        collectingOptions = false;
        continue;
      }

      if (currentQuestion) {
        // Nếu đang thu thập câu hỏi và gặp option đầu tiên
        const optionMatch = line.match(/^([a-d][\)\.]\s*.+)/);
        if (optionMatch) {
          collectingQuestion = false;
          collectingOptions = true;
          currentQuestion.options.push(optionMatch[1]);

          // Option đầu tiên làm answer mặc định
          if (!currentQuestion.answer) {
            currentQuestion.answer = optionMatch[1];
          }
        } else if (collectingOptions && line.match(/^([a-d][\)\.]\s*.+)/)) {
          // Các options tiếp theo
          currentQuestion.options.push(line);
        } else if (collectingQuestion) {
          // Vẫn đang thu thập câu hỏi
          currentQuestion.question += ' ' + line;
        } else if (collectingOptions && currentQuestion.options.length > 0) {
          // Có thể là phần tiếp theo của option cuối
          const lastIndex = currentQuestion.options.length - 1;
          currentQuestion.options[lastIndex] += ' ' + line;
        }
      }
    }

    // Lưu câu hỏi cuối cùng
    if (currentQuestion && currentQuestion.options.length > 0) {
      if (!currentQuestion.answer && currentQuestion.options.length > 0) {
        currentQuestion.answer = currentQuestion.options[0];
      }
      questions.push(currentQuestion);
    }

    console.log(`✅ Trích xuất được ${questions.length} câu hỏi`);

    // Kiểm tra câu 160
    const question160 = questions.find(q => q.questionNumber === 160);
    if (question160) {
      console.log('\n📋 CÂU 160 CHÍNH XÁC TỪ WORD:');
      console.log('Question:', question160.question);
      console.log('Options:');
      question160.options.forEach(opt => console.log(`  ${opt}`));
      console.log('Answer:', question160.answer);
    } else {
      console.log('❌ Không tìm thấy câu 160');
    }

    // Chuẩn hóa và sắp xếp lại
    const sortedQuestions = questions
      .sort((a, b) => a.questionNumber - b.questionNumber)
      .map((q, index) => ({
        question: q.question,
        options: q.options,
        answer: q.answer
      }));

    // Lưu file chính xác
    const outputPath = 'questions_accurate_from_word.json';
    fs.writeFileSync(outputPath, JSON.stringify(sortedQuestions, null, 2), 'utf8');

    // Cập nhật quiz app
    const quizAppPath = './quiz-app/src/data/questions.json';
    fs.writeFileSync(quizAppPath, JSON.stringify(sortedQuestions, null, 2), 'utf8');

    console.log(`\n✅ ĐÃ HOÀN THÀNH!`);
    console.log(`📁 File chính xác: ${outputPath}`);
    console.log(`📁 Đã cập nhật quiz app: ${quizAppPath}`);
    console.log(`📊 Tổng số câu: ${sortedQuestions.length}`);

    // Kiểm tra lại câu 160 sau khi cập nhật
    if (sortedQuestions[159]) {
      console.log('\n🎯 CÂU 160 SAU KHI CẬP NHẬT:');
      console.log('Q:', sortedQuestions[159].question);
      console.log('Options:', sortedQuestions[159].options.length);
      sortedQuestions[159].options.forEach(opt => console.log(`  ${opt}`));
      console.log('A:', sortedQuestions[159].answer);
    }

    // Thống kê
    console.log('\n📊 THỐNG KÊ:');
    const questionNumbers = questions.map(q => q.questionNumber).sort((a, b) => a - b);
    console.log(`Câu đầu tiên: ${questionNumbers[0]}`);
    console.log(`Câu cuối cùng: ${questionNumbers[questionNumbers.length - 1]}`);

    // Tìm câu bị thiếu
    const missingNumbers = [];
    for (let i = 1; i <= questionNumbers[questionNumbers.length - 1]; i++) {
      if (!questionNumbers.includes(i)) {
        missingNumbers.push(i);
      }
    }

    if (missingNumbers.length > 0) {
      console.log(`⚠️  Câu bị thiếu: ${missingNumbers.join(', ')}`);
    } else {
      console.log('✅ Không có câu nào bị thiếu');
    }

    return sortedQuestions;

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return null;
  }
}

// Chạy script
fixWordDataExtraction();
