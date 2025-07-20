const fs = require('fs');
const path = require('path');

function extractAnswersDirectly() {
  try {
    console.log('🔧 Trích xuất đáp án trực tiếp từ HTML...');

    // Đọc file HTML
    const htmlPath = path.join(__dirname, 'word_content_with_formatting.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Đọc dữ liệu câu hỏi hiện tại
    const questionsPath = path.join(__dirname, 'quiz-app', 'src', 'data', 'questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`📊 Đọc được ${questions.length} câu hỏi`);

    // Parse HTML để tìm tất cả câu hỏi và đáp án
    const htmlAnswers = {};

    // Regex để tìm pattern: <strong>Câu X</strong>: ... followed by answer options
    const questionPattern = /<p><strong>Câu (\d+)[:\s]*<\/strong>[^<]*([^]*?)(?=<p><strong>Câu \d+|$)/g;

    let match;
    while ((match = questionPattern.exec(htmlContent)) !== null) {
      const questionNum = parseInt(match[1]);
      const questionBlock = match[2];

      // Tìm đáp án được bôi đậm trong block này
      const boldAnswerPattern = /<strong>([a-d][)\.]\s*[^<]+)<\/strong>/g;
      let answerMatch;

      while ((answerMatch = boldAnswerPattern.exec(questionBlock)) !== null) {
        const answer = answerMatch[1].replace(/<[^>]*>/g, '').trim();

        // Chỉ lấy đáp án đầu tiên tìm được
        if (!htmlAnswers[questionNum] && answer.match(/^[a-d][)\.]/)) {
          htmlAnswers[questionNum] = answer;
          break;
        }
      }
    }

    console.log(`✅ Đã tìm thấy ${Object.keys(htmlAnswers).length} đáp án từ HTML`);

    // Log một vài đáp án để kiểm tra
    [1, 2, 3, 120, 121].forEach(num => {
      if (htmlAnswers[num]) {
        console.log(`📝 Câu ${num}: ${htmlAnswers[num]}`);
      }
    });

    // Cập nhật đáp án cho các câu hỏi
    let updatedCount = 0;
    const updatedQuestions = questions.map(question => {
      const questionNumMatch = question.question.match(/Câu (\d+):/);
      if (questionNumMatch) {
        const questionNum = parseInt(questionNumMatch[1]);

        if (htmlAnswers[questionNum]) {
          question.answer = htmlAnswers[questionNum];
          updatedCount++;
        }
      }
      return question;
    });

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Đã cập nhật ${updatedCount}/${questions.length} đáp án từ HTML`);

    // Kiểm tra phân bổ đáp án
    const answerStats = updatedQuestions.reduce((acc, q) => {
      const firstChar = q.answer.charAt(0).toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(firstChar)) {
        acc[firstChar] = (acc[firstChar] || 0) + 1;
      } else {
        acc['other'] = (acc['other'] || 0) + 1;
      }
      return acc;
    }, {});

    console.log('📈 Phân bổ đáp án:', answerStats);

    // Kiểm tra câu 120 cụ thể
    const q120 = updatedQuestions.find(q => q.question.includes('Câu 120:'));
    if (q120) {
      console.log(`\n🔍 Kiểm tra câu 120:`);
      console.log(`   Câu hỏi: ${q120.question}`);
      console.log(`   Đáp án: ${q120.answer}`);
      console.log(`   Từ HTML: ${htmlAnswers[120] || 'Không tìm thấy'}`);
    }

    // Lưu kết quả
    const outputPath = path.join(__dirname, 'questions_with_correct_answers_v4.json');
    fs.writeFileSync(outputPath, JSON.stringify(updatedQuestions, null, 2));
    console.log(`💾 Đã lưu vào: ${outputPath}`);

    // Cập nhật vào quiz app
    fs.writeFileSync(questionsPath, JSON.stringify(updatedQuestions, null, 2));
    console.log(`🎯 Đã cập nhật vào quiz app`);

    return updatedQuestions;

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
    return null;
  }
}

// Chạy script
if (require.main === module) {
  extractAnswersDirectly();
}

module.exports = { extractAnswersDirectly };
