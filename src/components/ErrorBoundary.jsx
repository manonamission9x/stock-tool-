import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--red)', marginBottom: 8, fontSize: 16 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 12, fontFamily: 'var(--font-mono)', maxWidth: 400, margin: '0 auto' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            style={{ marginTop: 16, padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text)', cursor: 'pointer' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
