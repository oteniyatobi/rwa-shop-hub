import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Upload, Loader2, FileCheck, Clock, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'business_registration', label: 'Business Registration Certificate' },
];

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500/20 text-yellow-400', label: 'Pending Review' },
  approved: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500/20 text-green-400', label: 'Approved' },
  rejected: { icon: <XCircle className="h-4 w-4" />, color: 'bg-destructive/20 text-destructive', label: 'Rejected' },
};

export function VerificationForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-verification-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user || !file || !documentType) throw new Error('Missing fields');

      setUploading(true);

      // Upload document
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get signed URL for admin access
      const { data: urlData } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

      // Create verification request
      const { error } = await supabase.from('verification_requests').insert({
        user_id: user.id,
        document_type: DOCUMENT_TYPES.find(d => d.value === documentType)?.label || documentType,
        document_url: urlData?.signedUrl || filePath,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-verification-requests'] });
      toast.success('Verification request submitted! Our team will review it shortly.');
      setDocumentType('');
      setFile(null);
      setUploading(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit verification request');
      setUploading(false);
    },
  });

  const hasPending = requests?.some(r => r.status === 'pending');
  const isApproved = requests?.some(r => r.status === 'approved');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Identity Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isApproved ? (
          <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-4">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="font-medium text-green-400">Verified</p>
              <p className="text-xs text-muted-foreground">Your identity has been verified</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Submit an ID document to verify your identity and build trust with buyers.
            </p>

            {!hasPending && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload Document</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accepted: images or PDF, max 10MB
                  </p>
                </div>

                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={!documentType || !file || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" />Submit for Verification</>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Previous requests */}
        {requests && requests.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">Submissions</p>
            {requests.map(req => {
              const status = statusConfig[req.status] || statusConfig.pending;
              return (
                <div key={req.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{req.document_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={status.color}>
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(req.created_at), 'MMM d')}
                    </span>
                  </div>
                </div>
              );
            })}
            {requests.some(r => r.status === 'rejected' && r.admin_notes) && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm">
                <p className="text-xs font-medium text-destructive">Admin feedback:</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {requests.find(r => r.status === 'rejected')?.admin_notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
