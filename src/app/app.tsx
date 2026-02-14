'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Home from './page';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TaskProvider>
          <Home />
        </TaskProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
