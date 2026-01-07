// ==========================================
// Loading Components
// Spinner, Skeleton, and Loading overlays
// ==========================================

import { Loader2 } from 'lucide-react';

// === Spinner ===
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 40,
  };

  return (
    <Loader2 
      size={sizeMap[size]} 
      className={`spinner ${className}`}
    />
  );
}

// === Full Page Loading ===
interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Memuat...' }: PageLoadingProps) {
  return (
    <div className="page-loading">
      <Spinner size="lg" />
      <p>{message}</p>
    </div>
  );
}

// === Skeleton Card ===
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>
    </div>
  );
}

// === Skeleton List ===
interface SkeletonListProps {
  count?: number;
}

export function SkeletonList({ count = 3 }: SkeletonListProps) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// === Skeleton Profile ===
export function SkeletonProfile() {
  return (
    <div className="skeleton-profile">
      <div className="skeleton-header">
        <div className="skeleton skeleton-avatar large" />
        <div className="skeleton-header-info">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text short" />
        </div>
      </div>
      <div className="skeleton-grid">
        <div className="skeleton-card-wrapper">
          <div className="skeleton skeleton-card-full" />
        </div>
        <div className="skeleton-card-wrapper">
          <div className="skeleton skeleton-card-full" />
        </div>
      </div>
    </div>
  );
}

// === Inline Loading ===
interface InlineLoadingProps {
  text?: string;
}

export function InlineLoading({ text = 'Memuat...' }: InlineLoadingProps) {
  return (
    <span className="inline-loading">
      <Spinner size="sm" />
      <span>{text}</span>
    </span>
  );
}

// === Button Loading State ===
interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className = '', 
  disabled = false,
  onClick 
}: LoadingButtonProps) {
  return (
    <button 
      className={`btn ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}

// === Empty State ===
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
