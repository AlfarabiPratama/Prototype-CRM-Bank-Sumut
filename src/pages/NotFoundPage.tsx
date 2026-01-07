// ==========================================
// Not Found Page
// ==========================================

import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or you don't have access.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            <span>Go to Dashboard</span>
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary">
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
