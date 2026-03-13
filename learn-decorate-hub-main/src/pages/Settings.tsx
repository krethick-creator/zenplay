import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { AVATARS } from '@/types/game';
import type { AvatarType, SkillLevel } from '@/types/game';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, setAvatar, setSkillLevel } = useGame();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>(user?.avatar || 'gamer');
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel>(user?.skillLevel || 'beginner');

  if (!user) return null;

  const handleSave = () => {
    setAvatar(selectedAvatar);
    setSkillLevel(selectedSkill);
    toast.success('Settings saved!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" /> Settings
          </h1>

          <div className="space-y-6">
            {/* Avatar selection */}
            <div className="card-game rounded-xl p-6">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">Change Avatar</h3>
              <div className="grid grid-cols-5 gap-3">
                {(Object.entries(AVATARS) as [AvatarType, typeof AVATARS[AvatarType]][]).map(([key, val]) => (
                  <button key={key} onClick={() => setSelectedAvatar(key)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all ${
                      selectedAvatar === key ? 'glow-border bg-primary/10' : 'border border-border hover:border-primary/30'
                    }`}>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${val.color} text-2xl`}>
                      {val.emoji}
                    </span>
                    <span className="text-xs text-muted-foreground">{val.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skill level */}
            <div className="card-game rounded-xl p-6">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">Skill Level</h3>
              <div className="flex gap-3">
                {(['beginner', 'intermediate', 'expert'] as SkillLevel[]).map(level => (
                  <button key={level} onClick={() => setSelectedSkill(level)}
                    className={`flex-1 rounded-xl py-3 text-sm font-display font-semibold capitalize transition-all ${
                      selectedSkill === level ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave}
              className="btn-game w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm text-primary-foreground transition-all hover:scale-[1.02]">
              <Save className="h-4 w-4" /> SAVE CHANGES
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
