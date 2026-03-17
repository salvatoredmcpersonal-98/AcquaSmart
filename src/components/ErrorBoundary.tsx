import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-zinc-800 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-4">Ops! Qualcosa è andato storto.</h1>
            <p className="text-white/60 mb-6">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina o torna alla dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ricarica Pagina
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-6 p-4 bg-black/50 rounded-lg text-left text-xs text-red-400 overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
