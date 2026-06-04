import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import ErrorState from '../components/ErrorState';
import {
  Store,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ChartPoint {
  name: string;
  shops: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  shopName: string;
  timestamp: string;
}

interface DashboardData {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  newShopsToday: number;
  chartData: ChartPoint[];
  recentActivity: RecentActivity[];
}

/** Compact "x ago" relative time from an ISO timestamp. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const { data: dashboardData, error: apiError } = await adminApi.getDashboard();
      if (apiError || !dashboardData) {
        // No silent fallback — surface the failure instead of fabricating totals.
        setError(apiError || 'No data returned from the server.');
        setData(null);
      } else {
        setData(dashboardData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [reloadKey]);

  const stats = data ? [
    {
      name: 'Total Shops',
      value: data.totalShops.toLocaleString(),
      icon: Store,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Active Shops',
      value: data.activeShops.toLocaleString(),
      icon: Activity,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Total Revenue',
      value: `E${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'New Today',
      value: data.newShopsToday.toString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-80 bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening with YeboMart.</p>
        </div>
        <Card>
          <CardContent>
            <ErrorState
              message={error || 'No data returned from the server.'}
              onRetry={() => setReloadKey((k) => k + 1)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening with YeboMart.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Shop Growth</h2>
          </CardHeader>
          <CardContent>
            {data.chartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
                No shop data yet
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorShops" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="shops"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorShops)"
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Revenue</h2>
          </CardHeader>
          <CardContent>
            {data.chartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
                No revenue data yet
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link to="/shops" className="text-sm text-amber-500 hover:text-amber-400">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No recent activity</p>
            </div>
          ) : (
          <div className="divide-y divide-slate-700">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-slate-700/50 transition-colors">
                <div className="p-2 rounded-lg bg-slate-700">
                  {activity.type === 'signup' && <Store className="w-4 h-4 text-blue-400" />}
                  {activity.type === 'sale' && <DollarSign className="w-4 h-4 text-amber-400" />}
                  {activity.type !== 'signup' && activity.type !== 'sale' && (
                    <Activity className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{activity.message}</p>
                  <p className="text-sm text-slate-400">{activity.shopName}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {timeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
