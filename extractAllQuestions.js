const fs = require('fs');

function extractAllQuestions() {
  try {
    const content = fs.readFileSync('questions_ck_ttck.json', 'utf8');
    const lines = content.split('\n');
    
    console.log('🔍 Đang tìm tất cả câu hỏi trong file...');
    
    const questions = [];
    let currentQuestion = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Tìm tất cả câu hỏi (cả trong JSON và text thô)
      const questionMatch = line.match(/(?:"question":\s*")?(?:.*?)(Câu \d+:.*?)(?:")?$/);
      if (questionMatch && questionMatch[1]) {
        // Lưu câu hỏi trước đó
        if (currentQuestion && currentQuestion.question) {
          questions.push(currentQuestion);
        }
        
        let questionText = questionMatch[1];
        // Loại bỏ quotes và escape characters
        questionText = questionText.replace(/\\"/g, '"').replace(/^"|"$/g, '');
        
        currentQuestion = {
          question: questionText,
          options: [],
          answer: ""
        };
        
        // Tìm options và answer cho câu hỏi này
        let j = i + 1;
        const seenOptions = new Set();
        
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          
          // Nếu gặp câu hỏi mới, dừng
          if (nextLine.match(/Câu \d+:/) && !nextLine.includes(currentQuestion.question)) {
            break;
          }
          
          // Tìm options (a., b., c., d., hoặc a), b), c), d))
          const optionMatch = nextLine.match(/^(?:")?([a-d][\.)]\s*.*)(?:"[,]?)?$/);
          if (optionMatch) {
            let option = optionMatch[1].replace(/\\"/g, '"').replace(/^"|"$/g, '');
            if (!seenOptions.has(option)) {
              currentQuestion.options.push(option);
              seenOptions.add(option);
            }
          }
          
          // Tìm Roman numerals (I., II., III., IV.)
          const romanMatch = nextLine.match(/^(?:")?([IVX]+\.?\s*.*)(?:"[,]?)?$/);
          if (romanMatch) {
            let romanText = romanMatch[1].replace(/\\"/g, '"').replace(/^"|"$/g, '');
            currentQuestion.question += '\n' + romanText;
          }
          
          // Tìm answer
          const answerMatch = nextLine.match(/"answer":\s*"(.*?)"/);
          if (answerMatch) {
            currentQuestion.answer = answerMatch[1].replace(/\\"/g, '"');
          }
          
          j++;
        }
        
        // Nếu không có answer rõ ràng, dùng option đầu tiên
        if (!currentQuestion.answer && currentQuestion.options.length > 0) {
          currentQuestion.answer = currentQuestion.options[0];
        }
        
        i = j - 1;
      }
    }
    
    // Lưu câu hỏi cuối cùng
    if (currentQuestion && currentQuestion.question) {
      questions.push(currentQuestion);
    }
    
    console.log(`✅ Tìm thấy ${questions.length} câu hỏi`);
    
    // Làm sạch và chuẩn hóa
    const cleanedQuestions = questions.map((q, index) => {
      const questionNum = index + 1;
      
      // Làm sạch câu hỏi
      let question = q.question.replace(/\s+/g, ' ').trim();
      
      // Đảm bảo câu hỏi bắt đầu đúng
      if (!question.startsWith(`Câu ${questionNum}:`)) {
        const match = question.match(/Câu \d+:(.*)/);
        if (match) {
          question = `Câu ${questionNum}:${match[1]}`;
        }
      }
      
      // Làm sạch options
      let options = q.options
        .map(opt => opt.replace(/\s+/g, ' ').trim())
        .filter(opt => opt.length > 0 && opt !== question);
      
      // Loại bỏ duplicates
      options = [...new Set(options)];
      
      // Đảm bảo có ít nhất 4 options
      if (options.length < 4) {
        const letters = ['a', 'b', 'c', 'd'];
        while (options.length < 4) {
          options.push(`${letters[options.length]}. [Missing option]`);
        }
      }
      
      // Làm sạch answer
      let answer = q.answer.replace(/\s+/g, ' ').trim();
      
      // Tìm answer phù hợp trong options
      if (answer && !options.includes(answer)) {
        const matchingOption = options.find(opt => 
          opt.toLowerCase().includes(answer.toLowerCase()) ||
          answer.toLowerCase().includes(opt.toLowerCase().substring(0, 20))
        );
        if (matchingOption) {
          answer = matchingOption;
        } else {
          answer = options[0]; // Default to first option
        }
      }
      
      if (!answer) {
        answer = options[0];
      }
      
      return {
        question,
        options: options.slice(0, 4), // Chỉ lấy 4 options đầu
        answer
      };
    });
    
    // Lưu file
    const outputPath = 'questions_complete_extracted.json';
    fs.writeFileSync(outputPath, JSON.stringify(cleanedQuestions, null, 2), 'utf8');
    
    // Copy vào quiz app
    const quizAppPath = './quiz-app/src/data/questions.json';
    fs.writeFileSync(quizAppPath, JSON.stringify(cleanedQuestions, null, 2), 'utf8');
    
    console.log(`\n🎉 HOÀN THÀNH!`);
    console.log(`📊 Tổng số câu hỏi: ${cleanedQuestions.length}`);
    console.log(`📁 File hoàn chỉnh: ${outputPath}`);
    console.log(`📁 File quiz app: ${quizAppPath}`);
    
    // Hiển thị mẫu
    console.log('\n📋 MẪU CÁC CÂU HỎI:');
    [1, 2, 33, 50, 100, 160, 200, 300, 400, 500].forEach(num => {
      const q = cleanedQuestions[num - 1];
      if (q) {
        console.log(`\nCâu ${num}:`);
        console.log(`Q: ${q.question.substring(0, 70)}...`);
        console.log(`Options: ${q.options.length} - ${q.options.map(o => o.substring(0, 30)).join(', ')}...`);
        console.log(`Answer: ${q.answer.substring(0, 40)}...`);
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
  extractAllQuestions();
}

module.exports = { extractAllQuestions };
