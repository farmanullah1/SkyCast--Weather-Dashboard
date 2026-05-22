import React from 'react';
import { motion } from 'framer-motion';
import { Github as GithubIcon, Linkedin as LinkedinIcon, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="app-footer glass-card"
    >
      <div className="footer-content">
        <div className="dev-info">
          <span className="dev-name">Farmanullah Ansari</span>
          <span className="dev-title">Full Stack Software Engineer</span>
        </div>
        
        <div className="footer-links">
          <a href="https://farmanullah1.github.io/My-Portfolio" target="_blank" rel="noopener noreferrer" className="footer-link">
            <ExternalLink size={18} />
            <span>Portfolio</span>
          </a>
          <a href="https://www.linkedin.com/in/farmanullah-ansari/" target="_blank" rel="noopener noreferrer" className="footer-link">
            <LinkedinIcon size={18} />
            <span>LinkedIn</span>
          </a>
          <a href="https://github.com/farmanullah1" target="_blank" rel="noopener noreferrer" className="footer-link">
            <GithubIcon size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SkyCast Weather Dashboard. All rights reserved.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;
