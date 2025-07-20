const mammoth = require('mammoth');
const fs = require('fs');

async function readWordFile() {
  try {
    console.log('📖 Đang đọc file Word gốc...');

    const result = await mammoth.extractRawText({
      path: '500 câu hỏi _ Những vấn đề cơ bản về CK và TTCK _ Chỉnh _06.10.2022.docx'
    });

    const text = result.value;
    console.log(`✅ Đọc thành công! Nội dung có ${text.length} ký tự`);

    // Lưu text thô để phân tích
    fs.writeFileSync('word_content_raw.txt', text, 'utf8');
    console.log('💾 Đã lưu nội dung thô vào word_content_raw.txt');

    // Tìm và trích xuất câu hỏi
    const questions = extractQuestionsFromText(text);

    if (questions.length > 0) {
      // Lưu thành JSON
      fs.writeFileSync('questions_from_word.json', JSON.stringify(questions, null, 2), 'utf8');
      console.log(`✅ Đã trích xuất ${questions.length} câu hỏi từ file Word`);
      console.log('💾 Đã lưu vào questions_from_word.json');

      // Kiểm tra câu 160
      if (questions[159]) {
        console.log('\n📋 KIỂM TRA CÂU 160 TỪ FILE WORD:');
        console.log('Question:', questions[159].question.substring(0, 100) + '...');
        console.log('Options:', questions[159].options.length, 'choices');
        questions[159].options.forEach((opt, idx) => {
          console.log(`  ${opt.substring(0, 80)}${opt.length > 80 ? '...' : ''}`);
        });
        console.log('Answer:', questions[159].answer.substring(0, 50) + '...');
      } else {
        console.log('⚠️ Không tìm thấy câu 160 trong file Word');
      }

      // So sánh với file hiện tại
      console.log('\n🔍 SO SÁNH VỚI FILE HIỆN TẠI:');
      try {
        const currentQuestions = JSON.parse(fs.readFileSync('./quiz-app/src/data/questions.json', 'utf8'));
        console.log(`File hiện tại có ${currentQuestions.length} câu`);
        console.log(`File Word có ${questions.length} câu`);

        if (currentQuestions[159] && questions[159]) {
          const currentQ160 = currentQuestions[159].question;
          const wordQ160 = questions[159].question;

          if (currentQ160 !== wordQ160) {
            console.log('❌ CÂU 160 KHÁC NHAU!');
            console.log('Hiện tại:', currentQ160.substring(0, 80) + '...');
            console.log('Từ Word: ', wordQ160.substring(0, 80) + '...');
          } else {
            console.log('✅ Câu 160 khớp nhau');
          }
        }

      } catch (error) {
        console.log('⚠️ Không thể so sánh với file hiện tại:', error.message);
      }

    } else {
      console.log('❌ Không tìm thấy câu hỏi nào trong file Word');
    }

  } catch (error) {
    console.error('❌ Lỗi khi đọc file Word:', error.message);
  }
}

function extractQuestionsFromText(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentQuestion = null;
  let collectingOptions = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Tìm câu hỏi (Câu 1:, Câu 2:, ...)
    const questionMatch = line.match(/^Câu\s+(\d+):\s*(.*)/);
    if (questionMatch) {
      // Lưu câu hỏi trước đó
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      currentQuestion = {
        question: line,
        options: [],
        answer: ""
      };
      collectingOptions = true;
      continue;
    }

    // Thu thập options (a., b., c., d. hoặc a), b), c), d))
    if (collectingOptions && currentQuestion) {
      const optionMatch = line.match(/^([a-d][\)\.]\s*.+)/);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[1]);

        // Giả sử option đầu tiên là đáp án (có thể cần điều chỉnh)
        if (!currentQuestion.answer) {
          currentQuestion.answer = optionMatch[1];
        }
      } else if (line.match(/^[IVX]+\.?\s/)) {
        // Roman numerals - thêm vào câu hỏi
        currentQuestion.question += '\n' + line;
      } else if (currentQuestion.options.length > 0 && !line.match(/^Câu\s+\d+:/)) {
        // Có thể là phần tiếp theo của option cuối cùng
        const lastIndex = currentQuestion.options.length - 1;
        currentQuestion.options[lastIndex] += ' ' + line;
      }
    }
  }

  // Lưu câu hỏi cuối cùng
  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}

// Chạy script
readWordFile();
