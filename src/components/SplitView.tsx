// ==========================================
// SplitView Component
// ==========================================
// Reusable split-view layout for list + detail pattern
// Used in Cases page for console-style workflow

import type { ReactNode } from 'react';

interface SplitViewProps {
  /** Left panel - typically a list with filters */
  listPanel: ReactNode;
  /** Right panel - typically a detail/preview */
  detailPanel: ReactNode;
  /** Width ratio of list panel (default 40%) */
  listWidth?: string;
  /** Custom class name */
  className?: string;
}

export function SplitView({ 
  listPanel, 
  detailPanel, 
  listWidth = '40%',
  className = ''
}: SplitViewProps) {
  return (
    <div className={`split-view ${className}`}>
      <div 
        className="split-view-list" 
        style={{ width: listWidth, minWidth: '300px', maxWidth: '500px' }}
      >
        {listPanel}
      </div>
      <div className="split-view-detail">
        {detailPanel}
      </div>
    </div>
  );
}
