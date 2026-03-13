import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { AVATARS, HOUSE_LABELS, SHOP_ITEMS } from '@/types/game';
import { Coins, Trophy, Zap, Star, Brain, Swords, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Profile: React.FC = () => {
  const { user } = useGame();
  if (!user) return null;

  const avatar = AVATARS[user.avatar];

  const stats = [
    { icon: Coins, label: 'Coins', value: user.coins, color: 'text-accent' },
    { icon: Zap, label: 'Total XP', value: user.totalXp, color: 'text-xp' },
    { icon: Trophy, label: 'Battle Wins', value: user.battleWins, color: 'text-battle' },
    { icon: Brain, label: 'Quizzes Taken', value: user.quizzesTaken, color: 'text-primary' },
    { icon: Star, label: 'Daily Streak', value: `${user.dailyStreak} days`, color: 'text-accent' },
    { icon: Home, label: 'House', value: HOUSE_LABELS[user.houseType], color: 'text-foreground' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Profile header */}
          <div className="card-game rounded-2xl p-8 text-center mb-6">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${avatar.color} text-5xl mb-4 shadow-lg`}>
              {avatar.emoji}
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">{user.username}</h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5">
              <Swords className="h-4 w-4 text-primary" />
              <span className="text-sm font-display font-semibold text-primary capitalize">{user.skillLevel}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map(stat => (
              <div key={stat.label} className="card-game rounded-xl p-5 text-center">
                <stat.icon className={`mx-auto h-6 w-6 ${stat.color} mb-2`} />
                <p className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Owned items */}
          {user.ownedItems.length > 0 && (
            <div className="card-game rounded-xl p-5 mt-6">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Owned Items</h3>
              <div className="flex flex-wrap gap-2">
                {user.ownedItems.map(itemId => {
                  const item = SHOP_ITEMS.find((i) => i.id === itemId);
                  if (!item) return null;
                  return (
                    <span key={itemId} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm">
                      {item.icon} {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
