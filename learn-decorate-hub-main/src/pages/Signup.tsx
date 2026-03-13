import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Eye, EyeOff, Gamepad2 } from 'lucide-react';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useGame();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) { setError('Please fill all fields'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return; }
    if (signup(username, email, password)) {
      navigate('/onboarding');
    } else {
      setError('Username already taken');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 glow-border">
            <Gamepad2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary text-glow">LearnQuest</h1>
          <p className="mt-2 text-muted-foreground">Start your learning adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="card-game rounded-2xl p-8 space-y-5">
          <h2 className="font-display text-xl font-semibold text-foreground text-center">Create Account</h2>
          
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Username</label>
            <input type="text" value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
              className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Choose a username" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full rounded-lg border border-border bg-muted px-4 py-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Create a password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-game w-full rounded-lg py-3 text-sm text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]">
            CREATE ACCOUNT
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
