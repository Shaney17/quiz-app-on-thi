import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import './App.css';

// Component cho từng câu hỏi
const QuestionCard = ({ question, options, onAnswer, selectedAnswer, isSubmitted }) => {
  return (
    <div className="question-card">
      <h3>{question}</h3>
      <div className="options">
        {options.map((option, index) => (
          <label key={index} className="option">
            <input
              type="radio"
              name={`question-${Math.random()}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswer(option)}
              disabled={isSubmitted}
            />
            <span className={`option-text ${isSubmitted && selectedAnswer === option ? 'selected' : ''}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Component hiển thị kết quả
const Results = ({ score, total, questions, userAnswers, onRestart }) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="results">
      <div className="score-summary">
        <h2>Kết quả bài thi</h2>
        <div className="score">
          <span className="score-number">{score}/{total}</span>
          <span className="percentage">({percentage}%)</span>
        </div>
        <div className="score-details">
          <span className="correct">Đúng: {score}</span>
          <span className="incorrect">Sai: {total - score}</span>
        </div>
      </div>

      <div className="detailed-results">
        <h3>Chi tiết đáp án</h3>
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === q.answer;

          return (
            <div key={index} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <span className="question-number">Câu {index + 1}</span>
                <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              </div>
              <p className="question-text">{q.question}</p>
              <div className="answer-comparison">
                <div className="user-answer">
                  <strong>Câu trả lời của bạn:</strong>
                  <span className={isCorrect ? 'correct-answer' : 'wrong-answer'}>
                    {userAnswer || 'Chưa trả lời'}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="correct-answer-display">
                    <strong>Đáp án đúng:</strong>
                    <span className="correct-answer">{q.answer}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button className="restart-btn" onClick={onRestart}>
        Làm bài mới
      </button>
    </div>
  );
};

// Component chính
function App() {
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Hàm xáo trộn mảng
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Hàm tạo bộ đề mới
  const generateNewQuiz = () => {
    const shuffledQuestions = shuffleArray(questionsData);
    const selectedQuestions = shuffledQuestions.slice(0, 30);

    setCurrentQuestions(selectedQuestions);
    setUserAnswers(new Array(30).fill(''));
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
  };

  // Khởi tạo bài thi lần đầu
  useEffect(() => {
    generateNewQuiz();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Xử lý khi người dùng chọn đáp án
  const handleAnswer = (questionIndex, answer) => {
    if (isSubmitted) return;

    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  // Xử lý khi nộp bài
  const handleSubmit = () => {
    const unansweredCount = userAnswers.filter(answer => answer === '').length;

    // Nếu còn câu chưa trả lời, hiển thị thông báo xác nhận
    if (unansweredCount > 0) {
      const confirmMessage = `Bạn còn ${unansweredCount} câu chưa trả lời. Những câu này sẽ được tính là sai.\n\nBạn có chắc chắn muốn nộp bài không?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    const calculatedScore = currentQuestions.reduce((score, question, index) => {
      return userAnswers[index] === question.answer ? score + 1 : score;
    }, 0);

    setScore(calculatedScore);
    setIsSubmitted(true);
    setShowResults(true);
  };

  // Restart quiz
  const handleRestart = () => {
    generateNewQuiz();
  };

  // Kiểm tra xem đã trả lời tất cả câu hỏi chưa
  const isAllAnswered = userAnswers.every(answer => answer !== '');
  const answeredCount = userAnswers.filter(answer => answer !== '').length;

  if (showResults) {
    return (
      <div className="App">
        <Results
          score={score}
          total={currentQuestions.length}
          questions={currentQuestions}
          userAnswers={userAnswers}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Hệ thống Trắc nghiệm Chứng khoán</h1>
        <div className="quiz-info">
          <span>Tổng số câu: {currentQuestions.length}</span>
          <span>Đã trả lời: {answeredCount}/{currentQuestions.length}</span>
          {answeredCount < currentQuestions.length && (
            <span className="remaining">Còn lại: {currentQuestions.length - answeredCount}</span>
          )}
        </div>
      </header>

      <main className="quiz-container">
        {currentQuestions.map((question, index) => (
          <QuestionCard
            key={index}
            question={question.question}
            options={question.options}
            onAnswer={(answer) => handleAnswer(index, answer)}
            selectedAnswer={userAnswers[index]}
            isSubmitted={isSubmitted}
          />
        ))}

        <div className="quiz-actions">
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitted || answeredCount === 0}
          >
            {isAllAnswered
              ? 'Nộp bài và xem kết quả'
              : answeredCount === 0
                ? 'Hãy trả lời ít nhất 1 câu'
                : `Nộp bài (${answeredCount}/30 câu)`
            }
          </button>

          <button
            className="new-quiz-btn"
            onClick={generateNewQuiz}
            disabled={isSubmitted}
          >
            Tạo đề mới
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
