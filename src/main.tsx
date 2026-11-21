import { Component, StrictMode } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Workspace render failed.', error, info);
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>The workspace could not be displayed.</h1>
        <p>Reload to restart the synthetic demo.</p>
        <button className="button button-primary" onClick={() => window.location.reload()}>
          Reload workspace
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('The application root element was not found.');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
