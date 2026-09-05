import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-gradient-border" />

      <div className="footer-content">
        <div className="footer-section footer-about">
          <div className="footer-brand">
            <Logo size={24} />
            <span className="footer-wordmark">FinTrack</span>
          </div>
          <p>
            Smart, simple personal finance for everyone. Track spending, save more, and reach your financial goals with total peace of mind.
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
          <h3>Explore</h3>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/expenses">Expenses</Link></li>
            <li><Link to="/income">Income</Link></li>
            <li><Link to="/goals">Savings Goals</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Help & FAQs</h3>
          <div className="faq-item">
            <h4>Is my data private and secure?</h4>
            <p>Yes. Bank-grade encryption ensures only you have access to your finances.</p>
          </div>
          <div className="faq-item">
            <h4>Can I export my data?</h4>
            <p>Yes — export your transactions to CSV at any time with one click.</p>
          </div>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>We're here to help whenever you need a hand.</p>
          <ul>
            <li>support@fintrack.com</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Finance Street, MC 12345</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FinTrack. Built for everyday financial freedom.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;