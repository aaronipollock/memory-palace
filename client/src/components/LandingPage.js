import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';
import LoadingSpinner from './LoadingSpinner';
import UserGuide from './UserGuide';
import About from './About';
import { SecureAPIClient, CSRFManager, TokenManager } from '../utils/security';
import './LandingPage.css';
import { getApiUrl } from '../config/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('signup'); // or 'login'
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: ''
  });
  const [authError, setAuthError] = React.useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [visibleFeatures, setVisibleFeatures] = useState([false, false, false]);
  const featureRefs = [useRef(null), useRef(null), useRef(null)];
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDemoIntro, setShowDemoIntro] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // Check authentication status on component mount and listen for changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserEmail(payload.email);
          setIsLoggedIn(true);
        } catch (err) {
          console.error('Error decoding token:', err);
          localStorage.removeItem('token');
          setUserEmail('');
          setIsLoggedIn(false);
        }
      } else {
        setUserEmail('');
        setIsLoggedIn(false);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage changes (logout events)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom logout events
    const handleLogout = () => {
      setUserEmail('');
      setIsLoggedIn(false);
    };

    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (isLoggedIn) return; // Only animate for non-logged-in users

    const observers = featureRefs.map((ref, index) => {
      if (!ref.current) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleFeatures((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
              // Unobserve after animation triggers
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      observer.observe(ref.current);
      return observer;
    });

    return () => {
      observers.forEach((observer) => {
        if (observer) observer.disconnect();
      });
    };
  }, [isLoggedIn]);

  const features = [
    {
      title: "AI-Powered Memory Creation",
      description: "Transform any information into vivid, memorable images with AI technology.",
      icon: "🎨"
    },
    {
      title: "Interactive Memory Palaces",
      description: "Build and explore your own memory palaces with interactive points and visual anchors.",
      icon: "🏰"
    },
    {
      title: "Personalized Learning",
      description: "Save, organize, and review your memory palaces at your own pace.",
      icon: "📚"
    }
  ];

  const useCases = [
    {
      title: "Students",
      description: "Master complex subjects through visual memory techniques.",
      icon: "🎓"
    },
    {
      title: "Professionals",
      description: "Remember presentations, procedures, and key information with ease.",
      icon: "💼"
    },
    {
      title: "Language Learners",
      description: "Build vocabulary and grammar through memorable visual associations.",
      icon: "🌍"
    },
    // {
    //   title: "Medical Students",
    //   description: "Learn anatomy, terms, and procedures through visual memory palaces.",
    //   icon: "⚕️"
    // }
  ];

  const handleAuthSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.accessToken) {
        // Store tokens
        localStorage.setItem('token', result.accessToken);
        if (result.csrfToken) {
          CSRFManager.setCSRFToken(result.csrfToken);
        }
        setShowAuthModal(false);
        navigate('/saved-rooms');
      } else {
        setAuthError(result.message || 'Login/Signup failed');
      }
    } catch (err) {
      setAuthError('Login/Signup failed');
    }
    setIsLoading(false);
  };

  const handleDemoClick = () => {
    setShowDemoIntro(true);
  };

  const handleDemoLogin = async () => {
      setIsLoading(true);
      setError('');

      try {
          const response = await fetch(getApiUrl('/api/auth/login'), {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  email: 'demo@example.com',
                  password: 'demo123'
              }),
              credentials: 'include'
          });

          if (response.ok) {
              const data = await response.json();
              console.log('Demo login response data:', data);
              console.log('Access token:', data.accessToken);
              console.log('CSRF token:', data.csrfToken);
              localStorage.setItem('token', data.accessToken);
              if (data.csrfToken) {
                  localStorage.setItem('csrfToken', data.csrfToken);
              }
              console.log('Token stored in localStorage:', localStorage.getItem('token'));
              navigate('/saved-rooms');
          } else {
              const errorData = await response.json();
              setError(errorData.message || 'Demo login failed');
          }
      } catch (error) {
          console.error('Demo login error:', error);
          setError('Demo login failed. Please try again.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <>
      <div className="landing-palace-bg" />
      <div className="min-h-screen relative">
        <NavBar
          onLoginClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
        />
        {/* Hero Section */}
        {isLoggedIn ? (
          /* Personalized Welcome for Logged-in Users */
          <section className="py-20 px-4 mt-[224px]">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl mb-6 text-center text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Welcome back, {userEmail === 'demo@example.com' ? 'Demo User' : userEmail.split('@')[0]}!
                  </h1>
                  <p className="text-xl text-white text-center mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Ready to create your next memory palace?
                  </p>
                  <p className="text-lg text-white text-center mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Continue building your collection of memory palaces for better learning and retention.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/saved-rooms')}
                      className="btn-loci text-lg px-4 py-4 rounded-lg hover:scale-105 transition-transform duration-200 min-w-[200px]"
                    >
                      View My Palaces
                    </button>
                    <button
                      onClick={() => navigate('/input')}
                      className="btn-loci text-lg px-4 py-4 rounded-lg hover:scale-105 transition-transform duration-200 min-w-[200px]"
                    >
                      Create New Palace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Original Marketing Content for Non-logged-in Users */
          <section className="py-20 px-4 mt-[224px]">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl mb-6 text-center text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Want to boost your memory? <br /> You've come to the right place.
                  </h1>
                  <p className="text-xl text-white text-center mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    AI-powered memory palace creation for better learning and retention.
                  </p>
                  <p className="text-lg text-white text-center mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Transform how you remember using the ancient method of <em>loci</em> (Latin for "places," pronounced <strong>low·sai</strong>)
                  </p>

                  {/* What is a Memory Palace? Accordion */}
                  <div className="mb-8 max-w-3xl mx-auto">
                    <button
                      onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                      className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 transition-all duration-300 flex items-center justify-between group relative"
                      aria-expanded={isInfoExpanded}
                      aria-controls="memory-palace-info"
                    >
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex-1 text-center">
                        What is a Memory Palace?
                      </h3>
                      <svg
                        className={`w-6 h-6 text-white transition-transform duration-300 absolute right-4 ${isInfoExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isInfoExpanded && (
                      <div
                        id="memory-palace-info"
                        className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white animate-fade-in"
                      >
                        <p className="mb-4 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          A <strong>memory palace</strong> (also called the <em>method of loci</em>, pronounced <strong>low·sai</strong>) is an ancient memory technique that uses spatial memory to help you remember information.
                        </p>
                        <p className="mb-4 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          Here's how it works:
                        </p>
                        <ol className="list-decimal list-inside mb-4 space-y-2 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          <li>You choose a familiar room (like a throne room or bedchamber)</li>
                          <li>You place items you want to remember at specific locations (anchor points) in that room</li>
                          <li>AI generates vivid images for each item at each location</li>
                          <li>To recall the information, you mentally "walk through" the room and see the images</li>
                        </ol>
                        <p className="mb-4 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          This technique is incredibly powerful because our brains are excellent at remembering spatial relationships and visual images.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center mt-6">
                          <button
                            onClick={() => {
                              setIsInfoExpanded(false);
                              setShowUserGuide(true);
                            }}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                          >
                            📖 Read User Guide
                          </button>
                          <button
                            onClick={() => {
                              setIsInfoExpanded(false);
                              setShowAbout(true);
                            }}
                            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-semibold"
                          >
                            ℹ️ Learn More
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleDemoClick}
                      className="btn-loci text-lg px-4 py-4 rounded-lg hover:scale-105 transition-transform duration-200 min-w-[160px]"
                    >
                      Try Demo
                    </button>
                    <button
                      onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
                      className="btn-loci text-lg px-4 py-4 rounded-lg hover:scale-105 transition-transform duration-200 min-w-[160px]"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Features Section - Only show for non-logged-in users */}
        {!isLoggedIn && (
        <section className="py-0 px-0 section-overlay">
          <h2 className="loci-header text-4xl text-center mb-16 !text-white">
            Powerful Features for Better Memory
          </h2>
          <div className="flex flex-col gap-20 w-full pl-4 pr-4 md:pl-8 md:pr-8 max-w-5xl mx-auto">
            {/* Memorable - Bigger */}
            <div
              ref={featureRefs[0]}
              className={`w-full feature-card-container ${visibleFeatures[0] ? 'feature-visible' : 'feature-hidden'}`}
              style={{ transitionDelay: '0ms' }}
            >
              <div className="p-2">
                <div className="relative w-full aspect-[4/3] rounded-2xl shadow-xl border border-gray-100 bg-white/80 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <img
                    src="/images/memorable.png"
                    alt="Memorable"
                    className="absolute inset-0 w-full h-full object-cover z-0 scale-105 feature-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent z-[5]"></div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-12">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">AI-Powered Memory Creation</h3>
                    <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Transform any information into vivid, memorable images with AI technology.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Throne Room */}
            <div
              ref={featureRefs[1]}
              className={`w-full feature-card-container ${visibleFeatures[1] ? 'feature-visible' : 'feature-hidden'}`}
              style={{ transitionDelay: '150ms' }}
            >
              <div className="p-2">
                <div className="relative w-full aspect-[4/3] rounded-2xl shadow-xl border border-gray-100 bg-white/80 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <img
                    src="/images/throne_clicks.png"
                    alt="Throne Room"
                    className="absolute inset-0 w-full h-full object-cover z-0 feature-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent z-[5]"></div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-8">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Interactive Memory Palaces</h3>
                    <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Build and explore your own memory palaces with interactive points and visual anchors.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Rooms */}
            <div
              ref={featureRefs[2]}
              className={`w-full feature-card-container ${visibleFeatures[2] ? 'feature-visible' : 'feature-hidden'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="p-2">
                <div className="relative w-full aspect-[4/3] rounded-2xl shadow-xl border border-gray-100 bg-white/80 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <img
                    src="/images/saved_rooms.png"
                    alt="Saved Rooms"
                    className="absolute inset-0 w-full h-full object-cover z-0 feature-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent z-[5]"></div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-8">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Personalized Learning</h3>
                    <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Save, organize, and review your memory palaces at your own pace.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}
        <div className="mb-16" />
        {/* Use Cases Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="loci-header text-4xl text-center mb-16 !text-white">
              Perfect For
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="loci-container p-6 feature-card group bg-primary text-center text-white hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  <h3 className="loci-header text-xl mb-3 text-center !text-white">{useCase.title}</h3>
                  <p className="text-text-light">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section - Show for non-logged-in users and demo users */}
        {(!isLoggedIn || userEmail === 'demo@example.com') && (
        <section className="py-20 px-4 section-overlay">
          <div className="container mx-auto max-w-4xl text-center">
          <h2 className="loci-header text-4xl mb-6 !text-white">
                Start Building Your Memory Palace Today
              </h2>
            <button
              onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
              className="btn-loci text-lg px-8 py-4 rounded-lg hover:scale-105 transition-transform duration-200 mb-12"
            >
              Create Free Account
            </button>
          </div>
        </section>
        )}
        {/* Upcoming Features moved to footer */}
        {/* Footer */}
        <footer className="px-4 bg-primary text-white">
          <div className="container mx-auto max-w-6xl">
            {/* Main Footer Content */}
            <div className="flex flex-col items-center mb-12">
              {/* Brand Section */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <h3 className="text-3xl font-bold loci-header">low·sAI</h3>
                </div>
                {/* <p className="text-gray-400 text-xs italic">
                  Where memories find their place.
                </p> */}
              </div>

              {/* Upcoming Features Section - Only show for non-logged-in users */}
              {!isLoggedIn && (
              <div className="w-full">
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">Upcoming Features</h3>
                <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
                  <div className="rounded-lg p-4 text-center">
                    <div className="font-medium mb-2 text-white">Smarter Images</div>
                    <div className="text-sm text-gray-200">Our language model (LLM) will help generate even more memorable, personalized images for your items.</div>
                  </div>
                  <div className="rounded-lg p-4 text-center">
                    <div className="font-medium mb-2 text-white">Create Your Own Rooms</div>
                    <div className="text-sm text-gray-200">Design layouts that match your real spaces for a more personal memory journey.</div>
                  </div>
                  <div className="rounded-lg p-4 text-center">
                    <div className="font-medium mb-2 text-white">Upload Photos of Real Rooms</div>
                    <div className="text-sm text-gray-200">Anchor memories to your own room photos for maximum familiarity.</div>
                  </div>
                </div>
              </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-wrap justify-center gap-8 mt-16">
                <button
                  onClick={() => setShowUserGuide(true)}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  User Guide
                </button>
                <a href="mailto:support@low-sai.com" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Support
                </a>
                <button
                  onClick={() => setShowAbout(true)}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  About
                </button>
                <a href="mailto:contact@low-sai.com" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Contact
                </a>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-gray-700/50">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-400 text-sm">
                  &copy; {new Date().getFullYear()} Low·sAI. All rights reserved.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <a href="/#/terms" className="text-gray-400 hover:text-white transition-colors duration-300">Terms</a>
                  <span className="text-gray-600">•</span>
                  <a href="/#/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy</a>
                  <span className="text-gray-600">•</span>
                  <a href="/#/cookies" className="text-gray-400 hover:text-white transition-colors duration-300">Cookies</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          setMode={setAuthMode}
          onSubmit={handleAuthSubmit}
          error={authError}
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
        />
        <UserGuide
          isOpen={showUserGuide}
          onClose={() => setShowUserGuide(false)}
        />
        <About
          isOpen={showAbout}
          onClose={() => setShowAbout(false)}
        />
        {/* Demo Intro Modal */}
        {showDemoIntro && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDemoIntro(false);
              }
            }}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800">What is a Memory Palace?</h2>
                <button
                  onClick={() => setShowDemoIntro(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl leading-none w-8 h-8 flex items-center justify-center"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 mb-4 text-lg">
                    A <strong>memory palace</strong> (also called the <em>method of loci</em>, pronounced <strong>low·sai</strong>) is an ancient memory technique that uses spatial memory to help you remember information.
                  </p>
                  <p className="text-gray-700 mb-4 text-lg">
                    Here's how it works:
                  </p>
                  <ol className="list-decimal list-inside text-gray-700 space-y-3 mb-6 text-lg">
                    <li>You choose a familiar room (like a throne room or bedchamber)</li>
                    <li>You place items you want to remember at specific locations (anchor points) in that room</li>
                    <li>AI generates vivid images for each item at each location</li>
                    <li>To recall the information, you mentally "walk through" the room and see the images</li>
                  </ol>
                  <p className="text-gray-700 mb-6 text-lg">
                    This technique is incredibly powerful because our brains are excellent at remembering spatial relationships and visual images.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 text-lg">
                      <strong>💡 Tip:</strong> Want to learn more? Check out our <button onClick={() => { setShowDemoIntro(false); setShowUserGuide(true); }} className="text-primary hover:underline font-semibold">User Guide</button> or <button onClick={() => { setShowDemoIntro(false); setShowAbout(true); }} className="text-primary hover:underline font-semibold">About</button> pages for detailed information.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDemoIntro(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    setShowDemoIntro(false);
                    handleDemoLogin();
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LandingPage;
