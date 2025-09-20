import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { config } from './config/wagmi';
import Header from './components/Header';
import MarketList from './components/MarketList';
import CreateMarket from './components/CreateMarket';
import { ThemeProvider, useTheme } from './components/ThemeProvider';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function AppContent() {
  const { isDark } = useTheme();
  
  return (
    <RainbowKitProvider
      theme={isDark ? darkTheme() : lightTheme()}
      showRecentTransactions={true}
    >
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <Header />
        <main className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="space-y-8">
            <div className="space-y-4 text-center">
              <h1 className={`text-4xl md:text-6xl font-bold bg-gradient-to-r ${
                isDark 
                  ? 'from-purple-400 via-pink-300 to-blue-300' 
                  : 'from-purple-600 via-pink-600 to-blue-600'
              } bg-clip-text text-transparent`}>
                PredictMarket
              </h1>
              <p className={`text-lg md:text-xl ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              } max-w-2xl mx-auto`}>
                Stake on future outcomes with crypto. Make predictions, earn rewards, 
                and help discover the truth through market wisdom.
              </p>
            </div>
            
            <CreateMarket />
            <MarketList />
          </div>
        </main>
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900',
            duration: 4000,
          }}
        />
      </div>
    </RainbowKitProvider>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;