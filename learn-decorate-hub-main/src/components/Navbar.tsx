import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Brain, Trophy, BarChart3, User, LogOut, Coins } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { AVATARS } from '@/types/game';

const NAV_ITEMS = [
  { path: '/house', label: 'House', icon: Home },
  { path: '/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/quiz', label: 'Quiz', icon: Brain },
  { path: '/leaderboard', label: 'Ranks', icon: Trophy },
  { path: '/dashboard', label: 'Stats', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

const Navbar: React.FC = () => {
  const { user, logout } = useGame();
  const location = useLocation();

  if (!user) return null;

  const avatarData = AVATARS[user.avatar];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/house" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-display text-lg font-bold text-primary text-glow hidden sm:block">
            LearnQuest
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm ${
                  active
                    ? 'bg-primary/15 text-primary glow-border'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="coin-badge flex items-center gap-1.5 rounded-full px-3 py-1 text-sm">
            <Coins className="h-4 w-4" />
            <span>{user.coins}</span>
          </div>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${avatarData.color} text-lg`}>
            {avatarData.emoji}
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
