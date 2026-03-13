import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { AVATARS, HOUSE_LABELS } from '@/types/game';
import type { SkillLevel, AvatarType, HouseType } from '@/types/game';
import { ChevronRight, Sparkles } from 'lucide-react';
import houseModern from '@/assets/house-modern.png';
import houseCabin from '@/assets/house-cabin.png';
import houseFuturistic from '@/assets/house-futuristic.png';
import houseCastle from '@/assets/house-castle.png';

const HOUSE_IMAGES: Record<HouseType, string> = {
  modern: houseModern,
  cabin: houseCabin,
  futuristic: houseFuturistic,
  castle: houseCastle,
};

const SKILL_OPTIONS: { value: SkillLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Just starting out', emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience', emoji: '⚡' },
  { value: 'expert', label: 'Expert', desc: 'Advanced learner', emoji: '🔥' },
];

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel>('beginner');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>('gamer');
  const [selectedHouse, setSelectedHouse] = useState<HouseType>('modern');
  const { setSkillLevel, setAvatar, setHouseType, completeOnboarding } = useGame();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 0) { setSkillLevel(selectedSkill); setStep(1); }
    else if (step === 1) { setAvatar(selectedAvatar); setStep(2); }
    else {
      setHouseType(selectedHouse);
      completeOnboarding();
      navigate('/house');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-12 bg-primary' : i < step ? 'w-8 bg-primary/50' : 'w-8 bg-border'}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="card-game rounded-2xl p-8">
            <div className="text-center mb-6">
              <Sparkles className="mx-auto h-8 w-8 text-primary mb-2" />
              <h2 className="font-display text-2xl font-bold text-foreground">Choose Your Level</h2>
              <p className="text-muted-foreground mt-1">We'll adjust difficulty to match</p>
            </div>
            <div className="space-y-3">
              {SKILL_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setSelectedSkill(opt.value)}
                  className={`w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all ${
                    selectedSkill === opt.value ? 'glow-border bg-primary/10' : 'border border-border hover:border-primary/30 hover:bg-secondary'
                  }`}>
                  <span className="text-3xl">{opt.emoji}</span>
                  <div>
                    <div className="font-display text-sm font-semibold text-foreground">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card-game rounded-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Pick Your Avatar</h2>
              <p className="text-muted-foreground mt-1">This will represent you in the game</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {(Object.entries(AVATARS) as [AvatarType, typeof AVATARS[AvatarType]][]).map(([key, val]) => (
                <button key={key} onClick={() => setSelectedAvatar(key)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                    selectedAvatar === key ? 'glow-border bg-primary/10' : 'border border-border hover:border-primary/30'
                  }`}>
                  <span className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${val.color} text-2xl`}>
                    {val.emoji}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{val.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card-game rounded-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Choose Your House</h2>
              <p className="text-muted-foreground mt-1">Your home base for learning</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(HOUSE_LABELS) as [HouseType, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setSelectedHouse(key)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                    selectedHouse === key ? 'glow-border bg-primary/10' : 'border border-border hover:border-primary/30'
                  }`}>
                  <img src={HOUSE_IMAGES[key]} alt={label} className="h-24 w-24 object-contain" />
                  <span className="text-xs font-display font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleNext}
          className="btn-game mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]">
          {step === 2 ? "LET'S GO!" : 'CONTINUE'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
