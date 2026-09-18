"use client";

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-surface, #0f172a)',
          color: 'var(--color-text, #f8fafc)',
          border: '1px solid var(--color-border, #334155)',
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
        },
        success: {
          duration: 3500,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        },
      }}
    />
  );
}
