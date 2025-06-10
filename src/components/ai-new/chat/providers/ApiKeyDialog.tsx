import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyDialogProps {
  provider: {
    id: string;
    name: string;
  };
  onApiKeySaved: (providerId: string, apiKey: string) => void;
  variant?: 'default' | 'icon';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialApiKey?: string;
}

export function ApiKeyDialog({
  provider,
  onApiKeySaved,
  variant = 'default',
  open: isOpen = false,
  onOpenChange,
  initialApiKey = '',
}: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateApiKey = (key: string): boolean => {
    // Basic validation - can be enhanced per provider
    if (!key.trim()) return false;
    
    // Add provider-specific validation if needed
    switch (provider.id) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 30;
      case 'google':
        return key.startsWith('AIza') && key.length > 30;
      case 'anthropic':
        return key.startsWith('sk-ant-') && key.length > 40;
      default:
        return key.length > 20; // Generic validation for other providers
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    
    // Only validate when there's input
    if (value) {
      setIsValid(validateApiKey(value));
    } else {
      setIsValid(null);
    }
    
    // Clear any previous errors
    if (error) setError('');
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!isValid) {
      setError('Please enter a valid API key');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Simulate API call to validate the key
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If we get here, the key is valid
      onApiKeySaved(provider.id, apiKey);
      if (onOpenChange) {
        onOpenChange(false);
      }
      toast.success(`${provider.name} API key saved successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate API key';
      setError(errorMessage);
      toast.error(`Failed to save API key: ${errorMessage}`);
      console.error('API key validation failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
    if (!open) {
      // Reset state when closing
      setApiKey(initialApiKey);
      setError('');
      setIsValid(initialApiKey ? validateApiKey(initialApiKey) : null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Key className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" className="w-full mt-2">
            <Key className="mr-2 h-4 w-4" />
            Add API Key
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {provider.name} API Key</DialogTitle>
          <DialogDescription>
            Enter your {provider.name} API key to start using the service.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={isValid ? 'text' : 'password'}
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder={`Enter your ${provider.name} API key`}
                className={`pr-10 ${error ? 'border-red-500' : ''}`}
              />
              {apiKey && (
                <div className="absolute right-2 top-2.5">
                  {isValid ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !isValid}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save API Key'}
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!apiKey.trim() || isSaving || isValid === false}
          >
            {isSaving ? 'Saving...' : 'Save API Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
