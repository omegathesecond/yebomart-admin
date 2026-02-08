import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import {
  Store,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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

interface DashboardData {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  newShopsToday: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  shopName: string;
  timestamp: string;
}

const mockChartData = [
  { name: 'Jan', shops: 40, revenue: 2400 },
  { name: 'Feb', shops: 55, revenue: 3200 },
  { name: 'Mar', shops: 72, revenue: 4100 },
  { name: 'Apr', shops: 85, revenue: 4800 },
  { name: 'May', shops: 98, revenue: 5200 },
  { name: 'Jun', shops: 115, revenue: 6100 },
  { name: 'Jul', shops: 128, revenue: 6800 },
];

const mockActivity: RecentActivity[] = [
  { id: '1', type: 'signup', message: 'New shop registered', shopName: 'Fresh Mart', timestamp: '2 minutes ago' },
  { id: '2', type: 'upgrade', message: 'Upgraded to Business tier', shopName: 'City Store', timestamp: '15 minutes ago' },
  { id: '3', type: 'sale', message: 'First sale completed', shopName: 'Quick Shop', timestamp: '1 hour ago' },
  { id: '4', type: 'signup', message: 'New shop registered', shopName: 'Super Save', timestamp: '2 hours ago' },
  { id: '5', type: 'renewal', message: 'Subscription renewed', shopName: 'Daily Needs', timestamp: '3 hours ago' },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: dashboardData } = await adminApi.getDashboard();
      if (dashboardData) {
        setData(dashboardData);
      } else {
        // Mock data for demo
        setData({
          totalShops: 256,
          activeShops: 198,
          totalRevenue: 45680,
          newShopsToday: 12,
        });
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const stats = data ? [
    {
      name: 'Total Shops',
      value: data.totalShops.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Store,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Active Shops',
      value: data.activeShops.toLocaleString(),
      change: '+8%',
      trend: 'up',
      icon: Activity,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Total Revenue',
      value: `E${data.totalRevenue.toLocaleString()}`,
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'New Today',
      value: data.newShopsToday.toString(),
      change: '-3%',
      trend: 'down',
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
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                      {stat.change}
                    </span>
                    <span className="text-slate-500 text-sm">vs last month</span>
                  </div>
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
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockChartData}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Revenue</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockChartData}>
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
          <div className="divide-y divide-slate-700">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-slate-700/50 transition-colors">
                <div className="p-2 rounded-lg bg-slate-700">
                  {activity.type === 'signup' && <Store className="w-4 h-4 text-blue-400" />}
                  {activity.type === 'upgrade' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {activity.type === 'sale' && <DollarSign className="w-4 h-4 text-amber-400" />}
                  {activity.type === 'renewal' && <Activity className="w-4 h-4 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{activity.message}</p>
                  <p className="text-sm text-slate-400">{activity.shopName}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
