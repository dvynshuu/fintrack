import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>FinTrack</h3>
          <p>
            Your personal finance companion. Track expenses, manage income, and achieve your financial goals with ease.
            Take control of your financial future today.
          </p>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/expenses">Expenses</Link></li>
            <li><Link to="/income">Income</Link></li>
            <li><Link to="/goals">Goals</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-section faq">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-item">
            <h4>How secure is my financial data?</h4>
            <p>We use industry-standard encryption and security measures to protect your data. Your information is never shared with third parties.</p>
          </div>
          <div className="faq-item">
            <h4>Can I export my financial data?</h4>
            <p>Yes, you can export your data in various formats including CSV and PDF for your records.</p>
          </div>
          <div className="faq-item">
            <h4>Is FinTrack free to use?</h4>
            <p>We offer both free and premium plans. The free plan includes basic features, while premium plans offer advanced analytics and features.</p>
          </div>
        </div>

        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Have questions? We're here to help!</p>
          <ul>
            <li>Email: support@fintrack.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Finance Street, Money City, MC 12345</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
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