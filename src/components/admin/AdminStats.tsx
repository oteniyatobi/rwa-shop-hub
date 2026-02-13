import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Users, AlertTriangle, Ban, UserX, FileCheck, Loader2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  accent?: boolean;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Card className={accent ? 'border-primary/50' : ''}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, profiles, reports, blocked, suspended, verification] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_blocked', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
        supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return {
        totalProducts: products.count ?? 0,
        totalUsers: profiles.count ?? 0,
        pendingReports: reports.count ?? 0,
        blockedProducts: blocked.count ?? 0,
        suspendedUsers: suspended.count ?? 0,
        pendingVerifications: verification.count ?? 0,
      };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const [recentProducts, recentReports, recentUsers] = await Promise.all([
        supabase.from('products').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('reports').select('id, reason, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, email, role, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      return {
        products: recentProducts.data ?? [],
        reports: recentReports.data ?? [],
        users: recentUsers.data ?? [],
      };
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total Products" value={stats?.totalProducts} icon={<Package className="h-5 w-5" />} />
        <StatCard label="Total Users" value={stats?.totalUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pending Reports" value={stats?.pendingReports} icon={<AlertTriangle className="h-5 w-5" />} accent={!!stats?.pendingReports} />
        <StatCard label="Blocked Products" value={stats?.blockedProducts} icon={<Ban className="h-5 w-5" />} />
        <StatCard label="Suspended Users" value={stats?.suspendedUsers} icon={<UserX className="h-5 w-5" />} />
        <StatCard label="Pending Verifications" value={stats?.pendingVerifications} icon={<FileCheck className="h-5 w-5" />} accent={!!stats?.pendingVerifications} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" /> Recent Products
            </h3>
            <div className="space-y-2">
              {recentActivity?.products.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{p.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{format(new Date(p.created_at), 'MMM d')}</span>
                </div>
              ))}
              {!recentActivity?.products.length && <p className="text-xs text-muted-foreground">No products yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-accent" /> Recent Reports
            </h3>
            <div className="space-y-2">
              {recentActivity?.reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{r.reason}</span>
                  <span className={`text-xs ml-2 capitalize ${r.status === 'pending' ? 'text-yellow-400' : 'text-muted-foreground'}`}>{r.status}</span>
                </div>
              ))}
              {!recentActivity?.reports.length && <p className="text-xs text-muted-foreground">No reports yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" /> Recent Users
            </h3>
            <div className="space-y-2">
              {recentActivity?.users.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{u.email}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">{u.role}</span>
                </div>
              ))}
              {!recentActivity?.users.length && <p className="text-xs text-muted-foreground">No users yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
