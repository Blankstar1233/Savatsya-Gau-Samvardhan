import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Globe,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { AnimatedCard, AnimatedButton } from '@/components/ui/AnimatedComponents';
import { useToast } from '@/hooks/use-toast';
import ChangePassword from './ChangePassword';
import TwoFactorAuth from './TwoFactorAuth';
import DataDownload from './DataDownload';
import DeleteAccount from './DeleteAccount';

const UserSettings: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const { config, setTheme, setColorScheme, setFontSize, toggleAnimations, toggleHighContrast } = useTheme();
  const { config: langConfig, setLanguage, setCurrency, t, getCurrentLanguageName, getCurrentCurrencyName } = useLanguage();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState(user?.preferences?.notifications || {
    email: true,
    sms: true,
    push: true,
  });

  const handleNotificationChange = (type: 'email' | 'sms' | 'push', value: boolean) => {
    const newNotifications = { ...notifications, [type]: value };
    setNotifications(newNotifications);
    
    if (user) {
      updatePreferences({
        ...user.preferences,
        notifications: newNotifications,
      });
    }
    
    toast({
      title: "Notification settings updated",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleLanguageChange = (language: 'en' | 'hi' | 'mr') => {
    setLanguage(language);
    if (user) {
      updatePreferences({
        ...user.preferences,
        language,
      });
    }
    toast({
      title: t('language-updated'),
      description: t('language-preference-saved'),
    });
  };

  const getThemeIcon = () => {
    switch (config.theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme & Display Settings */}
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            {t('theme-display')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label>{t('theme') || 'Theme'}</Label>
            <div className="flex space-x-2">
              <Button
                variant={config.theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={config.theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={config.theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex items-center"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-2">
            <Label>{t('color-scheme') || 'Color Scheme'}</Label>
            <Select value={config.colorScheme} onValueChange={(value: any) => setColorScheme(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cool">Cool</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label>{t('font-size') || 'Font Size'}</Label>
            <Select value={config.fontSize} onValueChange={(value: any) => setFontSize(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accessibility Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('animations') || 'Animations'}</Label>
                <p className="text-sm text-gray-600">Enable smooth animations and transitions</p>
              </div>
              <Switch
                checked={config.animations}
                onCheckedChange={toggleAnimations}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('high-contrast') || 'High Contrast'}</Label>
                <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
              </div>
              <Switch
                checked={config.highContrast}
                onCheckedChange={toggleHighContrast}
              />
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Notification Settings */}
      <AnimatedCard delay={0.2}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            {t('notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive order updates and promotions via email</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-600">Get delivery updates via SMS</p>
            </div>
            <Switch
              checked={notifications.sms}
              onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive real-time notifications in browser</p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
            />
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Language Settings */}
      <AnimatedCard delay={0.3}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            {t('language-region')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('language')}</Label>
            <Select 
              value={langConfig.language} 
              onValueChange={(value: any) => handleLanguageChange(value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder={getCurrentLanguageName()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="hi">{t('hindi')}</SelectItem>
                <SelectItem value="mr">{t('marathi')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('currency')}</Label>
            <Select 
              value={langConfig.currency} 
              onValueChange={(value: any) => setCurrency(value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder={getCurrentCurrencyName()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">{t('indian-rupee')}</SelectItem>
                <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Privacy & Security */}
      <AnimatedCard delay={0.4}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            {t('privacy-security')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <ChangePassword
              trigger={
                <div className="w-full bg-sawatsya-sand hover:bg-sawatsya-cream text-sawatsya-wood transition-all duration-200 py-4 px-4 rounded-lg cursor-pointer border border-sawatsya-sand hover:border-sawatsya-wood/20 shadow-sm hover:shadow-md">
                  <span className="font-medium">{t('change-password')}</span>
                </div>
              }
            />
            
            <TwoFactorAuth
              trigger={
                <div className="w-full bg-sawatsya-sand hover:bg-sawatsya-cream text-sawatsya-wood transition-all duration-200 py-4 px-4 rounded-lg cursor-pointer border border-sawatsya-sand hover:border-sawatsya-wood/20 shadow-sm hover:shadow-md">
                  <span className="font-medium">{t('enable-2fa')}</span>
                </div>
              }
            />
            
            <DataDownload
              trigger={
                <div className="w-full bg-sawatsya-sand hover:bg-sawatsya-cream text-sawatsya-wood transition-all duration-200 py-4 px-4 rounded-lg cursor-pointer border border-sawatsya-sand hover:border-sawatsya-wood/20 shadow-sm hover:shadow-md">
                  <span className="font-medium">{t('download-data')}</span>
                </div>
              }
            />
            
            <div className="pt-2">
              <DeleteAccount
                trigger={
                  <div className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 py-4 px-4 rounded-lg cursor-pointer border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md">
                    <span className="font-medium">{t('delete-account')}</span>
                  </div>
                }
              />
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

export default UserSettings;
