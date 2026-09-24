import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[360px] p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-2xl flex flex-col items-center justify-center text-center backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2 font-display">
            {this.props.fallbackTitle || 'Component Encountered an Issue'}
          </h3>

          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            {this.props.fallbackMessage ||
              'A temporary rendering error occurred in this interactive module. You can reset the component to restore functionality.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset & Try Again</span>
            </button>

            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>

          {/* Technical Diagnostics Details (Collapsible) */}
          {this.state.error && (
            <details className="w-full max-w-lg text-left bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 overflow-hidden">
              <summary className="cursor-pointer font-medium text-amber-400/90 hover:text-amber-300 select-none">
                Technical Diagnostics
              </summary>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded">
                <p className="text-rose-400 font-semibold">{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-slate-500 text-[10px] mt-2 whitespace-pre-wrap leading-tight">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
