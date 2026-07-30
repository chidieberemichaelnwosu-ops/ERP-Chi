import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { DailySales } from './components/DailySales';
import { ProductList } from './components/Products/ProductList';
import { InventoryManager } from './components/Inventory/InventoryManager';
import { PurchasesManager } from './components/Purchases/PurchasesManager';
import { CustomerManager } from './components/Customers/CustomerManager';
import { ExpenseTracker } from './components/Expenses/ExpenseTracker';
import { ReportsAnalytics } from './components/Reports/ReportsAnalytics';
import { SettingsView } from './components/Settings/SettingsView';
import { TransactionsView } from './components/Transactions/TransactionsView';
import { MoreMenu } from './components/MoreMenu';
import { NotificationsModal } from './components/NotificationsModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <DailySales />;
      case 'inventory':
        return <ProductList />;
      case 'purchases':
        return <PurchasesManager />;
      case 'customers':
        return <CustomerManager />;
      case 'expenses':
        return <ExpenseTracker />;
      case 'transactions':
        return <TransactionsView />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SettingsView />;
      case 'more':
        return <MoreMenu />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white transition-colors">
      <Header />
      <main className="transition-all duration-150">
        {renderTabContent()}
      </main>
      <BottomNav />
      <NotificationsModal />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
