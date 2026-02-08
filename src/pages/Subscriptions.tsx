import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { TierBadge, StatusBadge } from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  CreditCard,
  Store,
  Calendar,
  CheckCircle,
  AlertCircle,
  Crown,
  RefreshCw,
} from 'lucide-react';

interface Subscription {
  id: string;
  shopId: string;
  shopName: string;
  ownerName: string;
  tier: string;
  status: string;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
}

const TIERS = ['Lite', 'Starter', 'Business', 'Pro', 'Enterprise'];
const ITEMS_PER_PAGE = 10;

// Mock data
const mockSubscriptions: Subscription[] = Array.from({ length: 45 }, (_, i) => ({
  id: `sub-${i + 1}`,
  shopId: `shop-${i + 1}`,
  shopName: ['Fresh Mart', 'Quick Shop', 'Super Save', 'Daily Needs', 'City Store'][i % 5] + ` ${Math.floor(i / 5) + 1}`,
  ownerName: ['John Dlamini', 'Mary Simelane', 'Peter Nkosi', 'Grace Mamba', 'David Zwane'][i % 5],
  tier: TIERS[i % 5],
  status: i % 7 === 0 ? 'expired' : i % 11 === 0 ? 'cancelled' : 'active',
  startDate: new Date(Date.now() - (365 - i * 7) * 24 * 60 * 60 * 1000).toISOString(),
  expiryDate: new Date(Date.now() + (30 + i * 7) * 24 * 60 * 60 * 1000).toISOString(),
  autoRenew: i % 3 !== 0,
}));

export default function Subscriptions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState(searchParams.get('tier') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'upgrade' | 'renew' | null>(null);
  const [selectedTier, setSelectedTier] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      const { data } = await adminApi.getSubscriptions();
      
      if (data) {
        setSubscriptions(data);
        setTotal(data.length);
      } else {
        // Use mock data
        let filtered = mockSubscriptions;
        if (tierFilter !== 'all') {
          filtered = filtered.filter(s => s.tier.toLowerCase() === tierFilter.toLowerCase());
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter(s => s.status === statusFilter);
        }
        
        setTotal(filtered.length);
        setSubscriptions(filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE));
      }
      setIsLoading(false);
    };
    fetchSubscriptions();
  }, [page, tierFilter, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage), tier: tierFilter, status: statusFilter });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === subscriptions.length) {
      setSelected([]);
    } else {
      setSelected(subscriptions.map(s => s.id));
    }
  };

  const handleBulkAction = async () => {
    setActionLoading(true);
    // API calls would go here
    await new Promise(resolve => setTimeout(resolve, 1500));
    setActionLoading(false);
    setBulkModalOpen(false);
    setSelected([]);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const tierStats = TIERS.map(tier => ({
    name: tier,
    count: mockSubscriptions.filter(s => s.tier === tier).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400">Manage shop subscriptions and tiers</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <CreditCard className="w-4 h-4" />
          {total} subscriptions
        </div>
      </div>

      {/* Tier Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tierStats.map((tier) => (
          <Card key={tier.name} className="cursor-pointer hover:border-amber-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TierBadge tier={tier.name} />
                <span className="text-2xl font-bold text-white">{tier.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <select
                value={tierFilter}
                onChange={(e) => {
                  setTierFilter(e.target.value);
                  setSearchParams({ page: '1', tier: e.target.value, status: statusFilter });
                }}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Tiers</option>
                {TIERS.map(tier => (
                  <option key={tier} value={tier.toLowerCase()}>{tier}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setSearchParams({ page: '1', tier: tierFilter, status: e.target.value });
                }}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {selected.length > 0 && (
              <div className="flex gap-2">
                <span className="py-2 text-sm text-slate-400">
                  {selected.length} selected
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setBulkAction('upgrade');
                    setBulkModalOpen(true);
                  }}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setBulkAction('renew');
                    setBulkModalOpen(true);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Renew
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No subscriptions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <input
                        type="checkbox"
                        checked={selected.length === subscriptions.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                    </TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Auto-Renew</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.includes(sub.id)}
                          onChange={() => toggleSelect(sub.id)}
                          className="rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Store className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-white">{sub.shopName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sub.ownerName}</TableCell>
                      <TableCell><TierBadge tier={sub.tier} /></TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {new Date(sub.expiryDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sub.autoRenew ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-slate-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t border-slate-700">
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title={bulkAction === 'upgrade' ? 'Bulk Upgrade' : 'Bulk Renew'}
      >
        <div className="space-y-4">
          {bulkAction === 'upgrade' ? (
            <>
              <p className="text-slate-300">
                Upgrade {selected.length} subscription{selected.length > 1 ? 's' : ''} to:
              </p>
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
            </>
          ) : (
            <p className="text-slate-300">
              Renew {selected.length} subscription{selected.length > 1 ? 's' : ''} for another billing period?
            </p>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setBulkModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleBulkAction} isLoading={actionLoading} className="flex-1">
              {bulkAction === 'upgrade' ? 'Upgrade All' : 'Renew All'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
