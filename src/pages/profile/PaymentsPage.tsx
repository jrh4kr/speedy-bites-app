import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CreditCard, Smartphone, MoreVertical, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'card';
  label: string;
  details: string;
  isDefault: boolean;
}

const initialMethods: PaymentMethod[] = [
  { id: '1', type: 'mpesa', label: 'M-Pesa', details: '+254 7** *** 123', isDefault: true },
];

export const PaymentsPage = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const handleAddMethod = () => {
    if (!newPhone || newPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    const method: PaymentMethod = {
      id: Date.now().toString(),
      type: 'mpesa',
      label: 'M-Pesa',
      details: `+254 ${newPhone.slice(0, 3)} *** ${newPhone.slice(-3)}`,
      isDefault: methods.length === 0,
    };
    
    setMethods(prev => [...prev, method]);
    setNewPhone('');
    setIsDialogOpen(false);
    toast.success('Payment method added');
  };

  const handleDelete = (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
    toast.success('Payment method removed');
  };

  const handleSetDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    toast.success('Default payment method updated');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Payment Methods</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add M-Pesa Number</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0712 345 678"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This number will be used for M-Pesa STK Push payments
              </p>
              <Button onClick={handleAddMethod} className="w-full">
                Add M-Pesa Number
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main className="px-4 py-4">
        {/* M-Pesa Info */}
        <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-400">M-Pesa Payments</h3>
              <p className="text-sm text-muted-foreground">Quick & secure mobile payments</p>
            </div>
          </div>
        </div>

        {methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No payment methods</h3>
            <p className="text-muted-foreground mb-6">Add your M-Pesa number for faster checkout</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add M-Pesa Number
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition-colors',
                  method.isDefault && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{method.label}</h3>
                    {method.isDefault && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{method.details}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 -mr-2">
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!method.isDefault && (
                      <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentsPage;
