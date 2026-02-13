import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileCheck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-destructive/20 text-destructive',
};

export function VerificationPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-verification', filter],
    queryFn: async () => {
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status,
          admin_notes,
          reviewed_by: user?.id,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification'] });
      toast.success('Verification request updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {requests?.length === 0 && <p className="text-center text-muted-foreground py-8">No verification requests</p>}

      <div className="grid gap-3">
        {requests?.map((req) => (
          <VerificationCard key={req.id} request={req} onUpdate={updateMutation.mutate} />
        ))}
      </div>
    </div>
  );
}

function VerificationCard({ request, onUpdate }: { request: any; onUpdate: (args: { id: string; status: string; admin_notes?: string }) => void }) {
  const [notes, setNotes] = useState(request.admin_notes || '');

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{request.document_type}</h3>
              <Badge className={statusColors[request.status] || ''} variant="outline">{request.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Submitted {format(new Date(request.created_at), 'PPp')}
            </p>
            {request.document_url && (
              <a href={request.document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                View Document
              </a>
            )}
          </div>
        </div>

        {request.status === 'pending' ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Admin notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onUpdate({ id: request.id, status: 'approved', admin_notes: notes })}>
                <CheckCircle className="h-3 w-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onUpdate({ id: request.id, status: 'rejected', admin_notes: notes })}>
                <XCircle className="h-3 w-3 mr-1" /> Reject
              </Button>
            </div>
          </div>
        ) : (
          request.admin_notes && <p className="text-sm text-muted-foreground border-t border-border pt-2">{request.admin_notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
