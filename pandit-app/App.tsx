import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';

// Load i18n translation configuration
import './src/locales/i18n';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100% !important;
      overflow: hidden !important;
      margin: 0;
      padding: 0;
    }
    #root > div {
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
  `;
  document.head.appendChild(style);
}

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
