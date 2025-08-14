import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, MapPin, Settings, Heart, Package } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="section-container min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-sawatsya-wood mb-4">
            Please log in to view your profile
          </h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-sawatsya-wood mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-sawatsya-earth text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <CardTitle className="text-xl text-sawatsya-wood">{user.name}</CardTitle>
                <p className="text-gray-600">{user.email}</p>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => alert('Edit profile functionality coming soon!')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={logout}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sawatsya-wood">
                  <User className="mr-2 h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-gray-600">{user.name}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <span className="h-4 w-4 text-gray-500">📱</span>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sawatsya-wood">
                  <MapPin className="mr-2 h-5 w-5" />
                  Delivery Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.address && user.address.length > 0 ? (
                  <div className="space-y-3">
                    {user.address.map((addr) => (
                      <div key={addr.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{addr.label}</p>
                            <p className="text-sm text-gray-600">
                              {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {addr.isDefault && (
                              <span className="inline-block bg-sawatsya-earth text-white text-xs px-2 py-1 rounded mt-1">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No delivery addresses added yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => alert('Add address functionality coming soon!')}
                    >
                      Add Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sawatsya-wood text-lg">
                    <Heart className="mr-2 h-5 w-5" />
                    Wishlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-sawatsya-earth">0</p>
                  <p className="text-sm text-gray-600">Items saved</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sawatsya-wood text-lg">
                    <Package className="mr-2 h-5 w-5" />
                    Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-sawatsya-earth">0</p>
                  <p className="text-sm text-gray-600">Total orders</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
