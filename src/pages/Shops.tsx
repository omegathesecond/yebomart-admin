import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { StatusBadge } from '../components/Badge';
import Pagination from '../components/Pagination';
import ErrorState from '../components/ErrorState';
import { Search, Store, ChevronRight } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function Shops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: apiError } = await adminApi.getShops({ page, limit: ITEMS_PER_PAGE, search });

      if (apiError || !data) {
        // No silent fallback — surface the failure instead of fabricating rows.
        setError(apiError || 'No data returned from the server.');
        setShops([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      // Map API fields to expected format
      let mappedShops: Shop[] = data.shops.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        ownerName: shop.ownerName,
        phone: shop.ownerPhone || shop.phone,
        status: (shop.status || 'active').toLowerCase(),
        createdAt: shop.createdAt,
      }));
      // Status is a client-side display filter over the returned page.
      if (statusFilter !== 'all') {
        mappedShops = mappedShops.filter((s) => s.status === statusFilter);
      }
      setShops(mappedShops);
      setTotal(data.total);
      setIsLoading(false);
    };
    fetchShops();
  }, [page, search, statusFilter, reloadKey]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSearchParams({ page: '1', search: value, status: statusFilter });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage), search, status: statusFilter });
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
                  setSearchParams({ page: '1', search, status: e.target.value });
                }}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
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
