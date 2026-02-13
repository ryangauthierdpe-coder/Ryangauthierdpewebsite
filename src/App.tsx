import { useState, useEffect } from 'react';
import { HomePage } from './components/home-page';
import { SchedulePage } from './components/schedule-page';
import { PreparationPage } from './components/preparation-page';
import { AboutPage } from './components/about-page';
import { ReferencesPage } from './components/references-page';
import { FAQPage } from './components/faq-page';
import { DebriefDigestPage } from './components/debrief-digest-page';
import { AdminPage } from './components/admin-page';
import { AdminLogin } from './components/admin-login';
import { ChatBox } from './components/chat-box';
import { Menu, X } from 'lucide-react';
import { CalendarCheck } from 'lucide-react';
import logo from 'figma:asset/d0ddd2463241120a30a55bfb7d41b4a075838de5.png';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'schedule' | 'preparation' | 'about' | 'references' | 'faq' | 'debrief-digest' | 'admin'>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if admin session exists on mount
  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Hidden keyboard shortcut to access admin page (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setCurrentPage('admin');
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAdminClick = () => {
    setCurrentPage('admin');
    setIsMenuOpen(false);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_session');
    setIsAdminAuthenticated(false);
    setCurrentPage('home');
  };

  const handleNavigate = (page: 'home' | 'schedule' | 'preparation' | 'about' | 'references' | 'faq' | 'debrief-digest' | 'admin') => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServicesClick = () => {
    setCurrentPage('home');
    setIsMenuOpen(false);
    // Wait for page to render, then scroll to services section
    setTimeout(() => {
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => handleNavigate('home')}
              className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-3"
            >
              <h1 className="text-2xl font-bold tracking-wider font-sans">Ryan Gauthier, DPE</h1>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigate('schedule')}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                aria-label="Schedule Appointment"
              >
                <CalendarCheck className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-16 right-0 w-64 bg-slate-800 shadow-lg rounded-bl-lg border-t-2 border-emerald-400 overflow-hidden">
              <div className="py-2">
                <button
                  onClick={() => handleNavigate('home')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPage === 'home'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigate('about')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPage === 'about'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => handleNavigate('schedule')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPage === 'schedule'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  Schedule
                </button>
                <button
                  onClick={handleServicesClick}
                  className="w-full text-left px-4 py-3 transition-colors text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300"
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavigate('preparation')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPage === 'preparation'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  Preparation
                </button>
                <button
                  onClick={() => handleNavigate('references')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPage === 'references'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  References
                </button>
                <button
                  onClick={() => handleNavigate('faq')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPage === 'faq'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => handleNavigate('debrief-digest')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPage === 'debrief-digest'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  Ryan's Debrief Digest
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>
        {currentPage === 'home' && <HomePage onNavigateToSchedule={() => setCurrentPage('schedule')} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'schedule' && <SchedulePage />}
        {currentPage === 'preparation' && <PreparationPage onNavigateToSchedule={() => setCurrentPage('schedule')} />}
        {currentPage === 'references' && <ReferencesPage />}
        {currentPage === 'faq' && <FAQPage />}
        {currentPage === 'debrief-digest' && <DebriefDigestPage />}
        {currentPage === 'admin' && (
          isAdminAuthenticated ? <AdminPage onLogout={handleAdminLogout} /> : <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
        )}
      </main>

      <ChatBox />

      <footer className="bg-slate-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">© 2026 Designated Pilot Examiner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}