import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Coins, Medal } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();

  const { data: leaders, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, username, coins, level, xp')
        .order('coins', { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-[hsl(var(--coin))]" /> Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">Top learners ranked by coins earned.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : leaders?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No players yet!</div>
            ) : (
              leaders?.map((leader, i) => {
                const isMe = leader.user_id === user?.id;
                return (
                  <div
                    key={leader.user_id}
                    className={`flex items-center justify-between px-6 py-4 ${
                      isMe ? 'bg-primary/5' : ''
                    } ${i < 3 ? 'bg-[hsl(var(--coin))]/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl w-10 text-center">
                        {i < 3 ? medals[i] : <span className="text-lg text-muted-foreground">#{i + 1}</span>}
                      </span>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {leader.username}
                          {isMe && <Badge variant="secondary" className="text-xs">You</Badge>}
                        </p>
                        <p className="text-sm text-muted-foreground">Level {leader.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <Coins className="h-5 w-5 text-[hsl(var(--coin))]" />
                      {leader.coins}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
