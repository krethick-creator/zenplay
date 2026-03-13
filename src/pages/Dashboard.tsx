import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Coins, Star, BookOpen, Trophy, AlertTriangle, Home, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  const { data: quizResults } = useQuery({
    queryKey: ['quiz-results', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_quiz_results')
        .select('*')
        .eq('user_id', user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: dailyTracking } = useQuery({
    queryKey: ['daily-tracking', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_quiz_tracking')
        .select('*')
        .eq('user_id', user!.id)
        .eq('quiz_date', today)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: itemCount } = useQuery({
    queryKey: ['user-items-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const xpProgress = ((profile?.xp ?? 0) % 100);
  const completedQuizzes = quizResults?.length ?? 0;
  const totalCoinsEarned = quizResults?.reduce((acc, r) => acc + r.coins_earned, 0) ?? 0;
  const dailyDone = dailyTracking?.completed ?? false;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Welcome back, {profile?.username}!
        </h1>
        <p className="text-muted-foreground mt-1">Keep learning and earning coins to build your dream house.</p>
      </div>

      {/* Daily Quiz Alert */}
      {!dailyDone && (
        <Card className="border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
              <div>
                <p className="font-semibold">Daily Quiz Pending!</p>
                <p className="text-sm text-muted-foreground">Complete a quiz today or lose 5 coins.</p>
              </div>
            </div>
            <Link to="/quizzes">
              <Button size="sm">Take Quiz →</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-[hsl(var(--coin))]" /> Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profile?.coins ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" /> Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profile?.level ?? 1}</p>
            <Progress value={xpProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{xpProgress}/100 XP to next level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[hsl(var(--success))]" /> Quizzes Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedQuizzes}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalCoinsEarned} coins earned total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" /> Furniture Owned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{itemCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/quizzes">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-primary mb-3" />
              <h3 className="font-semibold">Take a Quiz</h3>
              <p className="text-sm text-muted-foreground">Earn coins by answering questions</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/shop">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <Trophy className="h-10 w-10 mx-auto text-[hsl(var(--coin))] mb-3" />
              <h3 className="font-semibold">Visit Shop</h3>
              <p className="text-sm text-muted-foreground">Buy furniture with your coins</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/house">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <Home className="h-10 w-10 mx-auto text-[hsl(var(--success))] mb-3" />
              <h3 className="font-semibold">Build House</h3>
              <p className="text-sm text-muted-foreground">Decorate your virtual rooms</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
