import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { StatusBadge } from '../components/Badge';
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
  Calendar,
  Package,
  Receipt,
  Users,
  ChevronRight,
} from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Shop {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string | null;
  address: string | null;
  status: string;
  createdAt: string;
  users?: StaffUser[];
  _count?: { products: number; sales: number; users: number };
}

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendError, setSuspendError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      const { data } = await adminApi.getShop(id!);
      if (data) {
        setShop(data);
        // status arrives as the uppercase enum (ACTIVE | SUSPENDED); the local
        // state + suspend toggle speak lowercase, same as Shops.tsx.
        setStatus(String(data.status || 'active').toLowerCase() === 'suspended' ? 'suspended' : 'active');
      }
      setIsLoading(false);
    };
    fetchShop();
  }, [id]);

  const handleSuspend = async () => {
    setActionLoading(true);
    setSuspendError(null);
    const newStatus = status === 'suspended' ? 'active' : 'suspended';
    const { error } = await adminApi.updateShopStatus(id!, newStatus);
    setActionLoading(false);
    // On failure, surface the real message and keep the modal open — never
    // close as if the action succeeded.
    if (error) {
      setSuspendError(error);
      return;
    }
    setStatus(newStatus);
    setSuspendModalOpen(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setDeleteError(null);
    const { error } = await adminApi.deleteShop(id!);
    setActionLoading(false);
    // The only success signal for delete is the navigate away; on failure we
    // must keep the modal open with the error so the admin doesn't assume the
    // destructive action worked.
    if (error) {
      setDeleteError(error);
      return;
    }
    setDeleteModalOpen(false);
    navigate('/shops');
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
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Products', value: shop._count?.products ?? 0, icon: Package },
          { label: 'Sales', value: shop._count?.sales ?? 0, icon: Receipt },
          { label: 'Staff', value: shop._count?.users ?? 0, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
                onClick={() => {
                  setSuspendError(null);
                  setSuspendModalOpen(true);
                }}
                className="w-full"
                variant="secondary"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {status === 'suspended' ? 'Reactivate' : 'Suspend'}
              </Button>
              <Button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteModalOpen(true);
                }}
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

      {/* Staff */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Staff
            <span className="text-sm font-normal text-slate-400">
              ({shop.users?.length ?? 0})
            </span>
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {shop.users && shop.users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shop.users.map((member) => (
                  <TableRow key={member.id} onClick={() => navigate(`/users/${member.id}`)}>
                    <TableCell>
                      <span className="font-medium text-white">{member.name}</span>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <StatusBadge status={member.isActive ? 'active' : 'inactive'} />
                    </TableCell>
                    <TableCell>
                      {member.lastLoginAt
                        ? new Date(member.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No staff yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspend Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => {
          setSuspendModalOpen(false);
          setSuspendError(null);
        }}
        title={status === 'suspended' ? 'Reactivate Shop' : 'Suspend Shop'}
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            {status === 'suspended'
              ? 'Are you sure you want to reactivate this shop? The owner will regain access immediately.'
              : 'Are you sure you want to suspend this shop? The owner will lose access until reactivated.'}
          </p>
          {suspendError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{suspendError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSuspendModalOpen(false);
                setSuspendError(null);
              }}
              className="flex-1"
            >
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
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteError(null);
        }}
        title="Delete Shop"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 font-medium">Warning: This action cannot be undone!</p>
            <p className="text-slate-300 mt-2 text-sm">
              Deleting this shop will permanently remove all associated data including products, sales, and user accounts.
            </p>
          </div>
          {deleteError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">Failed to delete shop: {deleteError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteError(null);
              }}
              className="flex-1"
            >
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
