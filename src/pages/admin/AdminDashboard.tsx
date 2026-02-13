import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileWarning, Users, CheckCircle, Loader2, LayoutDashboard, CreditCard } from 'lucide-react';
import { AdminStats } from '@/components/admin/AdminStats';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { UserManagement } from '@/components/admin/UserManagement';
import { ReportsPanel } from '@/components/admin/ReportsPanel';
import { VerificationPanel } from '@/components/admin/VerificationPanel';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (!authLoading && !adminLoading && !isAdmin) navigate('/');
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1.5 ml-[52px]">Manage content, users, and platform safety</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass-card rounded-xl p-1 h-auto flex-wrap">
              <TabsTrigger value="overview" className="rounded-lg flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="moderation" className="rounded-lg flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileWarning className="h-4 w-4" /><span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4" /><span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-lg flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileWarning className="h-4 w-4" /><span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="verification" className="rounded-lg flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CheckCircle className="h-4 w-4" /><span className="hidden sm:inline">Verify</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="rounded-lg flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CreditCard className="h-4 w-4" /><span className="hidden sm:inline">Subs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><AdminStats /></TabsContent>
            <TabsContent value="moderation"><ContentModeration /></TabsContent>
            <TabsContent value="users"><UserManagement /></TabsContent>
            <TabsContent value="reports"><ReportsPanel /></TabsContent>
            <TabsContent value="verification"><VerificationPanel /></TabsContent>
            <TabsContent value="subscriptions"><SubscriptionManagement /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
