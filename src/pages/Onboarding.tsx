import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Flame, Mountain, BookOpen } from 'lucide-react';

const PREFERENCE_KEY = 'learnquest_preferred_difficulty';
const ONBOARDING_DONE_KEY = 'learnquest_onboarding_done';

const OPTIONS = [
  { value: 'easy', label: 'Easy', description: 'Gentle pace to build confidence', icon: Sparkles },
  { value: 'medium', label: 'Medium', description: 'Balanced challenge', icon: Flame },
  { value: 'hard', label: 'Hard', description: 'Tough questions', icon: Mountain },
  { value: 'any', label: 'Any', description: 'Mix of all', icon: BookOpen },
] as const;

const Onboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    if (localStorage.getItem(ONBOARDING_DONE_KEY) === 'true') {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleChoose = (value: string) => {
    setSubmitting(true);
    localStorage.setItem(PREFERENCE_KEY, value);
    localStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    navigate('/dashboard');
  };

  if (loading || !user || localStorage.getItem(ONBOARDING_DONE_KEY) === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src="/favicon.png" alt="LearnQuest" className="h-10 w-10 rounded-xl object-cover" />
            <span className="text-2xl font-bold text-foreground">LearnQuest</span>
          </div>
          <p className="text-muted-foreground">Quick question before you start</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>What’s your preferred quiz difficulty?</CardTitle>
            <CardDescription>
              We’ll show you quizzes that match. You can change this anytime on the Quizzes page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {OPTIONS.map(({ value, label, description, icon: Icon }) => (
              <Button
                key={value}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4 text-left"
                onClick={() => handleChoose(value)}
                disabled={submitting}
              >
                <Icon className="h-5 w-5 mr-3 text-primary shrink-0" />
                <div>
                  <span className="font-semibold">{label}</span>
                  <span className="block text-sm text-muted-foreground font-normal">{description}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
