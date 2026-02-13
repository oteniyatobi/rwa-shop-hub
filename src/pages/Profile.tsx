import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RWANDA_LOCATIONS } from '@/lib/constants';
import { toast } from 'sonner';
import { Loader2, User, ShieldCheck, ShieldX, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VerificationForm } from '@/components/vendor/VerificationForm';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Profile() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate('/login'); }, [user, authLoading, navigate]);
  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ''); setPhone(profile.phone || ''); setWhatsapp(profile.whatsapp || ''); setLocation(profile.location || ''); setBusinessName(profile.business_name || ''); }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, phone, whatsapp: whatsapp || phone, location, business_name: businessName }).eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (error: any) { toast.error(error.message || 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  if (authLoading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-xl px-4 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 ring-4 ring-border/50">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-2xl">Edit Profile</CardTitle>
                {profile?.role === 'vendor' && (
                  <div className="flex justify-center mt-3">
                    {profile?.is_verified ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1 rounded-lg">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Vendor
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1.5 text-muted-foreground rounded-lg px-3 py-1">
                        <ShieldX className="h-3.5 w-3.5" /> Not Verified
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ''} disabled className="bg-muted/50 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl" />
                  </div>
                  {profile?.role === 'vendor' && (
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input id="businessName" placeholder="Your shop/business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="rounded-xl" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+250 7XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
                    <p className="text-xs text-muted-foreground">{profile?.role === 'vendor' ? 'Customers will contact you on this number' : 'For account recovery'}</p>
                  </div>
                  {profile?.role === 'vendor' && (
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number (optional)</Label>
                      <Input id="whatsapp" type="tel" placeholder="+250 7XX XXX XXX" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="rounded-xl" />
                      <p className="text-xs text-muted-foreground">Leave empty to use phone number for WhatsApp</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select your location" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {RWANDA_LOCATIONS.map((loc) => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full rounded-xl glow-primary" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {profile?.role === 'vendor' && (
            <motion.div variants={fadeUp} className="mt-6">
              <VerificationForm />
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
