const fs = require('fs');
const path = require('path');

function fixEntireJsonStructure() {
  try {
    const filePath = 'questions_ck_ttck.json';
    const content = fs.readFileSync(filePath, 'utf8');

    console.log('🔄 Đang phân tích và sửa cấu trúc file JSON...');

    // Đọc từng dòng và tái cấu trúc
    const lines = content.split('\n');
    console.log(`📄 File có ${lines.length} dòng`);

    const questions = [];
    let currentQuestion = null;
    let inOptions = false;
    let inAnswer = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Bỏ qua dòng trống và dấu ngoặc
      if (!line || line === '[' || line === ']' || line === '{' || line === '}' || line === '},') {
        continue;
      }

      // Tìm câu hỏi mới
      const questionMatch = line.match(/"question":\s*"(Câu \d+:.*?)"/);
      if (questionMatch) {
        // Lưu câu hỏi trước đó nếu có
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        currentQuestion = {
          question: questionMatch[1],
          options: [],
          answer: ""
        };
        inOptions = false;
        inAnswer = false;
        continue;
      }

      // Tìm phần options
      if (line.includes('"options":')) {
        inOptions = true;
        inAnswer = false;
        continue;
      }

      // Tìm phần answer
      const answerMatch = line.match(/"answer":\s*"(.*?)"/);
      if (answerMatch) {
        if (currentQuestion) {
          currentQuestion.answer = answerMatch[1];
        }
        inOptions = false;
        inAnswer = true;
        continue;
      }

      // Xử lý options
      if (inOptions && currentQuestion) {
        const optionMatch = line.match(/^\s*"(.*?)"[,]?$/);
        if (optionMatch) {
          currentQuestion.options.push(optionMatch[1]);
        }
      }

      // Xử lý câu hỏi trực tiếp (không có cấu trúc JSON)
      const directQuestionMatch = line.match(/^(Câu \d+:.*)/);
      if (directQuestionMatch && !line.includes('"question":')) {
        // Lưu câu hỏi trước đó nếu có
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        currentQuestion = {
          question: directQuestionMatch[1],
          options: [],
          answer: ""
        };
        inOptions = false;
        inAnswer = false;

        // Tìm các options tiếp theo
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          if (!nextLine) {
            j++;
            continue;
          }

          // Nếu gặp câu hỏi mới, dừng
          if (nextLine.match(/^Câu \d+:/)) {
            break;
          }

          // Nếu là option (a., b., c., d.)
          if (nextLine.match(/^[a-d][\.)]/)) {
            currentQuestion.options.push(nextLine);
            // Tìm answer (thường là option cuối cùng hoặc được đánh dấu)
            if (!currentQuestion.answer) {
              currentQuestion.answer = nextLine;
            }
          } else if (nextLine.match(/^(I\.|II\.|III\.|IV\.)/)) {
            // Thêm Roman numerals vào câu hỏi
            currentQuestion.question += '\n' + nextLine;
          } else if (currentQuestion.options.length > 0) {
            // Có thể là phần tiếp theo của option cuối
            const lastIndex = currentQuestion.options.length - 1;
            currentQuestion.options[lastIndex] += ' ' + nextLine;
          } else {
            // Có thể là phần tiếp theo của câu hỏi
            currentQuestion.question += ' ' + nextLine;
          }

          j++;
        }

        i = j - 1; // Điều chỉnh vị trí vòng lặp chính
      }
    }

    // Lưu câu hỏi cuối cùng
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    console.log(`✅ Đã xử lý ${questions.length} câu hỏi`);

    // Làm sạch và chuẩn hóa dữ liệu
    const cleanedQuestions = questions.map((q, index) => {
      // Làm sạch câu hỏi
      let question = q.question.replace(/\s+/g, ' ').trim();

      // Làm sạch options
      let options = q.options.map(opt => opt.replace(/\s+/g, ' ').trim()).filter(opt => opt.length > 0);

      // Đảm bảo có ít nhất 4 options
      while (options.length < 4) {
        options.push(`${String.fromCharCode(97 + options.length)}. [Option missing]`);
      }

      // Làm sạch answer
      let answer = q.answer.replace(/\s+/g, ' ').trim();

      // Nếu answer không khớp với bất kỳ option nào, thử tìm option gần nhất
      if (answer && !options.some(opt => opt === answer)) {
        const matchingOption = options.find(opt =>
          opt.toLowerCase().includes(answer.toLowerCase()) ||
          answer.toLowerCase().includes(opt.toLowerCase())
        );
        if (matchingOption) {
          answer = matchingOption;
        }
      }

      return {
        question,
        options,
        answer
      };
    });

    // Lưu file mới
    const outputPath = 'questions_ck_ttck_restructured.json';
    fs.writeFileSync(outputPath, JSON.stringify(cleanedQuestions, null, 2), 'utf8');

    // Copy vào quiz app
    const quizAppPath = './quiz-app/src/data/questions.json';
    fs.writeFileSync(quizAppPath, JSON.stringify(cleanedQuestions, null, 2), 'utf8');

    console.log(`\n🎉 HOÀN THÀNH!`);
    console.log(`📊 Tổng số câu hỏi: ${cleanedQuestions.length}`);
    console.log(`📁 File mới: ${outputPath}`);
    console.log(`📁 File quiz app: ${quizAppPath}`);

    // Hiển thị mẫu
    console.log('\n📋 MẪU CÁC CÂU HỎI:');
    [1, 2, 33, 50, 100, 160, 200, 300, 400, 500].forEach(num => {
      const q = cleanedQuestions[num - 1];
      if (q) {
        console.log(`\nCâu ${num}:`);
        console.log(`Q: ${q.question.substring(0, 80)}...`);
        console.log(`Options: ${q.options.length} choices`);
        console.log(`Answer: ${q.answer ? q.answer.substring(0, 50) : 'N/A'}...`);
      }
    });

    return cleanedQuestions;

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
    return null;
  }
}

// Chạy script
if (require.main === module) {
  fixEntireJsonStructure();
}

module.exports = { fixEntireJsonStructure };
