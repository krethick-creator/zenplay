import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { SHOP_ITEMS } from '@/types/game';
import { Coins, ShoppingCart, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const CATEGORIES = ['all', 'furniture', 'electronics', 'decoration'] as const;

const Shop: React.FC = () => {
  const { user, buyItem } = useGame();
  const [category, setCategory] = useState<string>('all');

  if (!user) return null;

  const filtered = category === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === category);

  const handleBuy = (itemId: string, name: string, price: number) => {
    if (user.ownedItems.includes(itemId)) {
      toast.info('You already own this item!');
      return;
    }
    if (user.coins < price) {
      toast.error('Not enough coins!');
      return;
    }
    if (buyItem(itemId)) {
      toast.success(`Bought ${name}! It's now in your house.`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground">Shop</h1>
            <div className="coin-badge flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
              <Coins className="h-4 w-4" /> {user.coins}
            </div>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                  category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(item => {
              const owned = user.ownedItems.includes(item.id);
              return (
                <div key={item.id} className="card-game rounded-xl p-5 flex flex-col items-center text-center">
                  <span className="text-4xl mb-3">{item.icon}</span>
                  <h3 className="font-display text-sm font-semibold text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize mb-3">{item.category}</p>
                  {owned ? (
                    <div className="flex items-center gap-1 text-xp text-sm font-medium">
                      <Check className="h-4 w-4" /> Owned
                    </div>
                  ) : (
                    <button onClick={() => handleBuy(item.id, item.name, item.price)}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-display font-semibold transition-all hover:scale-105 active:scale-95 ${
                        user.coins >= item.price ? 'btn-gold' : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}>
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {item.price} coins
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
