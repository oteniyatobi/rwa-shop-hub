import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';

export function UserManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: suspend,
          suspension_reason: suspend ? suspendReason : null,
          suspended_at: suspend ? new Date().toISOString() : null,
          suspended_by: suspend ? user?.id : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { suspend }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast.success(suspend ? 'User suspended' : 'User reinstated');
      setSuspendReason('');
    },
    onError: () => toast.error('Action failed'),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users by email or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {profiles?.length === 0 && <p className="text-center text-muted-foreground py-8">No users found</p>}

      <div className="grid gap-3">
        {profiles?.map((p) => (
          <Card key={p.id} className={p.is_suspended ? 'border-destructive/50' : ''}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                {(p.full_name || p.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{p.full_name || p.email}</h3>
                  <Badge variant="outline" className="capitalize">{p.role}</Badge>
                  {p.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{p.email} · {p.location || 'No location'}</p>
                {p.suspension_reason && (
                  <p className="text-xs text-destructive mt-1">Reason: {p.suspension_reason}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {p.is_suspended ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => suspendMutation.mutate({ id: p.id, suspend: false })}
                  >
                    <UserCheck className="h-3 w-3 mr-1" /> Reinstate
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <UserX className="h-3 w-3 mr-1" /> Suspend
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Suspend User</DialogTitle></DialogHeader>
                      <Textarea
                        placeholder="Reason for suspension..."
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => suspendMutation.mutate({ id: p.id, suspend: true })}
                          disabled={!suspendReason.trim()}
                        >
                          Confirm Suspension
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
