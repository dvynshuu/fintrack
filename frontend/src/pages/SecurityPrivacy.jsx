import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  ShieldCheck,
  Lock,
  Database,
  Download,
  KeyRound,
  FileCheck,
  ArrowRight,
  EyeOff
} from 'lucide-react';
import './SecurityPrivacy.css';

const PILLARS = [
  {
    icon: <EyeOff size={24} />,
    title: 'Zero Data Commercialization',
    desc: 'BudgetRoot does not sell, rent, or monetize your transaction data, purchase history, or net worth balances to credit rating bureaus, loan advertisers, or brokers. Your financial life remains strictly your own.'
  },
  {
    icon: <Lock size={24} />,
    title: 'Cryptographic Security & Tokens',
    desc: 'All sessions are authenticated via industry-standard cryptographically signed JSON Web Tokens (JWT) using SHA-256 signatures, while sensitive credentials undergo salt-rounds bcrypt hashing with constant-time verification.'
  },
  {
    icon: <Database size={24} />,
    title: 'Integer-Minor Ledger Arithmetic',
    desc: 'Financial integrity begins with mathematical precision. BudgetRoot rejects floating-point math in favor of minor-unit integer accounting (cents/paise), eliminating floating-point calculation drift across all balance sheets.'
  },
  {
    icon: <Download size={24} />,
    title: 'Full Data Sovereignty & Portability',
    desc: 'You are never trapped in a proprietary walled garden. Export your complete transaction register, account balances, and categorizations to standard CSV at any moment with a single click.'
  }
];

const SecurityPrivacy = () => {
  return (
    <div className="security-page">
      {/* ══ HEADER ══ */}
      <header className="security-header">
        <div className="security-container">
          <div className="security-eyebrow">
            <span>[TRUST_&_SECURITY // E-E-A-T_STANDARDS]</span>
          </div>
          <h1 className="security-title">
            Institutional Security & Data Sovereignty
          </h1>
          <p className="security-subtitle">
            Finance demands verifiable security, not marketing slogans. Discover how BudgetRoot protects your personal ledger with zero commercial data monetization and bank-grade tokenization.
          </p>
        </div>
      </header>

      {/* ══ CORE PILLARS ══ */}
      <section className="security-pillars-section">
        <div className="security-container">
          <div className="pillars-grid">
            {PILLARS.map((p, idx) => (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon-wrap">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON VS AD-SUPPORTED BUDGET APPS ══ */}
      <section className="security-contrast-section">
        <div className="security-container">
          <div className="contrast-box">
            <h2>The "Free App" Privacy Paradox</h2>
            <p className="contrast-intro">
              When standard consumer budgeting apps offer "free" services, they frequently monetize by selling anonymized spending trends to hedge funds or pitching credit cards based on your spending weaknesses.
            </p>

            <div className="contrast-table-wrap">
              <table className="contrast-table">
                <thead>
                  <tr>
                    <th>Security Vector</th>
                    <th>BudgetRoot Architecture</th>
                    <th>Ad-Driven Apps (Mint, etc.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Business Model</strong></td>
                    <td className="root-cell">Zero ads, zero data broker feeds</td>
                    <td>Lead generation & credit card commissions</td>
                  </tr>
                  <tr>
                    <td><strong>Transaction Tracking</strong></td>
                    <td className="root-cell">Confidential to your private account</td>
                    <td>Scraped for targeted advertising</td>
                  </tr>
                  <tr>
                    <td><strong>Data Export</strong></td>
                    <td className="root-cell">100% Unrestricted CSV export anytime</td>
                    <td>Restricted or rate-limited export</td>
                  </tr>
                  <tr>
                    <td><strong>Mathematical Auditability</strong></td>
                    <td className="root-cell">Deterministic integer minor accounting</td>
                    <td>Client-side float rounding approximations</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CALL TO ACTION ══ */}
      <section className="security-cta-section">
        <div className="security-container">
          <div className="security-cta-box">
            <h2>Experience Private Financial Management</h2>
            <p>
              Set up your secure personal ledger in under 60 seconds without giving away your privacy.
            </p>
            <div className="security-cta-actions">
              <Link to="/register" className="btn-security-primary">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/compare/ynab-alternative" className="btn-security-secondary">
                View Feature Comparison
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityPrivacy;
