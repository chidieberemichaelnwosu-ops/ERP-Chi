import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { supabase } from './supabaseClient';
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
import { AuthModal } from './components/Auth/AuthModal';
import { PendingApprovalsModal } from './components/PendingApprovals/PendingApprovalsModal';
import { BusinessProfileGuard } from './components/Settings/BusinessProfileGuard';
import { LogoutConfirmationModal } from './components/Auth/LogoutConfirmationModal';
import { ChangePasswordModal } from './components/Auth/ChangePasswordModal';
import { UserProfileModal } from './components/Auth/UserProfileModal';

// Auth Flow Screens
import { SplashScreen } from './components/Auth/SplashScreen';
import { SignInPage } from './components/Auth/SignInPage';
import { SignUpPage } from './components/Auth/SignUpPage';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { PendingApprovalPage } from './components/Auth/PendingApprovalPage';
import { SuspendedAccountPage } from './components/Auth/SuspendedAccountPage';
import { RejectedAccountPage } from './components/Auth/RejectedAccountPage';

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
      <AuthModal />
      <PendingApprovalsModal />
      <BusinessProfileGuard />
      <LogoutConfirmationModal />
      <ChangePasswordModal />
      <UserProfileModal />
    </div>
  );
};

const AppNavigationGuard: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    settings,
    currentUser,
    pendingUserReg,
    setPendingUserReg,
  } = useApp();

  // Protect private pages with supabase.auth.getSession()
  useEffect(() => {
    if (currentRoute === 'app') {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error || !session) {
          setCurrentRoute('login');
        }
      }).catch(() => {
        setCurrentRoute('login');
      });
    }
  }, [currentRoute, setCurrentRoute]);

  // 1. Splash Screen
  if (currentRoute === 'splash') {
    return <SplashScreen businessName={settings.businessName} />;
  }

  // 2. Sign In Page
  if (currentRoute === 'login') {
    return (
      <SignInPage
        onNavigateToSignUp={() => setCurrentRoute('register')}
        onNavigateToForgotPassword={() => setCurrentRoute('forgot-password')}
        onLoginSuccess={() => setCurrentRoute('app')}
      />
    );
  }

  // 3. Sign Up Page
  if (currentRoute === 'register') {
    return (
      <SignUpPage
        onNavigateToSignIn={() => setCurrentRoute('login')}
        onSignUpSuccess={(data) => {
          setPendingUserReg(data);
          setCurrentRoute('pending-approval');
        }}
      />
    );
  }

  // 4. Forgot Password Page
  if (currentRoute === 'forgot-password') {
    return <ForgotPasswordPage onBackToLogin={() => setCurrentRoute('login')} />;
  }

  // 5. Pending Approval Page
  if (currentRoute === 'pending-approval') {
    return (
      <PendingApprovalPage
        onBackToLogin={() => setCurrentRoute('login')}
        pendingUser={pendingUserReg}
      />
    );
  }

  // 6. Suspended Account Page
  if (currentRoute === 'suspended') {
    return (
      <SuspendedAccountPage
        onBackToLogin={() => setCurrentRoute('login')}
        userName={currentUser?.fullName}
      />
    );
  }

  // 7. Rejected Account Page
  if (currentRoute === 'rejected') {
    return (
      <RejectedAccountPage
        onBackToLogin={() => setCurrentRoute('login')}
        userName={currentUser?.fullName}
      />
    );
  }

  // 8. Protected Dashboard / App Layout
  // Guard check: if unauthenticated, fallback to SignInPage
  if (!currentUser || currentUser.status !== 'active') {
    return (
      <SignInPage
        onNavigateToSignUp={() => setCurrentRoute('register')}
        onNavigateToForgotPassword={() => setCurrentRoute('forgot-password')}
        onLoginSuccess={() => setCurrentRoute('app')}
      />
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppNavigationGuard />
    </AppProvider>
  );
}
