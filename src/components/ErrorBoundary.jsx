import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Logged to the browser console so it's still visible during development/debugging
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-6">
              An unexpected error occurred. This has been logged. You can try returning to the
              dashboard.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
