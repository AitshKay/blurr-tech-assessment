// src/components/ai/chat/components/ApiKeyDialog.tsx
import { useState } from 'react';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  isLoading: boolean;
  providerName: string;
}

export function ApiKeyDialog({
  isOpen,
  onClose,
  onSave,
  isLoading,
  providerName,
}: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Enter {providerName} API Key</h2>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={`Enter your ${providerName} API key`}
          className="w-full p-2 border rounded mb-4"
          disabled={isLoading}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(apiKey)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading || !apiKey.trim()}
          >
            {isLoading ? 'Saving...' : 'Save & Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}