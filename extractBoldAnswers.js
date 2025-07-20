const mammoth = require('mammoth');
const fs = require('fs');

async function extractWithBoldAnswers() {
  try {
    console.log('📖 Đang đọc file Word với thông tin formatting...');

    // Đọc file với formatting để nhận diện bold
    const result = await mammoth.convertToHtml({
      path: '500 câu hỏi _ Những vấn đề cơ bản về CK và TTCK _ Chỉnh _06.10.2022.docx',
      styleMap: [
        "b => strong", // Map bold to strong tags
        "strong => strong"
      ]
    });

    const html = result.value;

    // Lưu HTML để debug
    fs.writeFileSync('word_content_with_formatting.html', html, 'utf8');
    console.log('💾 Đã lưu HTML có formatting vào word_content_with_formatting.html');

    // Phân tích HTML để tìm đáp án bold
    const questions = extractQuestionsFromHtml(html);

    if (questions.length > 0) {
      fs.writeFileSync('questions_with_bold_answers.json', JSON.stringify(questions, null, 2), 'utf8');
      console.log(`✅ Đã trích xuất ${questions.length} câu hỏi với đáp án bold`);

      // Kiểm tra một số câu mẫu
      console.log('\n📋 KIỂM TRA MỘT SỐ CÂU VỚI ĐÁP ÁN BOLD:');
      [1, 2, 33, 160].forEach(num => {
        const q = questions.find(q => q.questionNumber === num);
        if (q) {
          console.log(`\n--- Câu ${num} ---`);
          console.log(`Q: ${q.question.substring(0, 80)}...`);
          q.options.forEach(opt => {
            const marker = opt.isBold ? ' ⭐ (BOLD - ĐÁNG ÁN)' : '';
            console.log(`   ${opt.text}${marker}`);
          });
          console.log(`A: ${q.answer}`);
        }
      });

      // Chuyển đổi sang format chuẩn cho quiz app
      const standardQuestions = questions.map((q, index) => ({
        question: `Câu ${index + 1}: ${q.question.replace(/^Câu\s+\d+:\s*/, '').trim()}`,
        options: q.options.map(opt => opt.text),
        answer: q.answer
      }));

      // Lưu và cập nhật quiz app
      const outputPath = '../questions_with_correct_bold_answers.json';
      fs.writeFileSync(outputPath, JSON.stringify(standardQuestions, null, 2), 'utf8');

      const quizAppPath = './quiz-app/src/data/questions.json';
      fs.writeFileSync(quizAppPath, JSON.stringify(standardQuestions, null, 2), 'utf8');

      console.log(`\n✅ ĐÃ HOÀN THÀNH!`);
      console.log(`📁 File có đáp án bold: ${outputPath}`);
      console.log(`📁 Đã cập nhật quiz app: ${quizAppPath}`);
      console.log(`📊 Tổng số câu: ${standardQuestions.length}`);

      // Thống kê về đáp án
      let boldAnswersFound = 0;
      let noBoldAnswers = 0;

      questions.forEach(q => {
        const boldOptions = q.options.filter(opt => opt.isBold);
        if (boldOptions.length > 0) {
          boldAnswersFound++;
        } else {
          noBoldAnswers++;
        }
      });

      console.log(`\n📊 THỐNG KÊ ĐÁP ÁN BOLD:`);
      console.log(`✅ Câu có đáp án bold: ${boldAnswersFound}`);
      console.log(`⚠️  Câu không có đáp án bold: ${noBoldAnswers}`);
      console.log(`📈 Tỷ lệ có đáp án bold: ${((boldAnswersFound / questions.length) * 100).toFixed(1)}%`);

    } else {
      console.log('❌ Không tìm thấy câu hỏi nào');
    }

  } catch (error) {
    console.error('❌ Lỗi khi đọc file Word:', error.message);
  }
}

function extractQuestionsFromHtml(html) {
  const questions = [];

  // Chia HTML thành các đoạn dựa trên câu hỏi
  const questionRegex = /<p[^>]*>.*?Câu\s+(\d+):\s*(.*?)<\/p>/gi;
  const sections = html.split(questionRegex);

  for (let i = 1; i < sections.length; i += 3) {
    const questionNumber = parseInt(sections[i]);
    const questionText = cleanHtmlTags(sections[i + 1]);
    const contentAfter = sections[i + 2] || '';

    // Tìm options trong nội dung sau câu hỏi
    const options = extractOptionsFromHtml(contentAfter);

    if (options.length > 0) {
      // Tìm đáp án bold
      const boldOption = options.find(opt => opt.isBold);
      const answer = boldOption ? boldOption.text : options[0]?.text || '';

      // Tạo câu hỏi hoàn chỉnh từ các phần
      let fullQuestion = `Câu ${questionNumber}: ${questionText}`;

      // Tìm thêm text của câu hỏi trong contentAfter (trước options đầu tiên)
      const beforeFirstOption = contentAfter.split(/<p[^>]*>.*?[a-d][\)\.]/i)[0];
      if (beforeFirstOption) {
        const additionalText = cleanHtmlTags(beforeFirstOption).trim();
        if (additionalText && !additionalText.match(/^[a-d][\)\.]/)) {
          fullQuestion += ' ' + additionalText;
        }
      }

      questions.push({
        questionNumber,
        question: fullQuestion,
        options,
        answer
      });
    }
  }

  return questions.sort((a, b) => a.questionNumber - b.questionNumber);
}

function extractOptionsFromHtml(html) {
  const options = [];

  // Tìm tất cả options (a., b., c., d. hoặc a), b), c), d))
  const optionRegex = /<p[^>]*>(.*?[a-d][\)\.]\s*(.*?))<\/p>/gi;
  let match;

  while ((match = optionRegex.exec(html)) !== null) {
    const fullMatch = match[1];
    const optionContent = match[2] || '';

    // Kiểm tra có bold không
    const isBold = fullMatch.includes('<strong>') || fullMatch.includes('<b>');

    // Làm sạch text
    const cleanText = cleanHtmlTags(fullMatch).trim();

    // Chỉ lấy nếu bắt đầu bằng a., b., c., d.
    if (cleanText.match(/^[a-d][\)\.]/)) {
      options.push({
        text: cleanText,
        isBold
      });
    }
  }

  return options;
}

function cleanHtmlTags(html) {
  return html
    .replace(/<[^>]*>/g, '') // Loại bỏ HTML tags
    .replace(/&nbsp;/g, ' ') // Chuyển &nbsp; thành space
    .replace(/&amp;/g, '&')  // Chuyển &amp; thành &
    .replace(/&lt;/g, '<')   // Chuyển &lt; thành <
    .replace(/&gt;/g, '>')   // Chuyển &gt; thành >
    .replace(/\s+/g, ' ')    // Gộp multiple spaces
    .trim();
}

// Chạy script
extractWithBoldAnswers();
