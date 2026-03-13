import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Brain, Clock, CheckCircle2, XCircle, Coins, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import type { QuizQuestion } from '@/types/game';

const generateQuestions = (level: string): QuizQuestion[] => {
  const allQuestions: Record<string, QuizQuestion[]> = {
    beginner: [
      { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyper Transfer Markup Language'], correctAnswer: 0 },
      { question: 'Which tag is used for paragraphs in HTML?', options: ['<div>', '<p>', '<span>', '<h1>'], correctAnswer: 1 },
      { question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Creative Style System', 'Cascading Style Sheets', 'Colorful Style Sheets'], correctAnswer: 2 },
      { question: 'Which property changes text color in CSS?', options: ['font-color', 'text-color', 'color', 'foreground'], correctAnswer: 2 },
      { question: 'What symbol is used for IDs in CSS?', options: ['.', '#', '@', '&'], correctAnswer: 1 },
    ],
    intermediate: [
      { question: 'What is a closure in JavaScript?', options: ['A way to close browser tabs', 'A function with access to outer scope', 'A loop structure', 'An error handler'], correctAnswer: 1 },
      { question: 'Which method adds an element to the end of an array?', options: ['unshift()', 'push()', 'append()', 'add()'], correctAnswer: 1 },
      { question: 'What does "===" check in JavaScript?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correctAnswer: 2 },
      { question: 'What is the DOM?', options: ['Data Object Model', 'Document Object Model', 'Digital Output Method', 'Display Object Manager'], correctAnswer: 1 },
      { question: 'Which keyword declares a constant in JS?', options: ['var', 'let', 'const', 'static'], correctAnswer: 2 },
    ],
    expert: [
      { question: 'What is the event loop in JavaScript?', options: ['A for loop for events', 'Mechanism for async execution', 'A DOM event', 'Error handling loop'], correctAnswer: 1 },
      { question: 'What does "this" refer to in an arrow function?', options: ['The function itself', 'The global object', 'The enclosing lexical context', 'undefined'], correctAnswer: 2 },
      { question: 'What is a WeakMap used for?', options: ['Storing weak passwords', 'Key-value pairs with weakly held keys', 'Map with limited size', 'Geographical mapping'], correctAnswer: 1 },
      { question: 'What is tree shaking?', options: ['DOM manipulation', 'Dead code elimination', 'CSS animation', 'Error handling'], correctAnswer: 1 },
      { question: 'What is the purpose of Symbol in JavaScript?', options: ['Mathematical operations', 'Creating unique identifiers', 'String formatting', 'Type casting'], correctAnswer: 1 },
    ],
  };
  return allQuestions[level] || allQuestions.beginner;
};

const Quiz: React.FC = () => {
  const { user, addCoins, addXp, incrementQuizzes } = useGame();
  const [state, setState] = useState<'idle' | 'active' | 'result'>('idle');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState(false);

  const startQuiz = () => {
    if (!user) return;
    const qs = generateQuestions(user.skillLevel);
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setTimeLeft(15);
    setState('active');
  };

  useEffect(() => {
    if (state !== 'active' || answered) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, state, answered]);

  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === questions[currentQ].correctAnswer;
    if (correct) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(15);
      } else {
        const finalScore = correct ? score + 1 : score;
        const coinsEarned = finalScore * 10;
        const xpEarned = finalScore * 20;
        addCoins(coinsEarned);
        addXp(xpEarned);
        incrementQuizzes();
        setState('result');
        toast.success(`Quiz complete! +${coinsEarned} coins, +${xpEarned} XP`);
      }
    }, 1500);
  }, [answered, currentQ, questions, score, addCoins, addXp, incrementQuizzes]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="mx-auto max-w-2xl">
          {state === 'idle' && (
            <div className="card-game rounded-2xl p-8 text-center animate-slide-up">
              <Brain className="mx-auto h-16 w-16 text-primary mb-4" />
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Knowledge Quiz</h1>
              <p className="text-muted-foreground mb-2">Level: <span className="capitalize text-primary">{user.skillLevel}</span></p>
              <p className="text-sm text-muted-foreground mb-6">Answer 5 questions to earn coins and XP!</p>
              <button onClick={startQuiz} className="btn-game rounded-xl px-8 py-3 text-sm text-primary-foreground transition-all hover:scale-105">
                START QUIZ
              </button>
            </div>
          )}

          {state === 'active' && questions[currentQ] && (
            <div className="animate-slide-up">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-sm text-muted-foreground">
                  Question {currentQ + 1}/{questions.length}
                </span>
                <div className={`flex items-center gap-1 font-display text-sm ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Clock className="h-4 w-4" /> {timeLeft}s
                </div>
              </div>
              
              <div className="mb-2 h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
              </div>

              <div className="card-game rounded-2xl p-6 mt-4">
                <h2 className="font-display text-lg font-semibold text-foreground mb-6">
                  {questions[currentQ].question}
                </h2>
                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, idx) => {
                    let btnClass = 'border border-border hover:border-primary/50 hover:bg-primary/5';
                    if (answered) {
                      if (idx === questions[currentQ].correctAnswer) btnClass = 'border-2 border-xp bg-xp/10';
                      else if (idx === selected) btnClass = 'border-2 border-destructive bg-destructive/10';
                      else btnClass = 'border border-border opacity-50';
                    }
                    return (
                      <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                        className={`w-full rounded-xl p-4 text-left text-sm transition-all ${btnClass}`}>
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-foreground">{opt}</span>
                          {answered && idx === questions[currentQ].correctAnswer && <CheckCircle2 className="ml-auto h-5 w-5 text-xp" />}
                          {answered && idx === selected && idx !== questions[currentQ].correctAnswer && <XCircle className="ml-auto h-5 w-5 text-destructive" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {state === 'result' && (
            <div className="card-game rounded-2xl p-8 text-center animate-slide-up">
              <div className="text-6xl mb-4">{score >= 4 ? '🏆' : score >= 2 ? '⭐' : '💪'}</div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
              <p className="text-lg text-muted-foreground mb-6">
                You got <span className="text-primary font-bold">{score}/{questions.length}</span> correct
              </p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-4 py-2">
                  <Coins className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold text-accent">+{score * 10}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-xp/10 border border-xp/30 px-4 py-2">
                  <Zap className="h-4 w-4 text-xp" />
                  <span className="text-sm font-semibold text-xp">+{score * 20}</span>
                </div>
              </div>
              <button onClick={startQuiz} className="btn-game rounded-xl px-8 py-3 text-sm text-primary-foreground transition-all hover:scale-105">
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
