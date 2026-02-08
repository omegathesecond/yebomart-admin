import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { TierBadge, StatusBadge } from '../components/Badge';
import Pagination from '../components/Pagination';
import { Search, Store, ChevronRight } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  tier: string;
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

// Mock data for demo
const mockShops: Shop[] = Array.from({ length: 50 }, (_, i) => ({
  id: `shop-${i + 1}`,
  name: ['Fresh Mart', 'Quick Shop', 'Super Save', 'Daily Needs', 'City Store', 'Corner Shop', 'Mini Mart', 'Value Plus'][i % 8] + ` ${i + 1}`,
  ownerName: ['John Dlamini', 'Mary Simelane', 'Peter Nkosi', 'Grace Mamba', 'David Zwane'][i % 5],
  phone: `+26876${String(100000 + i).padStart(6, '0')}`,
  tier: ['Lite', 'Starter', 'Business', 'Pro', 'Enterprise'][i % 5],
  status: i % 7 === 0 ? 'inactive' : i % 11 === 0 ? 'suspended' : 'active',
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function Shops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [tierFilter, setTierFilter] = useState(searchParams.get('tier') || 'all');
  
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      const { data } = await adminApi.getShops({ page, limit: ITEMS_PER_PAGE, search });
      
      if (data) {
        // Map API fields to expected format
        const mappedShops = data.shops.map((shop: any) => ({
          id: shop.id,
          name: shop.name,
          ownerName: shop.ownerName,
          phone: shop.ownerPhone || shop.phone,
          tier: shop.tier || 'FREE',
          status: shop.status || 'active',
          createdAt: shop.createdAt,
        }));
        setShops(mappedShops);
        setTotal(data.total);
      } else {
        // Use mock data
        let filtered = mockShops;
        if (search) {
          filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            s.phone.includes(search)
          );
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter(s => s.status === statusFilter);
        }
        if (tierFilter !== 'all') {
          filtered = filtered.filter(s => s.tier.toLowerCase() === tierFilter.toLowerCase());
        }
        
        setTotal(filtered.length);
        setShops(filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE));
      }
      setIsLoading(false);
    };
    fetchShops();
  }, [page, search, statusFilter, tierFilter]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSearchParams({ page: '1', search: value, status: statusFilter, tier: tierFilter });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage), search, status: statusFilter, tier: tierFilter });
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shops</h1>
          <p className="text-slate-400">Manage all registered shops</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Store className="w-4 h-4" />
          {total} shops
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search shops, owners, or phone..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setSearchParams({ page: '1', search, status: e.target.value, tier: tierFilter });
                }}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={tierFilter}
                onChange={(e) => {
                  setTierFilter(e.target.value);
                  setSearchParams({ page: '1', search, status: statusFilter, tier: e.target.value });
                }}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Tiers</option>
                <option value="lite">Lite</option>
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : shops.length === 0 ? (
            <div className="p-8 text-center">
              <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No shops found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id} onClick={() => navigate(`/shops/${shop.id}`)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Store className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-white">{shop.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{shop.ownerName}</TableCell>
                      <TableCell>{shop.phone}</TableCell>
                      <TableCell><TierBadge tier={shop.tier} /></TableCell>
                      <TableCell><StatusBadge status={shop.status} /></TableCell>
                      <TableCell>{new Date(shop.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
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
    </div>
  );
}
