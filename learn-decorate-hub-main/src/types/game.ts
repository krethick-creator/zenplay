export type SkillLevel = 'beginner' | 'intermediate' | 'expert';

export type AvatarType = 'gamer' | 'student' | 'robot' | 'wizard' | 'explorer';

export type HouseType = 'modern' | 'cabin' | 'futuristic' | 'castle';

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  category: 'furniture' | 'electronics' | 'decoration';
}

export interface User {
  id: string;
  username: string;
  email: string;
  skillLevel: SkillLevel;
  avatar: AvatarType;
  coins: number;
  houseType: HouseType;
  ownedItems: string[];
  placedItems: string[];
  quizzesTaken: number;
  battleWins: number;
  dailyStreak: number;
  lastLogin: string;
  friends: string[];
  totalXp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: AvatarType;
  coins: number;
  wins: number;
  xp: number;
}

export interface ProgressData {
  date: string;
  quizzes: number;
  coins: number;
  xp: number;
}

export const AVATARS: Record<AvatarType, { label: string; emoji: string; color: string }> = {
  gamer: { label: 'Gamer', emoji: '🎮', color: 'from-blue-500 to-purple-500' },
  student: { label: 'Student', emoji: '📚', color: 'from-green-500 to-teal-500' },
  robot: { label: 'Robot', emoji: '🤖', color: 'from-gray-400 to-blue-400' },
  wizard: { label: 'Wizard', emoji: '🧙', color: 'from-purple-500 to-pink-500' },
  explorer: { label: 'Explorer', emoji: '🧭', color: 'from-amber-500 to-orange-500' },
};

export const HOUSE_LABELS: Record<HouseType, string> = {
  modern: 'Modern House',
  cabin: 'Wooden Cabin',
  futuristic: 'Futuristic House',
  castle: 'Fantasy Castle',
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'bed', name: 'Bed', icon: '🛏️', price: 50, category: 'furniture' },
  { id: 'desk', name: 'Study Table', icon: '🪑', price: 75, category: 'furniture' },
  { id: 'pc', name: 'Gaming PC', icon: '🖥️', price: 200, category: 'electronics' },
  { id: 'plant', name: 'Plants', icon: '🪴', price: 30, category: 'decoration' },
  { id: 'lamp', name: 'Lamp', icon: '💡', price: 40, category: 'decoration' },
  { id: 'bookshelf', name: 'Bookshelf', icon: '📚', price: 100, category: 'furniture' },
  { id: 'tv', name: 'Smart TV', icon: '📺', price: 150, category: 'electronics' },
  { id: 'rug', name: 'Fancy Rug', icon: '🟫', price: 60, category: 'decoration' },
];
