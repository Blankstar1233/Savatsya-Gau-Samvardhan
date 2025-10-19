import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Heart, Package, MapPin, Activity, Mail } from 'lucide-react';
import Persona3D from '@/components/profile/Persona3D';
import ProfileManager from '@/components/profile/ProfileManager';
import UserSettings from '@/components/profile/UserSettings';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { AnimatedCard, AnimatedText, AnimatedButton } from '@/components/ui/AnimatedComponents';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <AnimatedPage>
        <div className="section-container min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <AnimatedText variant="h1" className="text-2xl font-serif text-sawatsya-wood mb-4">
              Please log in to view your profile
            </AnimatedText>
            <AnimatedButton onClick={() => window.location.href = '/login'}>
              Go to Login
            </AnimatedButton>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="section-container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <AnimatedText variant="h1" className="text-3xl font-serif text-sawatsya-wood mb-2">
              My Profile
            </AnimatedText>
            <AnimatedText delay={0.1} className="text-gray-600">
              Manage your account, preferences, and personal information
            </AnimatedText>
          </div>

          {}
          <AnimatedCard delay={0.2} className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-serif text-sawatsya-wood">
                Welcome Back, {user.name}!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Persona3D />
            </CardContent>
          </AnimatedCard>

          {}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Orders</span>
              </TabsTrigger>
            </TabsList>

            {}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedCard delay={0.3}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Account Info</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2">
                          <span className="h-4 w-4 text-gray-500">📱</span>
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setActiveTab('profile')}
                    >
                      Edit Profile
                    </Button>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={0.4}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Addresses</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-sawatsya-earth">
                      {user.address?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saved addresses
                    </p>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setActiveTab('profile')}
                    >
                      Manage Addresses
                    </Button>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={0.5}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-sawatsya-earth">0</div>
                    <p className="text-xs text-muted-foreground">
                      Total orders placed
                    </p>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setActiveTab('orders')}
                    >
                      View Orders
                    </Button>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={0.6}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-sawatsya-earth">0</div>
                    <p className="text-xs text-muted-foreground">
                      Items in wishlist
                    </p>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => window.location.href = '/products'}
                    >
                      Browse Products
                    </Button>
                  </CardContent>
                </AnimatedCard>
              </div>

              {}
              <AnimatedCard delay={0.7}>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => window.location.href = '/products'}
                    >
                      <Package className="h-6 w-6" />
                      <span className="text-sm">Shop Now</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('orders')}
                    >
                      <Activity className="h-6 w-6" />
                      <span className="text-sm">Track Order</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => window.location.href = '/contact'}
                    >
                      <Mail className="h-6 w-6" />
                      <span className="text-sm">Contact Us</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2 text-red-600 hover:text-red-700"
                      onClick={logout}
                    >
                      <User className="h-6 w-6" />
                      <span className="text-sm">Logout</span>
                    </Button>
                  </div>
                </CardContent>
              </AnimatedCard>
            </TabsContent>

            {}
            <TabsContent value="profile">
              <ProfileManager />
            </TabsContent>

            {}
            <TabsContent value="settings">
              <UserSettings />
            </TabsContent>

            {}
            <TabsContent value="orders">
              <AnimatedCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">
                      You haven't placed any orders yet. Start shopping to see your order history here.
                    </p>
                    <Button onClick={() => window.location.href = '/products'}>
                      Start Shopping
                    </Button>
                  </div>
                </CardContent>
              </AnimatedCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Profile;
