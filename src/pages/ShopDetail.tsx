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
  AlertTriangle,
  Trash2,
  Crown,
  Calendar,
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string | null;
  address: string | null;
  tier: string;
  createdAt: string;
  licenseExpiry: string | null;
}

const TIERS = ['FREE', 'Lite', 'Starter', 'Business', 'Pro', 'Enterprise'];

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
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
        setSelectedTier(data.tier || 'FREE');
      }
      setIsLoading(false);
    };
    fetchShop();
  }, [id]);

  const handleUpgrade = async () => {
    setActionLoading(true);
    const { error } = await adminApi.updateSubscription(id!, { tier: selectedTier });
    if (!error) {
      setShop(prev => prev ? { ...prev, tier: selectedTier } : null);
    }
    setActionLoading(false);
    setUpgradeModalOpen(false);
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    const newStatus = status === 'suspended' ? 'active' : 'suspended';
    const { error } = await adminApi.updateShopStatus(id!, newStatus);
    if (!error) {
      setStatus(newStatus);
    }
    setActionLoading(false);
    setSuspendModalOpen(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    const { error } = await adminApi.deleteShop(id!);
    setActionLoading(false);
    if (!error) {
      navigate('/shops');
    }
    setDeleteModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
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
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-slate-400" />
                Shop Information
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Owner Name</p>
                    <p className="text-white">{shop.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white">{shop.ownerPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">{shop.ownerEmail || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Address</p>
                    <p className="text-white">{shop.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Joined</p>
                    <p className="text-white">
                      {new Date(shop.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">License Expires</p>
                    <p className="text-white">
                      {shop.licenseExpiry
                        ? new Date(shop.licenseExpiry).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'No expiry (Free tier)'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">Actions</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setUpgradeModalOpen(true)}
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
                {status === 'suspended' ? 'Reactivate' : 'Suspend'}
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

      {/* Change Tier Modal */}
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
        title={status === 'suspended' ? 'Reactivate Shop' : 'Suspend Shop'}
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            {status === 'suspended'
              ? 'Are you sure you want to reactivate this shop? The owner will regain access immediately.'
              : 'Are you sure you want to suspend this shop? The owner will lose access until reactivated.'}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSuspendModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant={status === 'suspended' ? 'primary' : 'danger'}
              onClick={handleSuspend}
              isLoading={actionLoading}
              className="flex-1"
            >
              {status === 'suspended' ? 'Reactivate' : 'Suspend'}
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
