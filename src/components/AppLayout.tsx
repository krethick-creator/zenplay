import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, BarChart3, BookOpen, ShoppingBag, Home, Trophy,
  MessageCircle, LogOut, Coins, Star
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/quizzes', label: 'Quizzes', icon: BookOpen },
  { path: '/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/house', label: 'My House', icon: Home },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/chatbot', label: 'AI Chat', icon: MessageCircle },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed h-screen">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/favicon.png" alt="LearnQuest" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-xl font-bold">LearnQuest</span>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="p-4 border-b border-border space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-[hsl(var(--coin))]" />
            <span className="font-semibold">{profile?.coins ?? 0} coins</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-primary" />
            <span>Level {profile?.level ?? 1}</span>
            <span className="text-muted-foreground text-xs">({profile?.xp ?? 0} XP)</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
