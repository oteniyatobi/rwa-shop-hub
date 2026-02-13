import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) { toast.error(error.message || 'Failed to send reset email'); setLoading(false); return; }
    setSent(true); setLoading(false);
  };

  return (
    <Layout hideFooter>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Card className="rounded-2xl border-border/50 shadow-2xl shadow-primary/5">
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${sent ? 'bg-primary/10' : 'bg-primary'} transition-colors`}>
                {sent ? <CheckCircle2 className="h-7 w-7 text-primary" /> : <Mail className="h-7 w-7 text-primary-foreground" />}
              </div>
              <CardTitle className="text-2xl">{sent ? 'Check Your Email' : 'Forgot Password'}</CardTitle>
              <CardDescription className="mt-1">
                {sent ? `We sent a password reset link to ${email}` : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>

            {sent ? (
              <CardFooter className="flex flex-col gap-4 pt-4">
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button onClick={() => setSent(false)} className="text-primary font-semibold hover:underline">try again</button>
                </p>
                <Link to="/login" className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </CardFooter>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full rounded-xl glow-primary" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Reset Link
                  </Button>
                  <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>
                </CardFooter>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
