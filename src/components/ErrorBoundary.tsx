import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-2xl text-center ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <AlertTriangle className={`h-16 w-16 mx-auto mb-4 ${
          isDark ? 'text-red-400' : 'text-red-500'
        }`} />
        <h2 className={`text-2xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Something went wrong
        </h2>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        <button
          onClick={() => {
            onReset();
            window.location.reload();
          }}
          className={`flex items-center justify-center space-x-2 w-full py-3 px-6 rounded-xl font-medium transition-all ${
            isDark 
              ? 'bg-purple-600 hover:bg-purple-500 text-white' 
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh Page</span>
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;