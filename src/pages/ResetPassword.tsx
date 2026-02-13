import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') { /* ready */ }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message || 'Failed to reset password'); setLoading(false); return; }
    toast.success('Password updated successfully!');
    navigate('/');
  };

  return (
    <Layout hideFooter>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Card className="rounded-2xl border-border/50 shadow-2xl shadow-primary/5">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                <Lock className="h-7 w-7 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
              <CardDescription className="mt-1">Enter your new password below</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="rounded-xl" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full rounded-xl glow-primary" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
