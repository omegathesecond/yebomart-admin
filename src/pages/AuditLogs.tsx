import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import ErrorState from '../components/ErrorState';
import { ScrollText, Store, User, X } from 'lucide-react';

interface AuditLog {
  id: string;
  shopId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  shop?: { id: string; name: string } | null;
  user?: { id: string; name: string; role: string } | null;
}

interface ShopOption {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 50;

// Mirrors the AuditAction union in api/src/services/audit.service.ts. These are
// the only action values the backend ever writes, so a static list is the DRY
// source for the filter dropdown (no extra endpoint needed).
const ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'PRODUCT_CREATE',
  'PRODUCT_UPDATE',
  'PRODUCT_DELETE',
  'SALE_CREATE',
  'SALE_VOID',
  'STOCK_ADJUST',
  'STOCK_RECEIVE',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'EXPENSE_CREATE',
  'EXPENSE_DELETE',
  'SETTINGS_UPDATE',
  'LICENSE_APPLY',
];

// Color-code actions by risk so voids/deletions jump out for fraud review.
function actionVariant(action: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  if (action.includes('DELETE') || action.includes('VOID')) return 'danger';
  if (action.includes('CREATE') || action.includes('RECEIVE')) return 'success';
  if (action.includes('UPDATE') || action.includes('ADJUST') || action.includes('APPLY')) return 'warning';
  return 'info'; // LOGIN / LOGOUT
}

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDetails(log: AuditLog): string {
  if (!log.details || Object.keys(log.details).length === 0) return '';
  try {
    return JSON.stringify(log.details);
  } catch {
    return '';
  }
}

export default function AuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [shops, setShops] = useState<ShopOption[]>([]);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const shopId = searchParams.get('shopId') || '';
  const userId = searchParams.get('userId') || '';
  const action = searchParams.get('action') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  // Populate the shop filter dropdown. Best-effort: if it fails the dropdown is
  // simply empty (logged) — we never fabricate shop options. The audit table
  // below still surfaces shop names from the log payload, and its own fetch
  // failures are surfaced loudly via <ErrorState>.
  useEffect(() => {
    adminApi.getShops({ page: 1, limit: 200 }).then(({ data, error: shopErr }) => {
      if (shopErr || !data) {
        console.error('Failed to load shop filter options:', shopErr);
        return;
      }
      setShops(data.shops.map((s: any) => ({ id: s.id, name: s.name })));
    });
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: apiError } = await adminApi.getAuditLogs({
        page,
        limit: ITEMS_PER_PAGE,
        shopId: shopId || undefined,
        userId: userId || undefined,
        action: action || undefined,
        // Widen the date inputs to whole-day bounds so the range is inclusive.
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T23:59:59.999` : undefined,
      });

      if (apiError || !data) {
        // No silent fallback — surface the failure instead of fabricating rows.
        setError(apiError || 'No data returned from the server.');
        setLogs([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      setLogs(data.logs);
      setTotal(data.total);
      setIsLoading(false);
    };
    fetchLogs();
  }, [page, shopId, userId, action, startDate, endDate, reloadKey]);

  // Merge a single filter change into the URL, always resetting to page 1.
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasFilters = Boolean(shopId || userId || action || startDate || endDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400">Cross-shop activity — voids, deletions, status changes</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <ScrollText className="w-4 h-4" />
          {total} {total === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={shopId}
                onChange={(e) => updateFilter('shopId', e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All shops</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={action}
                onChange={(e) => updateFilter('action', e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All actions</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {formatAction(a)}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="From date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="To date"
              />
            </div>

            {/* userId has no dropdown (too many users) — it arrives via deep-link
                from the User detail page and shows as a removable chip. */}
            {(userId || hasFilters) && (
              <div className="flex flex-wrap items-center gap-2">
                {userId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    <User className="w-3 h-3" />
                    User: {userId}
                    <button
                      onClick={() => updateFilter('userId', '')}
                      className="hover:text-white"
                      aria-label="Clear user filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {hasFilters && (
                  <button
                    onClick={() => setSearchParams({ page: '1' })}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <ScrollText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No audit entries found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const details = formatDetails(log);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-slate-500" />
                            <span className="text-white">
                              {log.shop?.name || <span className="text-slate-500">{log.shopId}</span>}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <div>
                              <span className="text-white">{log.user.name}</span>
                              <span className="block text-xs text-slate-500">{log.user.role}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500">{log.userId}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionVariant(log.action)}>{formatAction(log.action)}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-300">{log.entityType}</span>
                          {log.entityId && (
                            <span className="block text-xs text-slate-500 truncate max-w-[12rem]" title={log.entityId}>
                              {log.entityId}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {details && (
                              <span
                                className="block text-xs text-slate-400 truncate"
                                title={details}
                              >
                                {details}
                              </span>
                            )}
                            {log.ipAddress && (
                              <span className="block text-xs text-slate-600">{log.ipAddress}</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
