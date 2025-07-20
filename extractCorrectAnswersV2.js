const fs = require('fs');
const path = require('path');

function extractAnswersFromHTML() {
  try {
    console.log('🔍 Trích xuất đáp án chính xác từ file Word HTML bằng content matching...');
    
    // Đọc file HTML
    const htmlPath = path.join(__dirname, 'word_content_with_formatting.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Đọc dữ liệu câu hỏi hiện tại  
    const questionsPath = path.join(__dirname, 'questions_accurate_from_word.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`📊 Đọc được ${questions.length} câu hỏi`);
    
    let updatedQuestions = [];
    let correctAnswerCount = 0;
    let htmlBasedAnswerCount = 0;
    
    // Xử lý từng câu hỏi
    for (let i = 0; i < questions.length; i++) {
      const question = { ...questions[i] };
      const questionNum = i + 1;
      
      // Lấy nội dung câu hỏi (bỏ "Câu XX:")
      const questionContent = question.question.replace(/^Câu \d+:\s*/, '').trim();
      const questionWords = questionContent.split(' ').slice(0, 10).join(' '); // Lấy 10 từ đầu
      
      // Tìm trong HTML
      let foundAnswer = null;
      const regex = new RegExp(questionWords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      
      if (regex.test(htmlContent)) {
        // Tìm vị trí của câu hỏi trong HTML
        const questionIndex = htmlContent.search(regex);
        if (questionIndex !== -1) {
          // Lấy đoạn HTML từ vị trí câu hỏi cho đến câu hỏi tiếp theo
          const nextQuestionRegex = /<p><strong>Câu \d+[:\s]/g;
          nextQuestionRegex.lastIndex = questionIndex + questionWords.length;
          const nextMatch = nextQuestionRegex.exec(htmlContent);
          
          const endIndex = nextMatch ? nextMatch.index : questionIndex + 2000;
          const questionBlock = htmlContent.substring(questionIndex, endIndex);
          
          // Tìm đáp án được bôi đậm (trong thẻ <strong> và bắt đầu bằng a., b., c., d.)
          const strongMatches = questionBlock.match(/<strong>([a-d]\..*?)<\/strong>/g);
          
          if (strongMatches && strongMatches.length > 0) {
            for (const strongMatch of strongMatches) {
              let content = strongMatch.replace(/<\/?strong>/g, '');
              
              // Kiểm tra xem có phải đáp án không (bắt đầu bằng a., b., c., d.)
              if (content.match(/^[a-d]\./)) {
                // Làm sạch đáp án (loại bỏ thẻ HTML bên trong)
                content = content.replace(/<[^>]*>/g, '');
                foundAnswer = content;
                htmlBasedAnswerCount++;
                break;
              }
            }
          }
        }
      }
      
      if (foundAnswer) {
        question.answer = foundAnswer;
        correctAnswerCount++;
        
        if (questionNum <= 10 || questionNum === 33 || questionNum === 160 || questionNum % 50 === 0) {
          console.log(`✅ Câu ${questionNum}: ${foundAnswer.substring(0, 50)}...`);
        }
      } else {
        // Giữ nguyên đáp án cũ nếu không tìm thấy trong HTML
        if (questionNum <= 10) {
          console.log(`⚠️  Câu ${questionNum}: Không tìm thấy trong HTML, giữ đáp án cũ`);
        }
      }
      
      updatedQuestions.push(question);
    }
    
    console.log(`\n📊 Kết quả:`);
    console.log(`   📝 Đã tìm thấy ${htmlBasedAnswerCount} câu trong HTML`);
    console.log(`   ✅ Đã cập nhật ${correctAnswerCount} đáp án từ text bôi đậm`);
    console.log(`   🔄 Giữ nguyên ${questions.length - correctAnswerCount} đáp án cũ`);
    
    // Kiểm tra phân bổ đáp án
    const answerStats = updatedQuestions.reduce((acc, q) => {
      const ans = q.answer.charAt(0);
      acc[ans] = (acc[ans] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Phân bổ đáp án:', answerStats);
    
    // Tính tỷ lệ phân bổ
    const total = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    const percentages = Object.entries(answerStats).reduce((acc, [key, value]) => {
      acc[key] = ((value / total) * 100).toFixed(1) + '%';
      return acc;
    }, {});
    console.log('📈 Tỷ lệ đáp án:', percentages);
    
    // Lưu kết quả
    const outputPath = path.join(__dirname, 'questions_with_correct_answers_v2.json');
    fs.writeFileSync(outputPath, JSON.stringify(updatedQuestions, null, 2));
    console.log(`💾 Đã lưu vào: ${outputPath}`);
    
    // Cập nhật vào quiz app
    const quizAppPath = path.join(__dirname, 'quiz-app', 'src', 'data', 'questions.json');
    fs.writeFileSync(quizAppPath, JSON.stringify(updatedQuestions, null, 2));
    console.log(`🎯 Đã cập nhật vào quiz app`);
    
    return updatedQuestions;
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return null;
  }
}

// Chạy script
if (require.main === module) {
  extractAnswersFromHTML();
}

module.exports = { extractAnswersFromHTML };
