// src/components/ai/chat/components/ProviderSelector.tsx
import { ProviderConfig } from '@/types/ai-provider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Loader2 } from 'lucide-react';

interface ProviderSelectorProps {
  providers: ProviderConfig[];
  selectedProvider: ProviderConfig;
  onProviderChange: (providerId: string) => void;
  isLoading: boolean;
  onApiKeyClick: () => void;
  showApiKeyButton: boolean;
}

export function ProviderSelector({
  providers,
  selectedProvider,
  onProviderChange,
  isLoading,
  onApiKeyClick,
  showApiKeyButton = false,
}: ProviderSelectorProps) {
  const isFreeProvider = selectedProvider.models.some(model => model.isFree);

  return (
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="w-48">
            <Select
              value={selectedProvider.id}
              onValueChange={onProviderChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      {provider.name}
                      {provider.models.some(m => m.isFree) && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {!isFreeProvider && showApiKeyButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onApiKeyClick}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Set API Key
                </>
              )}
            </Button>
          )}
          
          {isFreeProvider && (
            <span className="text-xs text-muted-foreground">
              No API key required for {selectedProvider.name}
            </span>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {selectedProvider.models[0]?.name} • {selectedProvider.models[0]?.contextWindow.toLocaleString()} tokens
        </div>
      </div>
    </div>
  );
}