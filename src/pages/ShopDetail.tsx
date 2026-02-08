import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { TierBadge, StatusBadge } from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import {
  Store,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Crown,
  Activity,
  Clock,
} from 'lucide-react';

interface ShopDetails {
  id: string;
  name: string;
  description: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  address: string;
  tier: string;
  status: string;
  subscriptionExpiry: string;
  createdAt: string;
  stats: {
    products: number;
    sales: number;
    users: number;
    revenue: number;
  };
  activityLog: {
    id: string;
    action: string;
    timestamp: string;
  }[];
}

const TIERS = ['Lite', 'Starter', 'Business', 'Pro', 'Enterprise'];

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      const { data } = await adminApi.getShop(id!);
      if (data) {
        setShop(data);
      } else {
        // Mock data
        setShop({
          id: id!,
          name: 'Fresh Mart Central',
          description: 'A premium grocery store offering fresh produce and quality goods.',
          owner: {
            name: 'John Dlamini',
            email: 'john@freshmart.sz',
            phone: '+26876123456',
          },
          address: 'Main Street 42, Mbabane, Eswatini',
          tier: 'Business',
          status: 'active',
          subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            products: 234,
            sales: 1542,
            users: 8,
            revenue: 45680,
          },
          activityLog: [
            { id: '1', action: 'Product added: Fresh Apples', timestamp: '2 hours ago' },
            { id: '2', action: 'Sale completed: E250', timestamp: '5 hours ago' },
            { id: '3', action: 'User added: Mary S.', timestamp: '1 day ago' },
            { id: '4', action: 'Subscription renewed', timestamp: '2 days ago' },
            { id: '5', action: 'Inventory updated', timestamp: '3 days ago' },
          ],
        });
      }
      setIsLoading(false);
    };
    fetchShop();
  }, [id]);

  const handleUpgrade = async () => {
    setActionLoading(true);
    await adminApi.updateSubscription(id!, { tier: selectedTier });
    setShop(prev => prev ? { ...prev, tier: selectedTier } : null);
    setActionLoading(false);
    setUpgradeModalOpen(false);
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    // API call would go here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShop(prev => prev ? { ...prev, status: prev.status === 'suspended' ? 'active' : 'suspended' } : null);
    setActionLoading(false);
    setSuspendModalOpen(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    // API call would go here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setActionLoading(false);
    navigate('/shops');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-48 bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Shop not found</p>
        <Link to="/shops" className="text-amber-500 hover:underline mt-2 inline-block">
          Back to shops
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Products', value: shop.stats.products, icon: Package, color: 'text-blue-400' },
    { label: 'Sales', value: shop.stats.sales, icon: ShoppingCart, color: 'text-green-400' },
    { label: 'Users', value: shop.stats.users, icon: Users, color: 'text-purple-400' },
    { label: 'Revenue', value: `E${shop.stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/shops')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
            <TierBadge tier={shop.tier} />
            <StatusBadge status={shop.status} />
          </div>
          <p className="text-slate-400 mt-1">{shop.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Owner Info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                Owner Information
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-400">Name</p>
                    <p className="text-white">{shop.owner.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">{shop.owner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white">{shop.owner.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-400">Address</p>
                    <p className="text-white">{shop.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                Activity Log
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-700">
                {shop.activityLog.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 px-6 py-3">
                    <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-300 flex-1">{log.action}</span>
                    <span className="text-sm text-slate-500">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Subscription
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Current Tier</p>
                <div className="flex items-center gap-2 mt-1">
                  <TierBadge tier={shop.tier} />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Expires</p>
                <p className="text-white mt-1">
                  {new Date(shop.subscriptionExpiry).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Member Since</p>
                <p className="text-white mt-1">
                  {new Date(shop.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">Actions</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => {
                  setSelectedTier(shop.tier);
                  setUpgradeModalOpen(true);
                }}
                className="w-full"
                variant="primary"
              >
                <Crown className="w-4 h-4 mr-2" />
                Change Tier
              </Button>
              <Button
                onClick={() => setSuspendModalOpen(true)}
                className="w-full"
                variant="secondary"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {shop.status === 'suspended' ? 'Reactivate' : 'Suspend'}
              </Button>
              <Button
                onClick={() => setDeleteModalOpen(true)}
                className="w-full"
                variant="danger"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Shop
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Change Subscription Tier"
      >
        <div className="space-y-4">
          <p className="text-slate-300">Select a new tier for this shop:</p>
          <div className="space-y-2">
            {TIERS.map((tier) => (
              <label
                key={tier}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTier === tier
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-600 hover:bg-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={selectedTier === tier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedTier === tier ? 'border-amber-500' : 'border-slate-500'
                }`}>
                  {selectedTier === tier && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <TierBadge tier={tier} />
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setUpgradeModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpgrade} isLoading={actionLoading} className="flex-1">
              Update Tier
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={shop.status === 'suspended' ? 'Reactivate Shop' : 'Suspend Shop'}
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            {shop.status === 'suspended'
              ? 'Are you sure you want to reactivate this shop? The owner will regain access immediately.'
              : 'Are you sure you want to suspend this shop? The owner will lose access until reactivated.'}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSuspendModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant={shop.status === 'suspended' ? 'primary' : 'danger'}
              onClick={handleSuspend}
              isLoading={actionLoading}
              className="flex-1"
            >
              {shop.status === 'suspended' ? 'Reactivate' : 'Suspend'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Shop"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 font-medium">Warning: This action cannot be undone!</p>
            <p className="text-slate-300 mt-2 text-sm">
              Deleting this shop will permanently remove all associated data including products, sales, and user accounts.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={actionLoading} className="flex-1">
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
