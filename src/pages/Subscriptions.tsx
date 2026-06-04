import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { StatusBadge } from '../components/Badge';
import ErrorState from '../components/ErrorState';
import { CreditCard, Store } from 'lucide-react';

interface StatusBucket {
  status: string;
  count: number;
}

export default function Subscriptions() {
  const [buckets, setBuckets] = useState<StatusBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchBreakdown = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: apiError } = await adminApi.getSubscriptions();

      if (apiError || !data) {
        // No silent fallback — surface the failure instead of fabricating data.
        setError(apiError || 'No data returned from the server.');
        setBuckets([]);
        setIsLoading(false);
        return;
      }

      setBuckets(data.map((b) => ({ status: b.status, count: b._count })));
      setIsLoading(false);
    };
    fetchBreakdown();
  }, [reloadKey]);

  const totalShops = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shop Status</h1>
          <p className="text-slate-400">Breakdown of all shops by account status</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <CreditCard className="w-4 h-4" />
          {totalShops} shops
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : error ? (
        <Card>
          <CardContent>
            <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
          </CardContent>
        </Card>
      ) : buckets.length === 0 ? (
        <Card>
          <CardContent>
            <div className="p-8 text-center">
              <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No shops found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {buckets.map((bucket) => (
            <Card key={bucket.status}>
              <CardHeader>
                <StatusBadge status={bucket.status.toLowerCase()} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{bucket.count.toLocaleString()}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {totalShops > 0 ? `${Math.round((bucket.count / totalShops) * 100)}% of shops` : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
