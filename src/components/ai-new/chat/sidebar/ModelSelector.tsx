import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModelStore, type AIModel } from '../../stores/modelStore';

// Extend AIModel to include our additional properties
interface Model extends AIModel {
  contextWindow?: number;
  maxTokens?: number;
}

// Type guard to check if a model has contextWindow and maxTokens
function hasTokenInfo(model: AIModel | Model): model is Model & { contextWindow: number; maxTokens: number } {
  return 'contextWindow' in model && 'maxTokens' in model;
}

interface ModelSelectorProps {
  providerId: string;
  selectedModelId?: string;
  onSelectModel: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({
  providerId,
  selectedModelId,
  onSelectModel,
  className = '',
}: ModelSelectorProps) {
  const models = useModelStore((state) => state.getProviderModels(providerId));
  const defaultModel = useModelStore((state) => state.getDefaultModel(providerId));
  
  const selectedModel = useMemo(() => {
    return selectedModelId 
      ? models.find((m) => m.id === selectedModelId) 
      : defaultModel || models[0];
  }, [models, selectedModelId, defaultModel]);

  if (models.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No models available for this provider
      </div>
    );
  }

  return (
    <div className={className}>
      <Select
        value={selectedModel?.id}
        onValueChange={onSelectModel}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col">
                <span>{model.name}</span>
                {hasTokenInfo(model) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {model.contextWindow > 0 && (
                      <>
                        <span>Context: {model.contextWindow.toLocaleString()} tokens</span>
                        <span>•</span>
                      </>
                    )}
                    {model.maxTokens > 0 && (
                      <span>Max: {model.maxTokens.toLocaleString()} tokens</span>
                    )}
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedModel && hasTokenInfo(selectedModel) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {selectedModel.contextWindow && selectedModel.contextWindow > 0 && (
            <div className="flex items-center justify-between">
              <span>Context Window:</span>
              <span className="font-medium">
                {selectedModel.contextWindow.toLocaleString()} tokens
              </span>
            </div>
          )}
          {selectedModel.maxTokens && selectedModel.maxTokens > 0 && (
            <div className="flex items-center justify-between">
              <span>Max Tokens:</span>
              <span className="font-medium">
                {selectedModel.maxTokens.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
