const fs = require('fs');
const path = require('path');

function finalizeQuizApp() {
  try {
    console.log('🔧 Finalizing quiz app with accurate data...');
    
    // Đọc dữ liệu chính xác từ file Word
    const accurateDataPath = path.join(__dirname, 'questions_accurate_from_word.json');
    
    if (!fs.existsSync(accurateDataPath)) {
      console.error('❌ File questions_accurate_from_word.json không tồn tại!');
      return false;
    }
    
    const accurateData = JSON.parse(fs.readFileSync(accurateDataPath, 'utf8'));
    console.log(`📊 Đọc được ${accurateData.length} câu hỏi từ file Word gốc`);
    
    // Kiểm tra câu 160 có đúng không
    const question160 = accurateData.find(q => q.question.includes('7.500 cổ phiếu VIH'));
    if (question160) {
      console.log('✅ Tìm thấy câu 160 chính xác về VIH stock');
      console.log(`   ${question160.question.substring(0, 80)}...`);
    } else {
      console.log('⚠️  Không tìm thấy câu 160 về VIH stock');
    }
    
    // Cập nhật vào quiz app
    const quizAppDataPath = path.join(__dirname, 'quiz-app', 'src', 'data', 'questions.json');
    fs.writeFileSync(quizAppDataPath, JSON.stringify(accurateData, null, 2));
    console.log(`✅ Đã cập nhật ${accurateData.length} câu hỏi vào quiz app`);
    
    // Tạo backup
    const backupPath = path.join(__dirname, 'quiz-app', 'src', 'data', 'questions_backup.json');
    const originalExists = fs.existsSync(quizAppDataPath);
    if (originalExists) {
      try {
        const originalData = fs.readFileSync(quizAppDataPath, 'utf8');
        fs.writeFileSync(backupPath, originalData);
        console.log('💾 Đã tạo backup của dữ liệu cũ');
      } catch (err) {
        console.log('ℹ️  Không thể tạo backup (có thể file cũ bị lỗi)');
      }
    }
    
    // Kiểm tra lại dữ liệu đã cập nhật
    const updatedData = JSON.parse(fs.readFileSync(quizAppDataPath, 'utf8'));
    console.log(`🎯 Verification: Quiz app hiện có ${updatedData.length} câu hỏi`);
    
    // Kiểm tra một số câu quan trọng
    const testQuestions = [1, 33, 111, 160];
    testQuestions.forEach(num => {
      const q = updatedData.find(item => item.question.includes(`Câu ${num}:`));
      if (q) {
        console.log(`✅ Câu ${num}: OK`);
      } else {
        console.log(`❌ Câu ${num}: Không tìm thấy`);
      }
    });
    
    console.log('\n🚀 Hoàn thành! Quiz app đã được cập nhật với dữ liệu chính xác từ file Word.');
    console.log('   Bạn có thể chạy: cd quiz-app && npm start để kiểm tra ứng dụng.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi finalize quiz app:', error.message);
    return false;
  }
}

// Chạy script
if (require.main === module) {
  finalizeQuizApp();
}

module.exports = { finalizeQuizApp };
