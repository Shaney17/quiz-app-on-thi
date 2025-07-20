const fs = require('fs');

try {
  const content = fs.readFileSync('questions_ck_ttck.json', 'utf8');
  console.log('File size:', content.length, 'characters');

  const data = JSON.parse(content);
  console.log('✅ JSON valid, có', data.length, 'câu hỏi');

  // Kiểm tra 10 câu đầu và cuối
  console.log('\n10 câu đầu:');
  for (let i = 0; i < Math.min(10, data.length); i++) {
    console.log(`Câu ${i + 1}: ${data[i].question.substring(0, 50)}...`);
  }

  console.log('\n10 câu cuối:');
  for (let i = Math.max(0, data.length - 10); i < data.length; i++) {
    console.log(`Câu ${i + 1}: ${data[i].question.substring(0, 50)}...`);
  }

} catch (e) {
  console.log('❌ Lỗi:', e.message);
  console.log('Stack:', e.stack);
}
