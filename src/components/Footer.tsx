import React from 'react';
import { Github } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-amber-400 font-medium text-center md:text-left">
              The Gold Price Predictor
            </p>
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-sm">Data Updated Daily.</p>
            <div className="h-4 w-px bg-gray-700"></div>
            <a href="https://github.com/krishang118" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-amber-400 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;