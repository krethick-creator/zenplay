import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { AVATARS, HOUSE_LABELS, SHOP_ITEMS } from '@/types/game';
import type { HouseType } from '@/types/game';
import { Coins, Trophy, Zap, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import houseModern from '@/assets/house-modern.png';
import houseCabin from '@/assets/house-cabin.png';
import houseFuturistic from '@/assets/house-futuristic.png';
import houseCastle from '@/assets/house-castle.png';

const HOUSE_IMAGES: Record<HouseType, string> = {
  modern: houseModern, cabin: houseCabin, futuristic: houseFuturistic, castle: houseCastle,
};

const HousePage: React.FC = () => {
  const { user } = useGame();
  if (!user) return null;

  const avatarData = AVATARS[user.avatar];
  const placedItems = SHOP_ITEMS.filter(i => user.placedItems.includes(i.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="mx-auto max-w-5xl">
          {/* Stats bar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="coin-badge flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
              <Coins className="h-4 w-4" /> {user.coins} coins
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-xp/10 border border-xp/30 px-4 py-2 text-sm text-xp">
              <Zap className="h-4 w-4" /> {user.totalXp} XP
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-battle/10 border border-battle/30 px-4 py-2 text-sm text-battle">
              <Trophy className="h-4 w-4" /> {user.battleWins} wins
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-4 py-2 text-sm text-primary">
              <Star className="h-4 w-4" /> {user.dailyStreak} day streak
            </div>
          </div>

          {/* House display */}
          <div className="card-game rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-4">
              <h1 className="font-display text-xl font-bold text-foreground">
                {user.username}'s {HOUSE_LABELS[user.houseType]}
              </h1>
            </div>

            <div className="relative flex flex-col items-center">
              {/* House image */}
              <div className="relative">
                <img
                  src={HOUSE_IMAGES[user.houseType]}
                  alt={HOUSE_LABELS[user.houseType]}
                  className="h-64 w-64 object-contain sm:h-80 sm:w-80 animate-float"
                />
                {/* Avatar inside house */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${avatarData.color} text-3xl shadow-lg border-2 border-background`}>
                    {avatarData.emoji}
                  </div>
                  <span className="mt-1 rounded-full bg-card px-2 py-0.5 text-xs font-display font-semibold text-foreground border border-border">
                    {user.username}
                  </span>
                </div>
              </div>

              {/* Placed items */}
              {placedItems.length > 0 && (
                <div className="mt-6 w-full">
                  <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3 text-center">
                    House Items
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {placedItems.map(item => (
                      <div key={item.id} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/50 px-4 py-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {placedItems.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Your house is empty! Visit the <a href="/shop" className="text-primary hover:underline">Shop</a> to buy items.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HousePage;
