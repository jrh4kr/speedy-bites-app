import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { mockMenuItems, mockCategories } from '@/data/mockData';
import { toast } from 'sonner';
import type { MenuItem } from '@/lib/api';

export const AdminMenuPage = () => {
  const [items, setItems] = useState(mockMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
    toast.success('Item availability updated');
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item deleted');
  };

  return (
    <AdminLayout title="Menu Management">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {mockCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <Switch 
                      checked={item.isAvailable}
                      onCheckedChange={() => toggleAvailability(item.id)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <PriceDisplay price={item.price} className="font-semibold" />
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        KES {item.originalPrice}
                      </span>
                    )}
                  </div>
                  {item.isFeatured && (
                    <Badge variant="secondary" className="mt-2">Featured</Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setEditItem(item)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog 
        open={isAddModalOpen || !!editItem} 
        onOpenChange={() => { setIsAddModalOpen(false); setEditItem(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Menu Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Item Name</label>
              <Input 
                defaultValue={editItem?.name}
                placeholder="e.g., Crispy Wings"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                defaultValue={editItem?.description}
                placeholder="Describe the item..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price (KES)</label>
                <Input 
                  type="number"
                  defaultValue={editItem?.price}
                  placeholder="500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Original Price</label>
                <Input 
                  type="number"
                  defaultValue={editItem?.originalPrice}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select defaultValue={editItem?.categoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input 
                defaultValue={editItem?.image}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setEditItem(null); }}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(editItem ? 'Item updated' : 'Item added');
              setIsAddModalOpen(false);
              setEditItem(null);
            }}>
              {editItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMenuPage;
