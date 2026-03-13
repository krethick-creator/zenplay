import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { AVATARS } from '@/types/game';
import type { LeaderboardEntry } from '@/types/game';
import { Trophy, Coins, Zap, Medal } from 'lucide-react';
import Navbar from '@/components/Navbar';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', username: 'CodeMaster', avatar: 'wizard', coins: 2500, wins: 45, xp: 8500 },
  { id: '2', username: 'BrainStorm', avatar: 'student', coins: 2100, wins: 38, xp: 7200 },
  { id: '3', username: 'PixelNinja', avatar: 'gamer', coins: 1800, wins: 32, xp: 6100 },
  { id: '4', username: 'TechWiz', avatar: 'robot', coins: 1500, wins: 28, xp: 5400 },
  { id: '5', username: 'QuestHero', avatar: 'explorer', coins: 1200, wins: 22, xp: 4800 },
  { id: '6', username: 'DataDragon', avatar: 'wizard', coins: 980, wins: 18, xp: 3900 },
  { id: '7', username: 'ByteRunner', avatar: 'gamer', coins: 750, wins: 15, xp: 3200 },
  { id: '8', username: 'LearnBot', avatar: 'robot', coins: 600, wins: 12, xp: 2800 },
];

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

const Leaderboard: React.FC = () => {
  const { user } = useGame();
  const [tab, setTab] = React.useState<'coins' | 'wins' | 'xp'>('coins');

  if (!user) return null;

  const entries = [...MOCK_LEADERBOARD];
  const userEntry: LeaderboardEntry = {
    id: user.id, username: user.username, avatar: user.avatar,
    coins: user.coins, wins: user.battleWins, xp: user.totalXp,
  };
  if (!entries.find(e => e.username === user.username)) entries.push(userEntry);

  const sorted = entries.sort((a, b) => b[tab] - a[tab]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" /> Leaderboard
          </h1>

          <div className="mb-6 flex gap-2">
            {([['coins', Coins, 'Top Earners'], ['wins', Trophy, 'Most Wins'], ['xp', Zap, 'Top Learners']] as const).map(([key, Icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  tab === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {sorted.map((entry, i) => {
              const avatar = AVATARS[entry.avatar];
              const isUser = entry.username === user.username;
              return (
                <div key={entry.id}
                  className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
                    isUser ? 'glow-border bg-primary/5' : 'card-game'
                  }`}>
                  <span className="font-display text-lg font-bold w-8 text-center">
                    {i < 3 ? <Medal className={`h-6 w-6 ${MEDAL_COLORS[i]}`} /> : <span className="text-muted-foreground">{i + 1}</span>}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${avatar.color} text-xl`}>
                    {avatar.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-display text-sm font-semibold truncate ${isUser ? 'text-primary' : 'text-foreground'}`}>
                      {entry.username} {isUser && '(You)'}
                    </p>
                  </div>
                  <div className="font-display text-sm font-bold text-accent">
                    {entry[tab].toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
