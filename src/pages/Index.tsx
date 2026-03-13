import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, Home, Trophy, Sparkles } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="animate-fade-up space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-2">
            <img src="/favicon.png" alt="LearnQuest" className="h-14 w-14 rounded-2xl object-cover shadow-lg animate-pulse-glow" />
            <h1 className="text-6xl font-bold text-foreground">LearnQuest</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Learn through quizzes, earn coins, and build your dream virtual house!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: BookOpen, label: 'Take Quizzes', color: 'text-primary' },
              { icon: Coins, label: 'Earn Coins', color: 'text-[hsl(var(--coin))]' },
              { icon: Home, label: 'Build House', color: 'text-[hsl(var(--success))]' },
              { icon: Trophy, label: 'Compete', color: 'text-[hsl(var(--warning))]' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <Icon className={`h-8 w-8 ${color}`} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 h-12">
                <Sparkles className="h-5 w-5 mr-2" /> Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
