import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';
import UserGuide from './UserGuide';
import About from './About';
import { CSRFManager } from '../utils/security';
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
  const [visibleFeatures, setVisibleFeatures] = useState([false, false, false, false]);
  const featureRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [showNewFeatureBanner, setShowNewFeatureBanner] = useState(true);

  const decodeJwtPayload = (jwt) => {
    const parts = jwt?.split('.');
    if (!parts || parts.length < 2) return null;

    try {
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';

      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const logoutTimerRef = useRef(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      // clear any previously scheduled logout
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        setUserEmail('');
        setIsLoggedIn(false);
        return;
      }

      const payload = decodeJwtPayload(token);
      const now = Math.floor(Date.now() / 1000);

      if (payload?.email && payload?.exp && payload.exp > now) {
        setUserEmail(payload.email);
        setIsLoggedIn(true);

        const MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24h

        const msUntilExp = (payload.exp - now) * 1000;
        const delay = Math.min(msUntilExp + 500, MAX_TIMEOUT_MS);

        logoutTimerRef.current = setTimeout(
          checkAuthStatus,
          delay
        );
      } else {
        localStorage.removeItem('token');
        setUserEmail('');
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();

    const handleStorageChange = (e) => {
      if (e.key === 'token') checkAuthStatus();
    };

    const handleLogout = () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      setUserEmail('');
      setIsLoggedIn(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogout);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
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

  const useCases = [
    {
      title: "Students",
      description: "Improve retrieval through structured cues.",
      icon: "🎓"
    },
    {
      title: "Professionals",
      description: "Encode presentations, procedures, and key information into spatial anchors.",
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
    handleDemoLogin();
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
              localStorage.setItem('token', data.accessToken);
              if (data.csrfToken) {
                CSRFManager.setCSRFToken(data.csrfToken);
              }
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
        {/* New Feature Banner */}
        {showNewFeatureBanner && !isLoggedIn && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 mt-[80px] relative z-10">
            <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div>
                  <span className="font-bold">New:</span> Create custom rooms with your own photos! Upload familiar spaces and use them as memory palace foundations.
                </div>
              </div>
              <button
                onClick={() => setShowNewFeatureBanner(false)}
                className="text-white hover:text-gray-200 transition-colors text-xl leading-none px-2"
                aria-label="Close banner"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {/* Hero Section */}
        {isLoggedIn ? (
          /* Personalized Welcome for Logged-in Users */
          <section className={`py-20 px-4 ${showNewFeatureBanner ? 'mt-[144px]' : 'mt-[224px]'}`}>
            {/* New Feature Announcement for Logged-in Users */}
            {showNewFeatureBanner && (
              <div className="container mx-auto max-w-6xl mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg shadow-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div>
                      <div className="font-bold text-lg mb-1">New Feature: Custom Rooms</div>
                      <div className="text-sm">Upload your own room photos and create memory palaces from familiar spaces!</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const event = new CustomEvent('openUploadModal');
                        window.dispatchEvent(event);
                      }}
                      className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
                    >
                      Try It Now
                    </button>
                    <button
                      onClick={() => setShowNewFeatureBanner(false)}
                      className="text-white hover:text-gray-200 transition-colors text-xl leading-none px-2"
                      aria-label="Close banner"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    Continue building and revisiting your memory palaces.
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
                    <button
                      onClick={() => {
                        const event = new CustomEvent('openUploadModal');
                        window.dispatchEvent(event);
                      }}
                      className="btn-loci-secondary text-lg px-4 py-4 rounded-lg hover:scale-105 transition-transform duration-200 min-w-[200px] border-2 border-white/50"
                    >
                      Create Custom Room
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Original Marketing Content for Non-logged-in Users */
          <section className={`py-20 px-4 ${showNewFeatureBanner ? 'mt-[144px]' : 'mt-[224px]'}`}>
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl mb-6 text-center text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Structured memory encoding,<br /> supported by AI.
                  </h1>
                  <p className="text-xl text-white text-center mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    An open-source tool for building and revisiting spatial memory structures, or "memory palaces".
                  </p>
                  <p className="text-lg text-white text-center mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Based on the ancient method of <em>loci</em> (Latin for "places," pronounced <strong>low·sai</strong>)
                  </p>

                  {/* What is a Memory Palace? Accordion */}
                  <div className="mb-8 max-w-xl mx-auto">
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
                       A <strong>memory palace</strong> is a structured encoding technique that links information to specific locations in a familiar physical space.
                       Instead of storing ideas as isolated facts, you attach them to spatial cues you already know well.
                     </p>

                     <p className="mb-4 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                       The technique has been used for centuries, from classical rhetoric to modern competitive memory training,
                       because spatial memory tends to be more stable than abstract recall.
                     </p>

                     <p className="mb-4 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                       <strong>In Low·sAI, the process looks like this:</strong>
                     </p>

                     <ol className="list-decimal list-inside mb-4 space-y-3 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ml-2">
                       <li>Select or define a room you can easily visualize</li>
                       <li>Choose specific locations within that room as anchors</li>
                       <li>Associate each concept with a visual cue placed at an anchor</li>
                       <li>Review by mentally moving through the space in a consistent order</li>
                     </ol>

                     <p className="mb-4 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                       Low·sAI focuses on making this encoding process explicit and repeatable,
                       using software to support structure rather than replace user intent.
                     </p>

                     <div className="flex flex-wrap gap-4 justify-center mt-6">
                       <button
                         onClick={() => {
                           setIsInfoExpanded(false);
                           setShowUserGuide(true);
                         }}
                         className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
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
            Core workflow
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
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Encoding-first image generation</h3>
                    <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Generate visual cues to support associations you define (not replace them).</p>
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
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Spatial anchors and repeatable review</h3>
                    <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Place cues at consistent locations and revisit them in a fixed order.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Palaces */}
            <div
              ref={featureRefs[2]}
              className={`w-full feature-card-container ${visibleFeatures[2] ? 'feature-visible' : 'feature-hidden'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="p-2">
                <div className="relative w-full aspect-[4/3] rounded-2xl shadow-xl border border-gray-100 bg-white/80 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <img
                    src="/images/saved_rooms.png"
                    alt="My Palaces"
                    className="absolute inset-0 w-full h-full object-cover z-0 feature-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent z-[5]"></div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-8">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Save and iterate</h3>
                    <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Store palaces and refine them over time as your understanding changes.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Rooms - New Feature */}
            <div
              ref={featureRefs[3]}
              className={`w-full feature-card-container ${visibleFeatures[3] ? 'feature-visible' : 'feature-hidden'}`}
              style={{ transitionDelay: '450ms' }}
            >
              <div className="p-2">
                <div className="relative w-full aspect-[4/3] rounded-2xl shadow-xl border border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute top-4 right-4 z-20 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    NEW
                  </div>
                  <img
                    src="/images/custom_room.png"
                    alt="My Palaces"
                    className="absolute inset-0 w-full h-full object-cover z-0 feature-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent z-[5]"></div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-8">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Use Your Own Spaces</h3>
                    <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Upload photos of familiar rooms and use them as stable spatial anchors for your memory palaces.</p>
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
              Built For
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
          <h2 className="loci-header text-4xl mb-6 !text-white">Create your first palace</h2>
            <button
              onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
              className="btn-loci-secondary text-lg px-8 py-4 rounded-lg hover:scale-105 transition-transform duration-200 mb-12"
            >
              Free Account
            </button>
            <p className="text-sm text-white/80">
              Free to use • Open source • No credit card
            </p>
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

              {/* New Features Section - Only show for non-logged-in users */}
              {!isLoggedIn && (
              <div className="w-full mb-8">
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">Now Available</h3>
                <div className="grid gap-4 md:grid-cols-1 max-w-2xl mx-auto">
                  <div className="rounded-lg p-4 text-center bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-400/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="font-medium text-white">Custom Rooms</div>
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">NEW</span>
                    </div>
                    <div className="text-sm text-gray-200">Upload photos of familiar rooms and use them as stable spatial anchors for your memory palaces. Define anchor points and create palaces based on spaces you know intimately.</div>
                  </div>
                </div>
              </div>
              )}

              {/* Upcoming Features Section - Only show for non-logged-in users */}
              {!isLoggedIn && (
              <div className="w-full">
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">In Progress</h3>
                <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
                  <div className="rounded-lg p-4 text-center">
                    <div className="font-medium mb-2 text-white">Custom Room Layouts</div>
                    <div className="text-sm text-gray-200">Define your own room structures to match how you already think about physical spaces.</div>
                  </div>
                  <div className="rounded-lg p-4 text-center">
                    <div className="font-medium mb-2 text-white">Encoding Suggestions</div>
                    <div className="text-sm text-gray-200">Optional prompts suggest figurative associations to support stronger encoding, while keeping you in control.
                    </div>
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
      </div>
    </>
  );
};

export default LandingPage;
