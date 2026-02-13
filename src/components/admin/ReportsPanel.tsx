import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  reviewing: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-green-500/20 text-green-400',
  dismissed: 'bg-muted text-muted-foreground',
};

export function ReportsPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports', filter],
    queryFn: async () => {
      let query = supabase
        .from('reports')
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
        .from('reports')
        .update({
          status,
          admin_notes,
          resolved_by: user?.id,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Report updated');
    },
    onError: () => toast.error('Failed to update report'),
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
          <SelectItem value="reviewing">Reviewing</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="dismissed">Dismissed</SelectItem>
        </SelectContent>
      </Select>

      {reports?.length === 0 && <p className="text-center text-muted-foreground py-8">No reports found</p>}

      <div className="grid gap-3">
        {reports?.map((report) => (
          <ReportCard key={report.id} report={report} onUpdate={updateMutation.mutate} />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ report, onUpdate }: { report: any; onUpdate: (args: { id: string; status: string; admin_notes?: string }) => void }) {
  const [notes, setNotes] = useState(report.admin_notes || '');

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <h3 className="font-medium">{report.reason}</h3>
              <Badge className={statusColors[report.status] || ''} variant="outline">{report.status}</Badge>
            </div>
            {report.description && <p className="text-sm text-muted-foreground mt-1">{report.description}</p>}
            <p className="text-xs text-muted-foreground mt-1">{format(new Date(report.created_at), 'PPp')}</p>
          </div>
        </div>

        {report.status === 'pending' || report.status === 'reviewing' ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Admin notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onUpdate({ id: report.id, status: 'reviewing', admin_notes: notes })}>
                Mark Reviewing
              </Button>
              <Button size="sm" onClick={() => onUpdate({ id: report.id, status: 'resolved', admin_notes: notes })}>
                <CheckCircle className="h-3 w-3 mr-1" /> Resolve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onUpdate({ id: report.id, status: 'dismissed', admin_notes: notes })}>
                <XCircle className="h-3 w-3 mr-1" /> Dismiss
              </Button>
            </div>
          </div>
        ) : (
          report.admin_notes && <p className="text-sm text-muted-foreground border-t border-border pt-2">{report.admin_notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
