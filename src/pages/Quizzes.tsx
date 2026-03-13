import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Coins, CheckCircle, XCircle, ArrowLeft, Sparkles, Flame, Mountain } from 'lucide-react';

const PREFERENCE_KEY = 'learnquest_preferred_difficulty';

type DifficultyFilter = 'easy' | 'medium' | 'hard' | 'any' | null;

function getSavedDifficulty(): DifficultyFilter {
  const saved = localStorage.getItem(PREFERENCE_KEY);
  if (saved === 'easy' || saved === 'medium' || saved === 'hard' || saved === 'any') return saved;
  return null;
}

const DIFFICULTY_OPTIONS: { value: DifficultyFilter; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'easy', label: 'Easy', description: 'Gentle questions to build confidence', icon: <Sparkles className="h-6 w-6" /> },
  { value: 'medium', label: 'Medium', description: 'A balanced challenge', icon: <Flame className="h-6 w-6" /> },
  { value: 'hard', label: 'Hard', description: 'Tough questions for a real test', icon: <Mountain className="h-6 w-6" /> },
  { value: 'any', label: 'Any', description: 'Mix of all difficulties', icon: <BookOpen className="h-6 w-6" /> },
];

const Quizzes = () => {
  const { user } = useAuth();
  const { updateCoins, addXp } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>(getSavedDifficulty);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data } = await supabase.from('quizzes').select('*');
      return data ?? [];
    },
  });

  const { data: questions } = useQuery({
    queryKey: ['questions', activeQuiz],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', activeQuiz!);
      return data ?? [];
    },
    enabled: !!activeQuiz,
  });

  const { data: completedQuizIds } = useQuery({
    queryKey: ['completed-quizzes', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_quiz_results')
        .select('quiz_id')
        .eq('user_id', user!.id);
      return data?.map(r => r.quiz_id) ?? [];
    },
    enabled: !!user,
  });

  const submitResult = useMutation({
    mutationFn: async ({ quizId, score, total, coinsEarned }: any) => {
      await supabase.from('user_quiz_results').insert({
        user_id: user!.id,
        quiz_id: quizId,
        score,
        total_questions: total,
        coins_earned: coinsEarned,
        completed_at: new Date().toISOString(),
      });
      // Mark daily quiz as complete
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('daily_quiz_tracking').upsert({
        user_id: user!.id,
        quiz_date: today,
        completed: true,
      }, { onConflict: 'user_id,quiz_date' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['daily-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
      queryClient.invalidateQueries({ queryKey: ['stats-progress'] });
    },
  });

  const handleAnswer = (index: number) => {
    if (answered !== null) return;
    setAnswered(index);
    const correct = questions![currentQ].correct_answer;
    if (index === correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= (questions?.length ?? 0)) {
      // Finish quiz
      const quiz = quizzes?.find(q => q.id === activeQuiz);
      const passed = score + (answered === questions![currentQ].correct_answer ? 0 : 0) >= Math.ceil((questions?.length ?? 1) * 0.6);
      const finalScore = score + (answered === questions![currentQ].correct_answer ? 1 : 0);
      const coinsEarned = finalScore >= Math.ceil((questions?.length ?? 1) * 0.6) ? (quiz?.coin_reward ?? 10) : 0;

      if (coinsEarned > 0) {
        updateCoins.mutate(coinsEarned);
        addXp.mutate(coinsEarned * 2);
      }

      submitResult.mutate({
        quizId: activeQuiz,
        score: finalScore,
        total: questions?.length ?? 0,
        coinsEarned,
      });

      setFinished(true);
      toast({
        title: coinsEarned > 0 ? '🎉 Quiz Passed!' : '😔 Quiz Failed',
        description: coinsEarned > 0
          ? `You earned ${coinsEarned} coins!`
          : 'Score at least 60% to earn coins. Try again!',
      });
    } else {
      setCurrentQ(c => c + 1);
      setAnswered(null);
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setCurrentQ(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  };

  // Active quiz view
  if (activeQuiz && questions) {
    if (finished) {
      const totalCorrect = score + (answered === questions[currentQ]?.correct_answer ? 1 : 0);
      const passed = totalCorrect >= Math.ceil(questions.length * 0.6);
      return (
        <div className="max-w-2xl mx-auto animate-fade-up">
          <Card className="text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-4">{passed ? '🏆' : '📚'}</div>
              <h2 className="text-2xl font-bold mb-2">
                {passed ? 'Congratulations!' : 'Keep Learning!'}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Score: {totalCorrect}/{questions.length}
              </p>
              {passed && (
                <p className="text-lg font-semibold text-primary animate-coin-bounce inline-block">
                  <Coins className="inline h-5 w-5 mr-1" />
                  +{quizzes?.find(q => q.id === activeQuiz)?.coin_reward ?? 10} coins!
                </p>
              )}
              <div className="mt-6">
                <Button onClick={resetQuiz}>Back to Quizzes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const q = questions[currentQ];
    const options = q.options as string[];
    return (
      <div className="max-w-2xl mx-auto animate-fade-up">
        <Button variant="ghost" onClick={resetQuiz} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Question {currentQ + 1}/{questions.length}</CardTitle>
              <Badge variant="secondary">Score: {score}</Badge>
            </div>
            <Progress value={((currentQ + 1) / questions.length) * 100} className="mt-2 h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">{q.question}</h3>
            <div className="grid gap-3">
              {options.map((opt, i) => {
                let variant: 'outline' | 'default' | 'destructive' = 'outline';
                if (answered !== null) {
                  if (i === q.correct_answer) variant = 'default';
                  else if (i === answered) variant = 'destructive';
                }
                return (
                  <Button
                    key={i}
                    variant={variant}
                    className="justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleAnswer(i)}
                    disabled={answered !== null}
                  >
                    {answered !== null && i === q.correct_answer && (
                      <CheckCircle className="h-4 w-4 mr-2 shrink-0" />
                    )}
                    {answered !== null && i === answered && i !== q.correct_answer && (
                      <XCircle className="h-4 w-4 mr-2 shrink-0" />
                    )}
                    {opt}
                  </Button>
                );
              })}
            </div>
            {answered !== null && (
              <Button onClick={handleNext} className="w-full mt-4">
                {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question →'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Difficulty picker (show first before quiz list)
  if (selectedDifficulty === null) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" /> Quizzes
          </h1>
          <p className="text-muted-foreground mt-1">Choose your difficulty to see matching quizzes. Score 60% or higher to pass and earn coins!</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">How hard do you want to go?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <Card
                key={opt.value ?? 'any'}
                className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => {
                  if (opt.value) {
                    localStorage.setItem(PREFERENCE_KEY, opt.value);
                    setSelectedDifficulty(opt.value);
                  }
                }}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2 text-primary">{opt.icon}</div>
                  <CardTitle className="text-lg">{opt.label}</CardTitle>
                  <CardDescription className="text-sm">{opt.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz list (filtered by selected difficulty)
  const difficultyColor = (d: string) => {
    if (d === 'easy') return 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]';
    if (d === 'medium') return 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]';
    return 'bg-destructive/10 text-destructive';
  };

  const filteredQuizzes =
    selectedDifficulty === 'any'
      ? quizzes ?? []
      : (quizzes ?? []).filter((q) => (q.difficulty ?? '').toLowerCase() === selectedDifficulty);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" /> Quizzes
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedDifficulty === 'any' ? 'Showing all difficulties.' : `Showing ${selectedDifficulty} quizzes.`} Score 60% or higher to pass!
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelectedDifficulty(null)}>
          Change difficulty
        </Button>
      </div>

      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p className="font-medium">No {selectedDifficulty === 'any' ? '' : selectedDifficulty + ' '}quizzes available.</p>
            <Button variant="link" className="mt-2" onClick={() => setSelectedDifficulty(null)}>
              Choose a different difficulty
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => {
            const done = completedQuizIds?.includes(quiz.id);
            return (
              <Card key={quiz.id} className={`hover:border-primary/50 transition-colors ${done ? 'opacity-75' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    {done && <Badge variant="secondary">✓ Done</Badge>}
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="text-xs">{quiz.category}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Coins className="h-4 w-4 text-[hsl(var(--coin))]" /> {quiz.coin_reward} coins
                    </span>
                    <Button size="sm" onClick={() => setActiveQuiz(quiz.id)}>
                      {done ? 'Retry' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
