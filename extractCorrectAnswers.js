const fs = require('fs');
const path = require('path');

function extractAnswersFromHTML() {
  try {
    console.log('🔍 Trích xuất đáp án chính xác từ file Word HTML...');
    
    // Đọc file HTML
    const htmlPath = path.join(__dirname, 'word_content_with_formatting.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Đọc dữ liệu câu hỏi hiện tại
    const questionsPath = path.join(__dirname, 'questions_accurate_from_word.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`📊 Đọc được ${questions.length} câu hỏi`);
    
    // Tách HTML thành các đoạn theo câu hỏi
    const questionBlocks = htmlContent.split(/<p><strong>Câu \d+[:\s]/);
    console.log(`📄 Tìm thấy ${questionBlocks.length - 1} block câu hỏi trong HTML`);
    
    let updatedQuestions = [];
    let correctAnswerCount = 0;
    
    // Xử lý từng câu hỏi
    for (let i = 0; i < questions.length; i++) {
      const question = { ...questions[i] };
      const questionNum = i + 1;
      
      // Tìm block HTML tương ứng
      let matchingBlock = null;
      for (let j = 1; j < questionBlocks.length; j++) {
        if (questionBlocks[j].includes(`</strong>`) && 
            (questionBlocks[j].includes('a.') || questionBlocks[j].includes('b.') || 
             questionBlocks[j].includes('c.') || questionBlocks[j].includes('d.'))) {
          
          // Kiểm tra xem block này có phải là câu hiện tại không
          const blockIndex = j;
          if (blockIndex === i + 1 || (blockIndex <= i + 5 && blockIndex >= i - 3)) {
            matchingBlock = questionBlocks[j];
            break;
          }
        }
      }
      
      if (matchingBlock) {
        // Tìm đáp án được bôi đậm (trong thẻ <strong>)
        const strongMatches = matchingBlock.match(/<strong>([a-d]\..*?)<\/strong>/g);
        
        if (strongMatches && strongMatches.length > 0) {
          // Tìm đáp án trong các thẻ strong
          let correctAnswer = null;
          
          for (const strongMatch of strongMatches) {
            const content = strongMatch.replace(/<\/?strong>/g, '');
            
            // Kiểm tra xem có phải đáp án không (bắt đầu bằng a., b., c., d.)
            if (content.match(/^[a-d]\./)) {
              correctAnswer = content;
              break;
            }
          }
          
          if (correctAnswer) {
            // Làm sạch đáp án (loại bỏ thẻ HTML bên trong)
            correctAnswer = correctAnswer.replace(/<[^>]*>/g, '');
            question.answer = correctAnswer;
            correctAnswerCount++;
            
            if (questionNum <= 10 || questionNum === 160) {
              console.log(`✅ Câu ${questionNum}: ${correctAnswer.substring(0, 50)}...`);
            }
          } else {
            // Nếu không tìm thấy đáp án bôi đậm, giữ nguyên đáp án cũ
            console.log(`⚠️  Câu ${questionNum}: Không tìm thấy đáp án bôi đậm`);
          }
        } else {
          console.log(`⚠️  Câu ${questionNum}: Không tìm thấy thẻ strong cho đáp án`);
        }
      } else {
        console.log(`⚠️  Câu ${questionNum}: Không tìm thấy block HTML tương ứng`);
      }
      
      updatedQuestions.push(question);
    }
    
    console.log(`\n📊 Kết quả: Đã trích xuất ${correctAnswerCount}/${questions.length} đáp án từ text bôi đậm`);
    
    // Kiểm tra phân bổ đáp án
    const answerStats = updatedQuestions.reduce((acc, q) => {
      const ans = q.answer.charAt(0);
      acc[ans] = (acc[ans] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Phân bổ đáp án:', answerStats);
    
    // Lưu kết quả
    const outputPath = path.join(__dirname, 'questions_with_correct_answers.json');
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
