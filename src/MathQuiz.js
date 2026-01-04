import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import io from 'socket.io-client';
import styles from './styles/mathquiz.module.css';

const MathQuiz = () => {
  const { authState } = useAuth();
  const { walletState } = useWallet();
  const { user } = authState;
  const { wallet_balance } = walletState;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10); // Total questions in the quiz
  const [totalTimeLeft, setTotalTimeLeft] = useState(30); // Total time for the game in seconds
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [entryFee, setEntryFee] = useState(5);
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [waitingTimeLeft, setWaitingTimeLeft] = useState(30);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('matchFound', () => {
      setWaitingForMatch(false);
      setGameStarted(true);
      setScore(0);
      setQuestionCount(0);
      setGameOver(false);
      setTotalTimeLeft(30);
      // Wait for server to send first question
    });

    newSocket.on('newQuestion', (data) => {
      setQuestion(data.question);
      setQuestionCount(data.questionNumber - 1);
      setTotalQuestions(data.totalQuestions);
    });

    newSocket.on('answerResult', (data) => {
      if (data.correct) {
        setScore(prev => prev + 1);
      }
      setQuestionCount(prev => prev + 1);
    });

    newSocket.on('gameResult', (data) => {
      setGameOver(true);
      setGameStarted(false);

      if (data.result === 'finished') {
        const isWinner = data.winner === user.id;
        alert(`${data.message}\nYour score: ${data.scores[user.id]}\nOpponent score: ${data.scores[data.winner === user.id ? data.loser : data.winner]}\n${isWinner ? `You won ${data.winnerAmount} INR!` : 'Better luck next time!'}`);
      } else if (data.result === 'tie') {
        alert(`${data.message}\nYour score: ${data.scores[user.id]}\nOpponent score: ${data.scores[Object.keys(data.scores).find(id => id !== user.id)]}`);
      } else if (data.result === 'disconnected') {
        alert(data.message);
      }
    });

    newSocket.on('refund', () => {
      setWaitingForMatch(false);
      alert('No match found. Entry fee refunded.');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setWaitingForMatch(false);
      alert('An error occurred. Please try again.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTotalTimeLeft(prev => {
          if (prev <= 1) {
            // Reset to match join start
            setGameStarted(false);
            setGameOver(false);
            setWaitingForMatch(false);
            setScore(0);
            setQuestionCount(0);
            setTotalTimeLeft(30);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    let waitingTimer;
    if (waitingForMatch) {
      setWaitingTimeLeft(30);
      waitingTimer = setInterval(() => {
        setWaitingTimeLeft(prev => {
          if (prev <= 1) {
            setWaitingForMatch(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (waitingTimer) clearInterval(waitingTimer);
    };
  }, [waitingForMatch]);

  // Question generation is now handled by the backend
  // Game flow is managed entirely by socket events

  const submitAnswer = () => {
    if (!answer.trim()) return;
    socket.emit('submitAnswer', { answer: answer.trim() });
    setAnswer('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitAnswer();
    }
  };

  const joinGame = () => {
    if (!user) {
      alert('Please login first');
      return;
    }
    if (user.wallet_balance < entryFee) {
      alert('Insufficient wallet balance');
      return;
    }
    setWaitingForMatch(true);
    socket.emit('joinGame', { userId: user.id, entryFee });
  };

  const entryFees = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

  return (
    <div className={styles.mathQuiz}>
      {!gameStarted && !waitingForMatch ? (
        <div>
          <h3>Math Quiz Challenge</h3>
          <p>Select entry fee and find a match!</p>
          <select value={entryFee} onChange={(e) => setEntryFee(Number(e.target.value))}>
            {entryFees.map(fee => (
              <option key={fee} value={fee}>{fee} Rs</option>
            ))}
          </select>
          <p>Wallet Balance: {user ? user.wallet_balance : 0} Rs</p>
          <button className={styles.join} onClick={joinGame}>Join Game</button>
        </div>
      ) : waitingForMatch ? (
        <div>
          <h3>Waiting for Match...</h3>
          <p>Entry Fee: {entryFee} Rs</p>
          <p>Looking for another player with the same entry fee.</p>
          <p>Time Left: {waitingTimeLeft}s</p>
        </div>
      ) : gameOver ? (
        <div>
          <h3>Quiz Over!</h3>
          <p>Your Score: {score} / {questionCount}</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      ) : (
        <div>
          <h3>Question {questionCount + 1} / {totalQuestions}</h3>
          <p>Score: {score}</p>
          <p>Total Time Left: {totalTimeLeft}s</p>
          <svg className={styles.spinner} width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#667eea" strokeWidth="10" fill="none" strokeOpacity={totalTimeLeft / 30} />
          </svg>
          <p>{question}</p>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Your answer"
          />
          <button onClick={submitAnswer}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default MathQuiz;
