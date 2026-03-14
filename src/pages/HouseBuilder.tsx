import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Home, Trash2, Save, Minus, Plus } from 'lucide-react';
import RoomBackground from '@/components/RoomBackground';

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const SCALE_STEP = 0.25;

const SCALE_STORAGE_KEY = 'learnquest_placement_scales';

function getStoredScales(userId: string): Record<string, number> {
  try {
    const data = localStorage.getItem(SCALE_STORAGE_KEY);
    if (!data) return {};
    const byUser = JSON.parse(data) as Record<string, Record<string, number>>;
    return byUser[userId] ?? {};
  } catch {
    return {};
  }
}

function setStoredScale(userId: string, placementKey: string, scale: number) {
  try {
    const data = localStorage.getItem(SCALE_STORAGE_KEY);
    const byUser = data ? (JSON.parse(data) as Record<string, Record<string, number>>) : {};
    if (!byUser[userId]) byUser[userId] = {};
    byUser[userId][placementKey] = scale;
    localStorage.setItem(SCALE_STORAGE_KEY, JSON.stringify(byUser));
  } catch {
    // ignore
  }
}

interface Placement {
  id?: string;
  item_id: string;
  room: string;
  x_pos: number;
  y_pos: number;
  rotation: number;
  scale: number;
  emoji: string;
  name: string;
}

const ROOM_WIDTH = 700;
const ROOM_HEIGHT = 450;

const roomBgColor: Record<string, string> = {
  living_room: 'hsl(32, 35%, 94%)',
  study_room: 'hsl(202, 28%, 94%)',
  bedroom: 'hsl(272, 28%, 95%)',
};

const HouseBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeRoom, setActiveRoom] = useState('living_room');
  const [dragging, setDragging] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [localPlacements, setLocalPlacements] = useState<Placement[]>([]);
  const roomRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const prevPlacementsRef = useRef<Placement[]>([]);

  // Owned items with details
  const { data: ownedItems } = useQuery({
    queryKey: ['owned-items-details', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_items')
        .select('item_id, shop_items(id, name, image_emoji, room_type)')
        .eq('user_id', user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Saved placements
  const { data: savedPlacements } = useQuery({
    queryKey: ['placements', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('furniture_placements')
        .select('*, shop_items(name, image_emoji)')
        .eq('user_id', user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!savedPlacements || !user?.id) return;
    const stored = getStoredScales(user.id);
    const prev = prevPlacementsRef.current;
    const byKey = (list: Placement[]) => {
      const m: Record<string, Placement[]> = {};
      list.forEach(pl => {
        const k = `${pl.item_id}_${pl.room}`;
        if (!m[k]) m[k] = [];
        m[k].push(pl);
      });
      for (const k of Object.keys(m)) {
        m[k].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      }
      return m;
    };
    const prevByKey = byKey(prev);
    let keyIndex: Record<string, number> = {};

    const sortKey = (p: { room: string; item_id: string; id?: string }) =>
      `${p.room}_${p.item_id}_${p.id || ''}`;
    const sortedSaved = [...savedPlacements].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

    const next = sortedSaved.map(p => {
      const rawScale = (p as any).scale;
      const fromDb = typeof rawScale === 'number' && !Number.isNaN(rawScale)
        ? Math.max(MIN_SCALE, Math.min(MAX_SCALE, rawScale))
        : typeof rawScale === 'string'
          ? Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(rawScale) || 1))
          : null;
      let scale = fromDb ?? (stored[p.id] != null ? Math.max(MIN_SCALE, Math.min(MAX_SCALE, stored[p.id])) : null);
      if (scale == null && prev.length > 0) {
        const k = `${p.item_id}_${p.room}`;
        const idx = keyIndex[k] ?? 0;
        keyIndex[k] = idx + 1;
        const group = prevByKey[k] || [];
        const prevP = group[idx];
        if (prevP?.scale != null && prevP.scale !== 1) {
          scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prevP.scale));
          setStoredScale(user.id, p.id, scale);
        }
      }
      if (scale == null) scale = 1;
      if (p.id) setStoredScale(user.id, p.id, scale);
      return {
        id: p.id,
        item_id: p.item_id,
        room: p.room,
        x_pos: p.x_pos,
        y_pos: p.y_pos,
        rotation: p.rotation,
        scale,
        emoji: (p.shop_items as any)?.image_emoji ?? '🪑',
        name: (p.shop_items as any)?.name ?? 'Item',
      };
    });
    prevPlacementsRef.current = next;
    setLocalPlacements(next);
  }, [savedPlacements, user?.id]);

  const savePlacements = useMutation({
    mutationFn: async () => {
      // Keep current state (including scale) so after refetch we merge it back – prevents size reset on Save
      prevPlacementsRef.current = localPlacements.map(p => ({ ...p }));

      // Save entire house: delete all placements for this user, then insert all current placements (all rooms)
      await supabase
        .from('furniture_placements')
        .delete()
        .eq('user_id', user!.id);

      if (localPlacements.length === 0) return;

      const rows = localPlacements.map(p => ({
        user_id: user!.id,
        item_id: p.item_id,
        room: p.room,
        x_pos: p.x_pos,
        y_pos: p.y_pos,
        rotation: p.rotation,
        scale: p.scale ?? 1,
      }));

      const { error } = await supabase.from('furniture_placements').insert(rows);
      if (error) {
        // Lovable/Supabase may not have scale column – retry without it so layout still saves
        if (error.message?.includes('scale') || error.code === '42703') {
          const { error: err2 } = await supabase.from('furniture_placements').insert(
            localPlacements.map(p => ({
              user_id: user!.id,
              item_id: p.item_id,
              room: p.room,
              x_pos: p.x_pos,
              y_pos: p.y_pos,
              rotation: p.rotation,
            }))
          );
          if (err2) throw err2;
        } else throw error;
      }
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      toast({ title: '💾 Saved!', description: 'Entire house layout saved.' });
    },
  });

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(index);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLocalPlacements(prev => prev.map((p, i) =>
      i === dragging ? { ...p, x_pos: Math.max(0, Math.min(95, x)), y_pos: Math.max(0, Math.min(95, y)) } : p
    ));
  }, [dragging]);

  const handleMouseUp = (e: React.MouseEvent) => {
    const start = dragStartRef.current;
    const idx = dragging;
    if (idx !== null && start && Math.abs(e.clientX - start.x) < 6 && Math.abs(e.clientY - start.y) < 6) {
      setSelectedIndex(idx);
    }
    setDragging(null);
    dragStartRef.current = null;
  };

  const handleDoubleClick = (index: number) => {
    setLocalPlacements(prev => prev.map((p, i) =>
      i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  const handleRemove = (index: number) => {
    setLocalPlacements(prev => prev.filter((_, i) => i !== index));
  };

  // Owned count per item_id (one purchase = one placement allowed)
  const ownedCountByItemId: Record<string, number> = {};
  (ownedItems ?? []).forEach((i: any) => {
    ownedCountByItemId[i.item_id] = (ownedCountByItemId[i.item_id] ?? 0) + 1;
  });
  const placedCountByItemId: Record<string, number> = {};
  localPlacements.forEach(p => {
    placedCountByItemId[p.item_id] = (placedCountByItemId[p.item_id] ?? 0) + 1;
  });

  const addToRoom = (itemId: string, emoji: string, name: string) => {
    const owned = ownedCountByItemId[itemId] ?? 0;
    const placed = placedCountByItemId[itemId] ?? 0;
    if (placed >= owned) return;
    setLocalPlacements(prev => [
      ...prev,
      { item_id: itemId, room: activeRoom, x_pos: 50, y_pos: 50, rotation: 0, scale: 1, emoji, name }
    ]);
  };

  const setScale = (globalIndex: number, delta: number) => {
    setLocalPlacements(prev => {
      const next = prev.map((p, i) =>
        i === globalIndex
          ? { ...p, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, (p.scale ?? 1) + delta)) }
          : p
      );
      const updated = next[globalIndex];
      if (updated?.id && user?.id) {
        setStoredScale(user.id, updated.id, updated.scale);
      }
      return next;
    });
  };

  const roomPlacements = localPlacements.filter(p => p.room === activeRoom);

  // Unique items for this room: one row per item_id (one purchase = place once in any room)
  const roomItemsUnique = (ownedItems ?? [])
    .filter((i: any) => i.shop_items?.room_type === activeRoom)
    .reduce((acc: { item_id: string; name: string; image_emoji: string; owned: number }[], i: any) => {
      const id = i.item_id;
      if (acc.some((x: any) => x.item_id === id)) return acc;
      acc.push({
        item_id: id,
        name: i.shop_items?.name ?? 'Item',
        image_emoji: i.shop_items?.image_emoji ?? '🪑',
        owned: ownedCountByItemId[id] ?? 0,
      });
      return acc;
    }, []);

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
            <Home className="h-8 w-8 text-primary" /> My House
          </h1>
          <p className="text-muted-foreground mt-1">Add products from the shop, drag to place, double-click to rotate. Click an item to change its size.</p>
        </div>
        <Button onClick={() => savePlacements.mutate()} disabled={savePlacements.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {savePlacements.isPending ? 'Saving...' : 'Save Layout'}
        </Button>
      </div>

      <Tabs value={activeRoom} onValueChange={setActiveRoom}>
        <TabsList>
          {Object.entries(roomLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(roomLabels).map(room => (
          <TabsContent key={room} value={room} className="animate-room-slide-in">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Room canvas */}
              <div className="lg:col-span-3">
                <div
                  ref={roomRef}
                  className="relative border-2 border-border rounded-xl overflow-hidden cursor-crosshair select-none"
                  style={{
                    width: '100%',
                    height: ROOM_HEIGHT,
                    backgroundColor: roomBgColor[room],
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={() => setSelectedIndex(null)}
                >
                  {/* Graphical room (living room / study room / bedroom) */}
                  <RoomBackground room={room as 'living_room' | 'study_room' | 'bedroom'} />
                  {/* Room label */}
                  <div className="absolute top-3 left-3 text-xs font-medium text-muted-foreground bg-card/80 px-2 py-1 rounded z-10">
                    {roomLabels[room]}
                  </div>

                  {/* Your furniture from the shop - placed on top of the room */}
                  {roomPlacements.map((p, i) => {
                    const globalIndex = localPlacements.indexOf(p);
                    const scale = p.scale ?? 1;
                    const isSelected = selectedIndex === globalIndex;
                    return (
                      <div
                        key={i}
                        className={`absolute cursor-grab active:cursor-grabbing group ${
                          dragging === globalIndex ? 'z-50' : 'z-10 hover:z-40'
                        } ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded-lg' : ''}`}
                        style={{
                          left: `${p.x_pos}%`,
                          top: `${p.y_pos}%`,
                          transform: `translate(-50%, -50%) scale(${scale}) rotate(${p.rotation}deg)`,
                          transition: dragging === globalIndex ? 'none' : 'transform 0.15s',
                        }}
                        onMouseDown={handleMouseDown(globalIndex)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(globalIndex);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleDoubleClick(globalIndex);
                        }}
                      >
                        <div className="text-4xl select-none">{p.emoji}</div>
                        {/* Tooltip: name, remove */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-card px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {p.name}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(globalIndex); }}
                            className="ml-1 text-destructive"
                          >
                            <Trash2 className="h-3 w-3 inline" />
                          </button>
                        </div>
                        {/* Size controls when selected */}
                        {isSelected && (
                          <div
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg px-2 py-1 z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); setScale(globalIndex, -SCALE_STEP); }}
                              disabled={scale <= MIN_SCALE}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs font-medium min-w-[3rem] text-center">
                              {Math.round(scale * 100)}%
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); setScale(globalIndex, SCALE_STEP); }}
                              disabled={scale >= MAX_SCALE}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inventory panel */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Products for this room</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Click to add to room, then drag on the graphic.</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {roomItemsUnique.length === 0 && (
                    <p className="text-sm text-muted-foreground">No items for this room yet. Buy furniture in the Shop!</p>
                  )}
                  {roomItemsUnique.map((item: { item_id: string; name: string; image_emoji: string; owned: number }) => {
                    const placed = placedCountByItemId[item.item_id] ?? 0;
                    const canAdd = placed < item.owned;
                    return (
                      <Button
                        key={item.item_id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => canAdd && addToRoom(item.item_id, item.image_emoji, item.name)}
                        disabled={!canAdd}
                      >
                        <span className="text-lg">{item.image_emoji}</span>
                        <span className="flex-1 text-left truncate">{item.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {placed}/{item.owned} placed
                        </span>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default HouseBuilder;
