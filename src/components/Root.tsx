import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { ChatBox } from './chat-box';
import { Menu, X, CalendarCheck } from 'lucide-react';
import { AdminPage } from './admin-page';

export function Root() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.substring(1) || 'home';

  // Admin page keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminPage(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path === 'home' ? '/' : `/${path}`);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServicesClick = () => {
    navigate('/');
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
                    currentPath === 'home'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigate('about')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPath === 'about'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => handleNavigate('schedule')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPath === 'schedule'
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
                    currentPath === 'preparation'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  Preparation
                </button>
                <button
                  onClick={() => handleNavigate('references')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPath === 'references'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  References
                </button>
                <button
                  onClick={() => handleNavigate('faq')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPath === 'faq'
                      ? 'bg-emerald-400/20 text-emerald-300 border-l-4 border-emerald-400'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => handleNavigate('debrief-digest')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    currentPath === 'debrief-digest'
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
        {showAdminPage ? (
          <AdminPage onLogout={() => setShowAdminPage(false)} />
        ) : (
          <Outlet />
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