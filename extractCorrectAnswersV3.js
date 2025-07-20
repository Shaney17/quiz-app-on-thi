const fs = require('fs');
const path = require('path');

function extractAnswersFromHTMLImproved() {
  try {
    console.log('🔧 Script cải tiến để trích xuất đáp án chính xác từ HTML...');

    // Đọc file HTML
    const htmlPath = path.join(__dirname, 'word_content_with_formatting.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Đọc dữ liệu câu hỏi hiện tại
    const questionsPath = path.join(__dirname, 'quiz-app', 'src', 'data', 'questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`📊 Đọc được ${questions.length} câu hỏi`);

    let updatedQuestions = [];
    let correctAnswerCount = 0;

    // Trích xuất tất cả các câu hỏi từ HTML
    const questionBlocks = htmlContent.split(/<p><strong>Câu \d+[:\s]/);
    console.log(`📄 Tìm thấy ${questionBlocks.length - 1} câu hỏi trong HTML`);

    // Tạo map các câu hỏi từ HTML
    const htmlQuestions = {};

    for (let i = 1; i < questionBlocks.length; i++) {
      const block = questionBlocks[i];

      // Tìm số câu hỏi
      const questionNumMatch = htmlContent.match(new RegExp(`<p><strong>Câu (\\d+)[:\\s][^<]*</strong>.*?${block.substring(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 's'));
      if (!questionNumMatch) continue;

      const questionNum = parseInt(questionNumMatch[1]);

      // Tìm đáp án được bôi đậm
      const strongAnswerMatch = block.match(/<strong>([a-d][)\.]\s*[^<]+)<\/strong>/);

      if (strongAnswerMatch) {
        const answer = strongAnswerMatch[1].replace(/<[^>]*>/g, '').trim();
        htmlQuestions[questionNum] = answer;

        if (questionNum <= 10 || questionNum % 20 === 0 || questionNum === 120) {
          console.log(`📝 Câu ${questionNum}: ${answer}`);
        }
      }
    }

    console.log(`✅ Đã tìm thấy ${Object.keys(htmlQuestions).length} đáp án từ HTML`);

    // Cập nhật đáp án cho các câu hỏi
    for (let i = 0; i < questions.length; i++) {
      const question = { ...questions[i] };

      // Tìm số câu trong nội dung
      const questionNumMatch = question.question.match(/Câu (\d+):/);
      if (questionNumMatch) {
        const questionNum = parseInt(questionNumMatch[1]);

        if (htmlQuestions[questionNum]) {
          question.answer = htmlQuestions[questionNum];
          correctAnswerCount++;

          if (questionNum === 120) {
            console.log(`🎯 Cập nhật câu ${questionNum}: ${htmlQuestions[questionNum]}`);
          }
        }
      }

      updatedQuestions.push(question);
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Đã cập nhật ${correctAnswerCount}/${questions.length} đáp án từ HTML`);

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

    // Tính tỷ lệ phân bổ
    const total = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    const percentages = Object.entries(answerStats).reduce((acc, [key, value]) => {
      acc[key] = ((value / total) * 100).toFixed(1) + '%';
      return acc;
    }, {});
    console.log('📈 Tỷ lệ đáp án:', percentages);

    // Kiểm tra câu 120 cụ thể
    const q120 = updatedQuestions.find(q => q.question.includes('Câu 120:'));
    if (q120) {
      console.log(`\n🔍 Kiểm tra câu 120:`);
      console.log(`   Câu hỏi: ${q120.question}`);
      console.log(`   Đáp án: ${q120.answer}`);
    }

    // Lưu kết quả
    const outputPath = path.join(__dirname, 'questions_with_correct_answers_v3.json');
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
  extractAnswersFromHTMLImproved();
}

module.exports = { extractAnswersFromHTMLImproved };
