// ==========================================
// Error Boundary Component
// Catches JavaScript errors anywhere in child tree
// ==========================================

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <AlertTriangle size={48} />
            <h2>Terjadi Kesalahan</h2>
            <p>Maaf, terjadi kesalahan yang tidak terduga.</p>
            {this.state.error && (
              <details className="error-details">
                <summary>Detail Error</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
            <button className="btn btn-primary" onClick={this.handleRetry}>
              <RefreshCw size={16} />
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
