import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, BarChart3, Coins, Sparkles, Trophy } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ProgressPoint = {
  date: string;
  coins: number;
  xp: number;
  quizzes: number;
};

const buildProgressData = (rows: any[]): ProgressPoint[] => {
  const byDate: Record<string, ProgressPoint> = {};

  for (const row of rows) {
    const iso = row.completed_at ?? row.created_at ?? row.quiz_date;
    const date = iso ? iso.split('T')[0] : new Date().toISOString().split('T')[0];

    if (!byDate[date]) {
      byDate[date] = { date, coins: 0, xp: 0, quizzes: 0 };
    }

    const coins = row.coins_earned ?? 0;
    byDate[date].coins += coins;
    // App awards XP = coins_earned * 2 per quiz when passed; table has no xp_earned column
    byDate[date].xp += row.xp_earned ?? coins * 2;
    byDate[date].quizzes += 1;
  }

  // Fill gaps for last 30 days so charts look continuous
  const result: ProgressPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const existing = byDate[key];
    result.push(
      existing ?? {
        date: key,
        coins: 0,
        xp: 0,
        quizzes: 0,
      }
    );
  }

  return result;
};

const Stats: React.FC = () => {
  const { user } = useAuth();

  const { data: quizResults, isLoading, error } = useQuery({
    queryKey: ['stats-progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_quiz_results')
        .select('coins_earned, completed_at, score')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  if (!user) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">You must be logged in to view stats.</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Progress Stats</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground h-4 w-20 bg-muted animate-pulse rounded" /></CardHeader>
              <CardContent><div className="h-9 w-16 bg-muted animate-pulse rounded" /></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardContent className="h-64 flex items-center justify-center text-muted-foreground">Loading charts…</CardContent></Card>
          <Card><CardContent className="h-64 flex items-center justify-center text-muted-foreground">Loading charts…</CardContent></Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <p>Could not load stats. Please try again.</p>
      </div>
    );
  }

  const progressData = buildProgressData(quizResults ?? []);
  const last7 = progressData.slice(-7);
  const last30 = progressData.slice(-30);

  const totalCoins = last30.reduce((s, d) => s + d.coins, 0);
  const totalXp = last30.reduce((s, d) => s + d.xp, 0);
  const totalQuizzes = last30.reduce((s, d) => s + d.quizzes, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Progress Stats
          </h1>
          <p className="text-muted-foreground mt-1">
            See how your coins, XP, and quizzes have grown over time.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-[hsl(var(--coin))]" /> Coins earned (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCoins}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> XP gained (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalXp}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[hsl(var(--success))]" /> Quizzes taken (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalQuizzes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Daily XP (last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 20%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(225, 20%, 12%)',
                    border: '1px solid hsl(225, 15%, 22%)',
                    borderRadius: 8,
                    color: 'hsl(220, 20%, 92%)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="hsl(175, 70%, 45%)"
                  fill="url(#xpGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Coins earned (last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 20%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(225, 20%, 12%)',
                    border: '1px solid hsl(225, 15%, 22%)',
                    borderRadius: 8,
                    color: 'hsl(220, 20%, 92%)',
                  }}
                />
                <Bar dataKey="coins" fill="hsl(45, 90%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Quizzes completed (last 14 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 20%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(225, 20%, 12%)',
                    border: '1px solid hsl(225, 15%, 22%)',
                    borderRadius: 8,
                    color: 'hsl(220, 20%, 92%)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="quizzes"
                  stroke="hsl(280, 70%, 55%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(280, 70%, 55%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;

