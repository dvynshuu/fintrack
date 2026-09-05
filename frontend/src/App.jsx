import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CommandPalette from './components/layout/CommandPalette';
import TransferModal from './components/modals/TransferModal';
import SubscriptionsModal from './features/subscriptions/SubscriptionsModal';
import ScenarioLabModal from './features/planning/ScenarioLabModal';
import WhatChangedModal from './components/modals/WhatChangedModal';
import NetWorthModal from './features/analytics/NetWorthModal';
import AskFinTrackDrawer from './components/layout/AskFinTrackDrawer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { InsightsProvider } from './contexts/InsightsContext';
import './App.css';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ExpenseProvider>
            <InsightsProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </InsightsProvider>
          </ExpenseProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const showFooter = !isAuthPage && pathname !== '/profile';

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAskDrawerOpen, setIsAskDrawerOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [isScenarioLabOpen, setIsScenarioLabOpen] = useState(false);
  const [isWhatChangedOpen, setIsWhatChangedOpen] = useState(false);
  const [isNetWorthOpen, setIsNetWorthOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="layout-connected">
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAskFinTrack={() => setIsAskDrawerOpen(true)}
      />

      <main className={`main-content ${isAuthPage ? 'is-auth' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard
                  onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
                  onOpenScenarioLab={() => setIsScenarioLabOpen(true)}
                  onOpenWhatChanged={() => setIsWhatChangedOpen(true)}
                  onOpenNetWorth={() => setIsNetWorthOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>

      {showFooter && <Footer />}

      <MobileBottomNav
        onOpenAskFinTrack={() => setIsAskDrawerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Global Modals & Intelligence Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenTransfer={() => setIsTransferModalOpen(true)}
        onOpenAskFinTrack={() => setIsAskDrawerOpen(true)}
        onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
        onOpenScenarioLab={() => setIsScenarioLabOpen(true)}
        onOpenWhatChanged={() => setIsWhatChangedOpen(true)}
        onOpenNetWorth={() => setIsNetWorthOpen(true)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <SubscriptionsModal
        isOpen={isSubscriptionsOpen}
        onClose={() => setIsSubscriptionsOpen(false)}
      />

      <ScenarioLabModal
        isOpen={isScenarioLabOpen}
        onClose={() => setIsScenarioLabOpen(false)}
      />

      <WhatChangedModal
        isOpen={isWhatChangedOpen}
        onClose={() => setIsWhatChangedOpen(false)}
      />

      <NetWorthModal
        isOpen={isNetWorthOpen}
        onClose={() => setIsNetWorthOpen(false)}
      />

      <AskFinTrackDrawer
        isOpen={isAskDrawerOpen}
        onClose={() => setIsAskDrawerOpen(false)}
      />
    </div>
  );
};

export default App;