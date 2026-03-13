import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Coins, Check } from 'lucide-react';

const Shop = () => {
  const { user } = useAuth();
  const { profile, updateCoins } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['shop-items'],
    queryFn: async () => {
      const { data } = await supabase.from('shop_items').select('*');
      return data ?? [];
    },
  });

  const { data: ownedItems } = useQuery({
    queryKey: ['user-items', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('user_items').select('item_id').eq('user_id', user!.id);
      return data?.map(i => i.item_id) ?? [];
    },
    enabled: !!user,
  });

  const purchase = useMutation({
    mutationFn: async (item: any) => {
      if ((profile?.coins ?? 0) < item.price) throw new Error('Not enough coins!');
      await supabase.from('user_items').insert({ user_id: user!.id, item_id: item.id });
      await updateCoins.mutateAsync(-item.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-items-count'] });
      toast({ title: '🛒 Purchased!', description: 'Item added to your inventory.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Cannot purchase', description: err.message, variant: 'destructive' });
    },
  });

  const roomLabels: Record<string, string> = {
    living_room: '🛋️ Living Room',
    study_room: '📚 Study Room',
    bedroom: '🛏️ Bedroom',
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" /> Shop
          </h1>
          <p className="text-muted-foreground mt-1">Buy furniture to decorate your virtual house.</p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          <Coins className="h-4 w-4 mr-2 text-[hsl(var(--coin))]" />
          {profile?.coins ?? 0} coins
        </Badge>
      </div>

      <Tabs defaultValue="living_room">
        <TabsList>
          {Object.entries(roomLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(roomLabels).map(room => (
          <TabsContent key={room} value={room}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items?.filter(i => i.room_type === room).map(item => {
                const owned = ownedItems?.includes(item.id);
                return (
                  <Card key={item.id} className={owned ? 'border-[hsl(var(--success))]/50' : ''}>
                    <CardHeader className="text-center pb-2">
                      <div className="text-5xl mb-2">{item.image_emoji}</div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1 font-semibold">
                          <Coins className="h-4 w-4 text-[hsl(var(--coin))]" /> {item.price}
                        </span>
                        {owned ? (
                          <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                            <Check className="h-3 w-3 mr-1" /> Owned
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => purchase.mutate(item)}
                            disabled={purchase.isPending || (profile?.coins ?? 0) < item.price}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Shop;
