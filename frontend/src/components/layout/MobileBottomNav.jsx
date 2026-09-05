import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Sparkles,
  Target,
  Command
} from 'lucide-react';
import './MobileBottomNav.css';

const MobileBottomNav = ({ onOpenAskFinTrack, onOpenCommandPalette }) => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <LayoutDashboard size={19} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/expenses"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Receipt size={19} />
        <span>Expenses</span>
      </NavLink>

      <button
        type="button"
        className="mobile-nav-item ask-trigger"
        onClick={onOpenAskFinTrack}
        aria-label="Ask FinTrack Strategist"
      >
        <div className="ask-sparkle-icon">
          <Sparkles size={18} />
        </div>
        <span>Ask</span>
      </button>

      <NavLink
        to="/goals"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Target size={19} />
        <span>Goals</span>
      </NavLink>

      <button
        type="button"
        className="mobile-nav-item"
        onClick={onOpenCommandPalette}
        aria-label="Open Command Palette"
      >
        <Command size={19} />
        <span>Menu</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
