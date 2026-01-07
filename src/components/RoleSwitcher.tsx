// ==========================================
// Role Switcher Component for Demo
// ==========================================

import { useAppStore } from '../store/useAppStore';
import { 
  User, 
  Shield, 
  Headphones, 
  Briefcase, 
  Megaphone, 
  Scale, 
  Settings,
  Building2,
  ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Role } from '../types';

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof User; color: string }> = {
  DIRECTOR: { label: 'Director', icon: Building2, color: '#6366f1' },
  SUPERVISOR: { label: 'Supervisor', icon: Shield, color: '#8b5cf6' },
  AGENT: { label: 'Agent', icon: Headphones, color: '#06b6d4' },
  RM: { label: 'Relationship Manager', icon: Briefcase, color: '#10b981' },
  MARKETING: { label: 'Marketing', icon: Megaphone, color: '#f59e0b' },
  COMPLIANCE: { label: 'Compliance', icon: Scale, color: '#ef4444' },
  ADMIN: { label: 'Admin', icon: Settings, color: '#64748b' },
};

export function RoleSwitcher() {
  const { currentUser, users, switchRole, branches } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const roleConfig = ROLE_CONFIG[currentUser.role];
  const RoleIcon = roleConfig.icon;
  const branch = currentUser.branch_id 
    ? branches.find(b => b.id === currentUser.branch_id)
    : null;

  return (
    <div className="role-switcher" ref={dropdownRef}>
      <button
        className="role-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ '--role-color': roleConfig.color } as React.CSSProperties}
      >
        <div className="role-avatar" style={{ backgroundColor: roleConfig.color }}>
          <RoleIcon size={18} />
        </div>
        <div className="role-info">
          <span className="role-name">{currentUser.name}</span>
          <span className="role-label">{roleConfig.label}</span>
          {branch && <span className="role-branch">{branch.name}</span>}
        </div>
        <ChevronDown size={16} className={`role-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="role-dropdown">
          <div className="role-dropdown-header">
            <span>Switch Role (Demo)</span>
          </div>
          {users.map(user => {
            const config = ROLE_CONFIG[user.role];
            const Icon = config.icon;
            const userBranch = user.branch_id 
              ? branches.find(b => b.id === user.branch_id)
              : null;
            const isActive = user.id === currentUser.id;

            return (
              <button
                key={user.id}
                className={`role-dropdown-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  switchRole(user.id);
                  setIsOpen(false);
                }}
                style={{ '--role-color': config.color } as React.CSSProperties}
              >
                <div className="role-avatar small" style={{ backgroundColor: config.color }}>
                  <Icon size={14} />
                </div>
                <div className="role-dropdown-info">
                  <span className="role-dropdown-name">{user.name}</span>
                  <span className="role-dropdown-label">
                    {config.label}
                    {userBranch && ` • ${userBranch.code}`}
                  </span>
                </div>
                {isActive && <span className="role-active-badge">Active</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
