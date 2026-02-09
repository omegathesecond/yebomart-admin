import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import { Search, Users as UsersIcon, Mail, Phone, Store  } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopName: string;
  role: string;
  lastActive: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 15;

// Mock data
const mockUsers: User[] = Array.from({ length: 80 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: ['John Dlamini', 'Mary Simelane', 'Peter Nkosi', 'Grace Mamba', 'David Zwane', 'Sarah Khumalo', 'Michael Maseko', 'Linda Matsebula'][i % 8],
  email: `user${i + 1}@example.com`,
  phone: `+26876${String(100000 + i).padStart(6, '0')}`,
  shopName: ['Fresh Mart', 'Quick Shop', 'Super Save', 'Daily Needs', 'City Store'][i % 5] + ` ${Math.floor(i / 5) + 1}`,
  role: i % 8 === 0 ? 'owner' : i % 3 === 0 ? 'manager' : 'cashier',
  lastActive: ['2 minutes ago', '1 hour ago', '3 hours ago', 'Yesterday', '3 days ago'][i % 5],
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function Users() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const { data } = await adminApi.getUsers({ page, limit: ITEMS_PER_PAGE });
      
      if (data) {
        setUsers(data.users);
        setTotal(data.total);
      } else {
        // Use mock data
        let filtered = mockUsers;
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(u => 
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.phone.includes(search) ||
            u.shopName.toLowerCase().includes(s)
          );
        }
        if (roleFilter !== 'all') {
          filtered = filtered.filter(u => u.role === roleFilter);
        }
        
        setTotal(filtered.length);
        setUsers(filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE));
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSearchParams({ page: '1', search: value, role: roleFilter });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage), search, role: roleFilter });
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'warning';
      case 'manager': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400">All users across all shops</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <UsersIcon className="w-4 h-4" />
          {total} users
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
                placeholder="Search by name, email, phone, or shop..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setSearchParams({ page: '1', search, role: e.target.value });
              }}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No users found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-slate-700/50 transition-colors"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium text-white">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-slate-500" />
                          {user.shopName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
