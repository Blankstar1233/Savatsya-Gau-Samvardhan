import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2, 
  Plus,
  Camera,
  Save,
  X
} from 'lucide-react';
import { AnimatedCard, AnimatedButton } from '@/components/ui/AnimatedComponents';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/contexts/AuthContext';

interface AddressFormData {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

const ProfileManager: React.FC = () => {
  const { user, updateUser, addAddress, updateAddress, deleteAddress } = useAuth();
  const { toast } = useToast();
  
  // State for various forms and dialogs
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    label: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Profile picture upload handler
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicture(result);
        // You would typically upload this to a server here
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been successfully updated",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile form handlers
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileForm);
    setIsEditingProfile(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been successfully updated",
    });
  };

  // Address form handlers
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      updateAddress(editingAddress.id, addressForm);
      toast({
        title: "Address updated",
        description: "Your address has been successfully updated",
      });
    } else {
      addAddress(addressForm);
      toast({
        title: "Address added",
        description: "New address has been successfully added",
      });
    }
    
    resetAddressForm();
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
  };

  const handleDeleteAddress = (addressId: string) => {
    deleteAddress(addressId);
    toast({
      title: "Address deleted",
      description: "Address has been successfully removed",
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </span>
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditingProfile ? 'Cancel' : 'Edit'}
            </AnimatedButton>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-sawatsya-earth flex items-center justify-center">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <label 
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 bg-sawatsya-amber hover:bg-sawatsya-wood text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <Camera className="h-4 w-4" />
              </label>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-sawatsya-wood">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                Member since {new Date().getFullYear()}
              </Badge>
            </div>
          </div>

          {/* Profile Form */}
          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <AnimatedButton type="submit" className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </AnimatedButton>
                <AnimatedButton 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </AnimatedButton>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-gray-600">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-gray-600">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Address Management Card */}
      <AnimatedCard delay={0.2}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Delivery Addresses
            </span>
            <Dialog open={isAddingAddress || !!editingAddress} onOpenChange={(open) => !open && resetAddressForm()}>
              <DialogTrigger asChild>
                <AnimatedButton onClick={() => setIsAddingAddress(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </AnimatedButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddressSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="address-label">Address Label</Label>
                      <Input
                        id="address-label"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Home, Office, etc."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Textarea
                        id="street"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="House/Flat No., Street, Area"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                        placeholder="XXXXXX"
                        pattern="[0-9]{6}"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is-default"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="is-default">Set as default address</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetAddressForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAddress ? 'Update Address' : 'Add Address'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.address && user.address.length > 0 ? (
            <div className="space-y-3">
              {user.address.map((address) => (
                <div key={address.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{address.label}</h4>
                        {address.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this address? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAddress(address.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="mb-4">No delivery addresses added yet</p>
              <Button onClick={() => setIsAddingAddress(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Address
              </Button>
            </div>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

export default ProfileManager;
