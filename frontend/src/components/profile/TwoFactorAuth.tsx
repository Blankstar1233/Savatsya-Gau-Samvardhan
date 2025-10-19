import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Copy, CheckCircle } from 'lucide-react';

interface TwoFactorAuthProps {
  trigger: React.ReactNode;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ trigger }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'sms' | 'app'>('email');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
   
    setIsEnabled(user?.twoFactorAuth?.enabled || false);
  }, [user]);

  const handleToggle2FA = async (enable: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/two-factor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enable, method: enable ? method : undefined })
      });

      const data = await response.json();

      if (data.ok) {
        setIsEnabled(enable);
        
        if (enable && data.backupCodes) {
          setBackupCodes(data.backupCodes);
          toast({
            title: t('2fa-enabled'),
            description: 'Please save your backup codes in a secure location',
          });
        } else if (!enable) {
          setBackupCodes([]);
          toast({
            title: 'Two-factor authentication disabled',
            description: 'Your account is now using single-factor authentication',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update two-factor authentication',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: 'Copied',
      description: 'Backup codes copied to clipboard',
    });
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([`Two-Factor Authentication Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${codesText}\n\nKeep these codes safe and do not share them.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            {t('enable-2fa')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {!isEnabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Authentication Method</Label>
                <Select value={method} onValueChange={(value: any) => setMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email (Recommended)</SelectItem>
                    <SelectItem value="sms">SMS Text Message</SelectItem>
                    <SelectItem value="app">Authenticator App</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="font-medium text-blue-900">How it works:</h4>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>• You'll receive a verification code each time you log in</li>
                  <li>• Backup codes will be provided for emergency access</li>
                  <li>• Your account will be significantly more secure</li>
                </ul>
              </div>
            </div>
          )}

          {backupCodes.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-amber-900">Backup Codes</h4>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyBackupCodes}
                      className="flex items-center"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadBackupCodes}
                    >
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      {code}
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-amber-800 mt-3">
                  <strong>Important:</strong> Save these codes in a secure location. 
                  You can use them to access your account if you lose access to your primary 2FA method.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            
            {isEnabled ? (
              <Button
                variant="destructive"
                onClick={() => handleToggle2FA(false)}
                disabled={loading}
              >
                {loading ? 'Disabling...' : t('disable')}
              </Button>
            ) : (
              <Button
                onClick={() => handleToggle2FA(true)}
                disabled={loading}
              >
                {loading ? 'Enabling...' : t('enable')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuth;