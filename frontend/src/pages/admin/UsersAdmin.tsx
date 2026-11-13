import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/card';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { Badge } from '@/components/ui/atoms/badge';
import { Label } from '@/components/ui/atoms/label';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { useServerPagedList } from '@/hooks/useServerPagedList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/atoms/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/atoms/dialog";
import { Switch } from "@/components/ui/atoms/switch";
import api from '@/utils/api';
import { toast } from 'sonner';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  data?: any;
  onSave: (data: any) => void;
}

const UserForm = ({ isOpen, onClose, mode, data, onSave }: UserFormProps) => {
  const [formData, setFormData] = useState(() => {
    if (data) {
      return {
        username: data.username || '',
        email: data.email || '',
        password: '',
        role: data.role || 'viewer',
        is_active: data.is_active === undefined ? true : data.is_active,
      };
    }
    return {
      username: '',
      email: '',
      password: '',
      role: 'viewer', // Default role is viewer, not admin
      is_active: true,
    };
  });

  // Update formData when data changes
  useEffect(() => {
    if (data) {
      setFormData({
        username: data.username || '',
        email: data.email || '',
        password: '',
        role: data.role || 'viewer',
        is_active: data.is_active === undefined ? true : data.is_active,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'viewer',
        is_active: true,
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email) {
      toast.error('Username and email are required');
      return;
    }
    
    if (mode === 'create' && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password validation for new users
    if (mode === 'create' && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              required
              disabled={mode === 'edit'} // Username cannot be changed after creation
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password (min. 6 characters)"
                required
                minLength={6}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Viewer: Read-only access • Editor: Can edit content • Admin: Full access
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active User</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const USERS_PER_PAGE = 12;

const UsersAdmin = () => {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const {
    items: users,
    total,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    loading,
    reload: fetchUsers,
  } = useServerPagedList<any>(
    async (page, limit, search) => {
      const response = await api.getUsers({ page, limit, search });
      return { items: response.users || [], total: response.pagination?.total ?? 0 };
    },
    {
      pageSize: USERS_PER_PAGE,
      onError: (error) => {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      },
    }
  );

  const handleCreate = () => {
    setFormMode('create');
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: any) => {
    setFormMode('edit');
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleSave = async (userData: any) => {
    try {
      if (formMode === 'create') {
        await api.createUser(userData);
        toast.success('User created successfully');
      } else {
        const updateData: any = {
          email: userData.email,
          role: userData.role,
          is_active: userData.is_active,
        };
        await api.updateUser(editingUser.id, updateData);
        toast.success('User updated successfully');
      }
      
      setIsFormOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || `Error ${formMode === 'create' ? 'creating' : 'updating'} user`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting user');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 py-[10px]">Manage Users</h1>
            <p className="text-gray-600 mt-1">View and manage system users</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{user.username || 'Unknown'}</CardTitle>
                    <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className={`text-xs ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-600" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <AdminPagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={USERS_PER_PAGE}
            onPageChange={setPage}
          />
          </>
        )}

        {/* User Form */}
        <UserForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          mode={formMode}
          data={editingUser}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersAdmin;
