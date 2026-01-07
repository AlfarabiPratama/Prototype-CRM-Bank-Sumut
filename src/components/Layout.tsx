// ==========================================
// Main Application Layout with Sidebar
// ==========================================

import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Megaphone, 
  TrendingUp,
  ClipboardList,
  Settings,
  Building2
} from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { useAppStore } from '../store/useAppStore';
import { can } from '../lib/policy';

export function Layout() {
  const { currentUser } = useAppStore();

  // Navigation items with role-based visibility
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      visible: can(currentUser, 'view_dashboard'),
    },
    { 
      path: '/customers', 
      label: 'Customers', 
      icon: Users,
      visible: can(currentUser, 'search_customer'),
    },
    { 
      path: '/cases', 
      label: 'Cases', 
      icon: FileText,
      visible: can(currentUser, 'view_case'),
    },
    { 
      path: '/marketing', 
      label: 'Marketing', 
      icon: Megaphone,
      visible: can(currentUser, 'view_campaign'),
    },
    { 
      path: '/sales', 
      label: 'Sales', 
      icon: TrendingUp,
      visible: can(currentUser, 'view_lead'),
    },
    { 
      path: '/audit', 
      label: 'Audit Log', 
      icon: ClipboardList,
      visible: can(currentUser, 'view_audit'),
    },
    { 
      path: '/admin', 
      label: 'Admin', 
      icon: Settings,
      visible: can(currentUser, 'change_rbac'),
    },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Building2 size={28} className="sidebar-logo-icon" />
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">CRM Bank Sumut</span>
            <span className="sidebar-brand-subtitle">Customer 360</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems
            .filter(item => item.visible)
            .map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                  end={item.path === '/'}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>

        <div className="sidebar-footer">
          <RoleSwitcher />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
