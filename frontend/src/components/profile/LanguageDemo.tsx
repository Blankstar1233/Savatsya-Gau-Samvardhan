import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LanguageDemo: React.FC = () => {
  const { config, setLanguage, formatCurrency, formatDate, t } = useLanguage();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('language-region')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Current Language: {config.language}</p>
          <p className="text-sm text-gray-600">Current Currency: {config.currency}</p>
        </div>
        
        <div className="space-y-2">
          <p><strong>{t('home')}:</strong> {t('welcome')}</p>
          <p><strong>{t('products')}:</strong> {formatCurrency(1500)}</p>
          <p><strong>Date:</strong> {formatDate(new Date())}</p>
        </div>

        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={config.language === 'en' ? 'default' : 'outline'}
            onClick={() => setLanguage('en')}
          >
            EN
          </Button>
          <Button 
            size="sm" 
            variant={config.language === 'hi' ? 'default' : 'outline'}
            onClick={() => setLanguage('hi')}
          >
            हि
          </Button>
          <Button 
            size="sm" 
            variant={config.language === 'mr' ? 'default' : 'outline'}
            onClick={() => setLanguage('mr')}
          >
            मर
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageDemo;