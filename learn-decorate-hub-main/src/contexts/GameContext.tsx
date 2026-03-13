import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AvatarType, HouseType, SkillLevel, ProgressData } from '@/types/game';
import { SHOP_ITEMS } from '@/types/game';

interface GameContextType {
  user: User | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  login: (username: string, password: string) => boolean;
  signup: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  setSkillLevel: (level: SkillLevel) => void;
  setAvatar: (avatar: AvatarType) => void;
  setHouseType: (house: HouseType) => void;
  completeOnboarding: () => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  buyItem: (itemId: string) => boolean;
  placeItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  addXp: (amount: number) => void;
  incrementQuizzes: () => void;
  incrementWins: () => void;
  progressData: ProgressData[];
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

const STORAGE_KEY = 'learnquest_user';
const PROGRESS_KEY = 'learnquest_progress';
const ACCOUNTS_KEY = 'learnquest_accounts';

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [progressData, setProgressData] = useState<ProgressData[]>(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved ? JSON.parse(saved) : generateMockProgress();
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
  }, [progressData]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const signup = useCallback((username: string, email: string, password: string): boolean => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
    if (accounts[username]) return false;
    accounts[username] = { email, password };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    const newUser: User = {
      id: crypto.randomUUID(),
      username, email,
      skillLevel: 'beginner',
      avatar: 'gamer',
      coins: 100,
      houseType: 'modern',
      ownedItems: [],
      placedItems: [],
      quizzesTaken: 0,
      battleWins: 0,
      dailyStreak: 1,
      lastLogin: new Date().toISOString(),
      friends: [],
      totalXp: 0,
    };
    setUser(newUser);
    return true;
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
    if (accounts[username]?.password === password) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        if (u.username === username) { setUser(u); return true; }
      }
      const newUser: User = {
        id: crypto.randomUUID(), username,
        email: accounts[username].email,
        skillLevel: 'beginner', avatar: 'gamer',
        coins: 100, houseType: 'modern',
        ownedItems: [], placedItems: [],
        quizzesTaken: 0, battleWins: 0,
        dailyStreak: 1, lastLogin: new Date().toISOString(),
        friends: [], totalXp: 0,
      };
      setUser(newUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const isOnboarded = !!user && user.houseType !== undefined && user.totalXp >= 0 && localStorage.getItem('learnquest_onboarded') === 'true';

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('learnquest_onboarded', 'true');
    setUser(prev => prev ? { ...prev } : null);
  }, []);

  const addCoins = useCallback((amount: number) => {
    updateUser({ coins: (user?.coins || 0) + amount });
    const today = new Date().toISOString().split('T')[0];
    setProgressData(prev => {
      const existing = prev.find(p => p.date === today);
      if (existing) return prev.map(p => p.date === today ? { ...p, coins: p.coins + amount } : p);
      return [...prev, { date: today, quizzes: 0, coins: amount, xp: 0 }];
    });
  }, [user, updateUser]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (!user || user.coins < amount) return false;
    updateUser({ coins: user.coins - amount });
    return true;
  }, [user, updateUser]);

  const buyItem = useCallback((itemId: string): boolean => {
    if (!user) return false;
    const shopItem = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!shopItem || user.ownedItems.includes(itemId)) return false;
    if (user.coins < shopItem.price) return false;
    updateUser({
      coins: user.coins - shopItem.price,
      ownedItems: [...user.ownedItems, itemId],
      placedItems: [...user.placedItems, itemId],
    });
    return true;
  }, [user, updateUser]);

  const placeItem = useCallback((itemId: string) => {
    if (!user || !user.ownedItems.includes(itemId)) return;
    if (!user.placedItems.includes(itemId)) {
      updateUser({ placedItems: [...user.placedItems, itemId] });
    }
  }, [user, updateUser]);

  const removeItem = useCallback((itemId: string) => {
    if (!user) return;
    updateUser({ placedItems: user.placedItems.filter(i => i !== itemId) });
  }, [user, updateUser]);

  const addXp = useCallback((amount: number) => {
    if (!user) return;
    updateUser({ totalXp: user.totalXp + amount });
  }, [user, updateUser]);

  const incrementQuizzes = useCallback(() => {
    if (!user) return;
    updateUser({ quizzesTaken: user.quizzesTaken + 1 });
  }, [user, updateUser]);

  const incrementWins = useCallback(() => {
    if (!user) return;
    updateUser({ battleWins: user.battleWins + 1 });
  }, [user, updateUser]);

  return (
    <GameContext.Provider value={{
      user, isLoggedIn: !!user, isOnboarded,
      login, signup, logout,
      setSkillLevel: (level) => updateUser({ skillLevel: level }),
      setAvatar: (avatar) => updateUser({ avatar }),
      setHouseType: (house) => updateUser({ houseType: house }),
      completeOnboarding, addCoins, spendCoins, buyItem,
      placeItem, removeItem, addXp, incrementQuizzes, incrementWins,
      progressData,
    }}>
      {children}
    </GameContext.Provider>
  );
};

function generateMockProgress(): ProgressData[] {
  const data: ProgressData[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      quizzes: Math.floor(Math.random() * 5),
      coins: Math.floor(Math.random() * 100),
      xp: Math.floor(Math.random() * 200),
    });
  }
  return data;
}
