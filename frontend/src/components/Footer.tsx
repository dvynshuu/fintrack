import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import Logo from './Logo';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-gradient-border" />

      <div className="footer-content">
        <div className="footer-section footer-about">
          <div className="footer-brand">
            <Logo size={24} />
            <span className="footer-wordmark">BudgetRoot</span>
          </div>
          <p>
            Root your wealth with BudgetRoot. Institutional-grade zero-based budgeting, net worth tracking, and intelligent cash flow analytics built for everyday financial freedom.
          </p>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Tools & Methodology</h3>
          <ul>
            <li><Link to="/calculator">Free Budget Calculator</Link></li>
            <li><Link to="/compare/ynab-alternative">YNAB Alternative ($0)</Link></li>
            <li><Link to="/methodology/zero-based-budgeting">Zero-Based Budget System</Link></li>
            <li><Link to="/security">Security & Data Sovereignty</Link></li>
            <li><Link to="/expenses">Expense Tracking</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Allied Ecosystem</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #9CA3AF)', marginBottom: '0.5rem' }}>
            Privacy-first partners for intentional, aligned living:
          </p>
          <ul className="footer-ecosystem-list">
            <li>
              <a
                href="https://getrealign.in"
                target="_blank"
                rel="noopener"
                className="footer-partner-anchor"
              >
                ReAlign (getrealign.in) ↗
              </a>
              <span className="footer-partner-caption">
                Private emotional wellness & mood journaling to reframe impulse spending.
              </span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Integrity & Trust</h3>
          <div className="faq-item">
            <h4>Is my data private and secure?</h4>
            <p>Yes. Bank-grade tokenization and zero data monetization. <Link to="/security" style={{ color: 'var(--accent, #10B981)', textDecoration: 'underline' }}>Read Security</Link></p>
          </div>
          <div className="faq-item">
            <h4>Data Portability & Support</h4>
            <p>1-click CSV export anytime. Inquiries: support@budgetroot.com</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BudgetRoot. Built for everyday financial sovereignty.</p>
        <div className="footer-bottom-links">
          <Link to="/security">Security</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/methodology/zero-based-budgeting">Methodology</Link>
          <Link to="/compare/ynab-alternative">Comparison</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
