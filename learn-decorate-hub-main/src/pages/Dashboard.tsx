import React from 'react';
import { useGame } from '@/contexts/GameContext';
import Navbar from '@/components/Navbar';
import { BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
  const { user, progressData } = useGame();
  if (!user) return null;

  const last7 = progressData.slice(-7);
  const last30 = progressData.slice(-30);

  const totalCoins = last30.reduce((s, d) => s + d.coins, 0);
  const totalXp = last30.reduce((s, d) => s + d.xp, 0);
  const totalQuizzes = last30.reduce((s, d) => s + d.quizzes, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Progress Dashboard
          </h1>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Coins Earned', value: totalCoins, color: 'text-accent' },
              { label: 'XP Gained', value: totalXp, color: 'text-xp' },
              { label: 'Quizzes Taken', value: totalQuizzes, color: 'text-primary' },
            ].map(stat => (
              <div key={stat.label} className="card-game rounded-xl p-5 text-center">
                <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-game rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Daily XP (Last 7 days)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={last7}>
                  <defs>
                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 20%)" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                    tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(225, 20%, 12%)', border: '1px solid hsl(225, 15%, 22%)', borderRadius: 8, color: 'hsl(220, 20%, 92%)' }} />
                  <Area type="monotone" dataKey="xp" stroke="hsl(175, 70%, 45%)" fill="url(#xpGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card-game rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">Coins Earned (Last 7 days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={last7}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 20%)" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                    tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(225, 20%, 12%)', border: '1px solid hsl(225, 15%, 22%)', borderRadius: 8, color: 'hsl(220, 20%, 92%)' }} />
                  <Bar dataKey="coins" fill="hsl(45, 90%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card-game rounded-xl p-5 lg:col-span-2">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">Quizzes Completed (Last 14 days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={progressData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 20%)" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                    tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(225, 20%, 12%)', border: '1px solid hsl(225, 15%, 22%)', borderRadius: 8, color: 'hsl(220, 20%, 92%)' }} />
                  <Line type="monotone" dataKey="quizzes" stroke="hsl(280, 70%, 55%)" strokeWidth={2} dot={{ fill: 'hsl(280, 70%, 55%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
