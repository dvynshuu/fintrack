import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer footer-animate-in">
      <div className="footer-pattern"></div>
      <div className="footer-glow-center"></div>

      <div className="footer-content">
        <div className="footer-section about">
          <div className="footer-brand">
            <img src={logo} alt="FinTrack Logo" className="footer-logo" />
            <h3>FinTrack</h3>
          </div>
          <p>
            The benchmark for personal financial control. Track, analyze, and optimize your wealth with institutional-grade clarity.
          </p>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Platform</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/expenses">Expenses</Link></li>
            <li><Link to="/income">Income</Link></li>
            <li><Link to="/goals">Goals</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-section faq">
          <h3>Knowledge Base</h3>
          <div className="faq-item">
            <h4>How secure is my data?</h4>
            <p>We apply bank-level encryption to ensure your financial footprint remains private and protected.</p>
          </div>
          <div className="faq-item">
            <h4>Can I export my reports?</h4>
            <p>Yes. Institutional-grade data portability is built-in; export to CSV or PDF at any time.</p>
          </div>
        </div>

        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Expert support is only a message away.</p>
          <ul>
            <li>Email: support@fintrack.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Finance Street, MC 12345</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FinTrack. Engineered for financial clarity.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};


export default Footer; 