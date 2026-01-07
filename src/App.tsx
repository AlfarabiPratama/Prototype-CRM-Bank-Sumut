// ==========================================
// CRM Bank Sumut - Main App
// ==========================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  DashboardPage,
  CustomersPage,
  CustomerDetailPage,
  CasesPage,
  CaseDetailPage,
  MarketingPage,
  SalesPage,
  AuditPage,
  AdminPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
