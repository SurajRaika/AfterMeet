import React from 'react';
import { User } from '../types/crm';

interface HeaderProps {
  currentUser: User;
  onOpenSearch: () => void;
  onOpenActions: () => void;
  onOpenDocumentVault?: () => void;
}

export function Header({ currentUser, onOpenSearch, onOpenActions, onOpenDocumentVault }: HeaderProps) {
  return (
    <header className="h-10 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center space-x-2 w-96">
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2 py-1 text-left text-neutral-500 cursor-pointer transition-colors text-[10.5px]"
        >
          <span>🔍</span>
          <span className="flex-1 text-neutral-400">Search anything...</span>
          <span className="text-[9px] font-mono bg-white border border-neutral-200 px-1 text-neutral-400 rounded-xs">Ctrl K</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {onOpenDocumentVault && (
          <button
            onClick={onOpenDocumentVault}
            className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight cursor-pointer transition-colors"
          >
            <span>📄</span>
            <span>Document Vault</span>
          </button>
        )}

        <button
          onClick={onOpenActions}
          className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight cursor-pointer transition-colors"
        >
          <span>⚡</span>
          <span>Actions</span>
          <span className="text-[8px] font-mono bg-neutral-800 text-neutral-300 px-1 rounded-xs">Ctrl+Shift+K</span>
        </button>

        <span className="text-[9px] bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 text-neutral-600 font-mono">
          CREDENTIALS: <strong className="text-neutral-900">{currentUser.department.toUpperCase()}</strong>
        </span>
      </div>
    </header>
  );
}
