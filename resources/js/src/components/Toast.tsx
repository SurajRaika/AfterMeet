import React from 'react';

interface ToastProps {
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

export function Toast({ toastMessage, setToastMessage }: ToastProps) {
  if (!toastMessage) return null;

  return (
    <div className="bg-neutral-950 text-white px-4 py-1.5 text-[10px] flex justify-between items-center shrink-0">
      <span>{toastMessage}</span>
      <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white font-bold">✕</button>
    </div>
  );
}
