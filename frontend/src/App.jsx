// InvestoMart App Configuration
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import UserDashboard from './components/UserDashboard/UserDashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import BroadcastNotification from './components/Admin/BroadcastNotification';
import AdminApprovalPanel from './components/Admin/ApprovalPanel/AdminApprovalPanel';
import PlatformAnalytics from './components/Analytics/PlatformAnalytics';
import BuyStocksPage from './components/BuyStocks/BuyStocksPage';
import SellStocksPage from './components/SellStocks/SellStocksPage';
import FarmAnalysisPage from './components/SellStocks/FarmAnalysis/FarmAnalysisPage';
import UserProfilePage from './components/UserProfile/UserProfilePage';
import VideoSurveillancePage from './components/VideoSurveillance/VideoSurveillancePage';
import HealthRecordsPage from './components/HealthRecords/HealthRecordsPage';
import Dashboard1 from './components/Dashboard1';
import Dashboard2 from './components/Dashboard2';
import ChatbotPage from './components/Chatbot/ChatbotPage';
import SettingsPage from './components/Settings/SettingsPage';
import WithdrawPage from './components/Withdraw/WithdrawPage';
import LegalDoc1 from './components/Information/DocTerms';
import LegalDoc2 from './components/Information/DocPrivacy';
import LegalDoc3 from './components/Information/DocCookies';
import Navbar from './components/Navbar';
import MainLayout from './components/Layout/MainLayout';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthDrawer from './components/Auth/AuthDrawer';
import LoginPage from './components/Auth/LoginPage';
import SearchPage from './components/Search/SearchPage';
import ItemDetailsPage from './components/Search/ItemDetailsPage';
import CheckoutPage from './components/Checkout/CheckoutPage';
import './App.css';

const AppContent = () => {
  const { isDrawerOpen, closeDrawer, login } = useAuth();

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id" element={<ProtectedRoute><ItemDetailsPage type="product" /></ProtectedRoute>} />
        <Route path="/livestock/:id" element={<ProtectedRoute><ItemDetailsPage type="livestock" /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

        {/* Protected Routes */}
        <Route path="/userdashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/buy-stocks" element={<ProtectedRoute><BuyStocksPage /></ProtectedRoute>} />
        <Route path="/sell-stocks" element={<ProtectedRoute><SellStocksPage /></ProtectedRoute>} />
        <Route path="/farm-analysis" element={<ProtectedRoute><FarmAnalysisPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/surveillance" element={<ProtectedRoute><VideoSurveillancePage /></ProtectedRoute>} />
        <Route path="/health-records" element={<ProtectedRoute><HealthRecordsPage /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard1 /></ProtectedRoute>} />
        <Route path="/dashboard2" element={<ProtectedRoute><Dashboard2 /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />

        <Route path="/terms" element={<LegalDoc1 />} />
        <Route path="/privacy" element={<LegalDoc2 />} />
        <Route path="/cookies" element={<LegalDoc3 />} />

        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-broadcast" element={<ProtectedRoute><BroadcastNotification /></ProtectedRoute>} />
        <Route path="/admin-approvals" element={<ProtectedRoute><AdminApprovalPanel /></ProtectedRoute>} />
        <Route path="/platform-analytics" element={<ProtectedRoute><PlatformAnalytics /></ProtectedRoute>} />
      </Routes>

      {/* Global Auth Drawer */}
      <AuthDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onLoginSuccess={(user, token) => login(user, token)}
      />
    </MainLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <SearchProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </SearchProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
