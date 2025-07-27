import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';
import LoadingSpinner from './LoadingSpinner';
import { SecureAPIClient, CSRFManager, TokenManager } from '../utils/security';
import './LandingPage.css';

const API_URL = 'http://localhost:5001';
const apiClient = new SecureAPIClient(API_URL);

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('signup'); // or 'login'
  const [formData, setFormData] = React.useState({ email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

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
    {
      title: "Medical Students",
      description: "Learn anatomy, terms, and procedures through visual memory palaces.",
      icon: "⚕️"
    }
  ];

  const handleAuthSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await apiClient.post(endpoint, data);

      const result = await response.json();

      if (response.ok && result.accessToken) {
        // Store tokens
        localStorage.setItem('token', result.accessToken);
        if (result.csrfToken) {
          CSRFManager.setCSRFToken(result.csrfToken);
        }
        setShowAuthModal(false);
        navigate('/demo');
      } else {
        setAuthError(result.message || 'Login/Signup failed');
      }
    } catch (err) {
      setAuthError('Login/Signup failed');
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="landing-palace-bg" />
      <div className="min-h-screen relative">
        <NavBar
          onLoginClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
        />
        {/* Hero Section */}
        <img
          src="/images/banner_clean.png"
          alt="Banner"
          className="w-48 h-auto mx-auto md:mx-16"
          style={{ borderRadius: '8px' }}
        />
        <section className="py-20 px-4 mt-24">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center md:text-left">
                <h1 className="loci-header text-5xl md:text-6xl mb-6 text-center !text-white">
                  Want to boost your memory? <br /> You've come to the right place.
                </h1>
                <p className="text-xl text-text-light text-center text-white mb-8">
                  Transform how you remember with AI-powered memory palaces, <br />also known as the ancient method of loci (pronounced <em>low·sai</em>).
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:5001/api/auth/login', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            email: 'demo@example.com',
                            password: 'demo123456'
                          }),
                          credentials: 'include'
                        });

                        const result = await response.json();

                        if (response.ok) {
                          TokenManager.setAccessToken(result.accessToken);
                          if (result.csrfToken) {
                            CSRFManager.setCSRFToken(result.csrfToken);
                          }
                          navigate('/demo');
                        } else {
                          console.error('Demo login failed:', result.message);
                          showError('Demo login failed. Please try again.');
                        }
                      } catch (err) {
                        console.error('Demo login error:', err);
                        showError('Demo login failed. Please try again.');
                      }
                    }}
                    className="btn-loci text-lg px-8 py-4"
                  >
                    Try Demo
                  </button>
                  {/* <button
                    onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
                    className="btn-loci-secondary text-lg px-8 py-4"
                  >
                    Get Started
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-0 px-0 section-overlay">
          <h2 className="loci-header text-4xl text-center mb-16 !text-white">
            Powerful Features for Better Memory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 w-full pl-4 pr-4 md:pl-8 md:pr-8">
            {/* Left: Memorable (4:3) - Bigger */}
            <div className="flex items-center md:items-start justify-start md:pr-4 mt-0">
              <div className="relative w-full aspect-[4/3.7] rounded-2xl shadow-xl border border-gray-100 bg-white/80 hover:shadow-2xl transition-shadow w-full overflow-hidden">
                <img
                  src="/images/memorable.png"
                  alt="Memorable"
                  className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
                />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-12">
                  <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">AI-Powered Memory Creation</h3>
                  <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Transform any information into vivid, memorable images with AI technology.</p>
                </div>
              </div>
            </div>
            {/* Right: Stacked 16:9 cards */}
            <div className="flex flex-col gap-8 items-start">
              {/* Throne Room */}
              <div className="relative w-full aspect-[16/9] rounded-2xl shadow-xl border border-gray-100 bg-white/80 hover:shadow-2xl transition-shadow w-full overflow-hidden">
                <img
                  src="/images/throne_clicks.png"
                  alt="Throne Room"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-8">
                  <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Interactive Memory Palaces</h3>
                  <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Build and explore your own memory palaces with interactive points and visual anchors.</p>
                </div>
              </div>
              {/* Saved Rooms */}
              <div className="relative w-full aspect-[16/9] rounded-2xl shadow-xl border border-gray-100 bg-white/80 hover:shadow-2xl transition-shadow w-full overflow-hidden">
                <img
                  src="/images/saved_rooms.png"
                  alt="Saved Rooms"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-8 pb-8">
                  <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Personalized Learning</h3>
                  <p className="text-lg md:text-xl text-white text-center max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Save, organize, and review your memory palaces at your own pace.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="mb-16" />
        {/* Upcoming Features Section */}
        <section className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Upcoming Features</h3>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
                  <div className="font-medium mb-1 text-blue-900">Smarter Images</div>
                  <div className="text-sm text-blue-800">Our language model (LLM) will help generate even more memorable, personalized images for your items.</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
                  <div className="font-medium mb-1 text-blue-900">Create Your Own Rooms</div>
                  <div className="text-sm text-blue-800">Design layouts that match your real spaces for a more personal memory journey.</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
                  <div className="font-medium mb-1 text-blue-900">Upload Photos of Real Rooms</div>
                  <div className="text-sm text-blue-800">Anchor memories to your own room photos for maximum familiarity.</div>
                </div>
            </div>
          </div>
        </section>
        {/* Use Cases Section */}
        {/* <section className="py-20 px-4 bg-background gradient-use-cases">
          <div className="container mx-auto max-w-6xl">
            <h2 className="loci-header text-4xl text-center mb-16">
              Perfect For
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="loci-container p-6 feature-card group">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {useCase.icon}
                  </div>
                  <h3 className="loci-header text-xl mb-3">{useCase.title}</h3>
                  <p className="text-text-light">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}
        {/* CTA Section */}
        <section className="py-20 px-4 section-overlay">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="loci-header text-4xl mb-6 !text-white">
              Start Building Your Memory Palace Today
            </h2>
            {/* <p className="text-xl text-text-light mb-8">
              Join thousands of learners who have transformed their memory with Loci.
            </p> */}
            {/* <button
              onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
              className="btn-loci text-lg px-8 py-4"
            >
              Create Free Account
            </button> */}
          </div>
        </section>
        {/* Footer */}
        <footer className="py-12 px-4 bg-primary text-white">
          <p className="text-gray-300 text-center">
            Where memories find their place.
          </p>
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">low·sAI</h3>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Features</a></li>
                  {/* <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Pricing</a></li> */}
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Demo</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  {/* <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Blog</a></li> */}
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Tutorials</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">About</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Contact</a></li>
                  {/* <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Privacy</a></li> */}
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-300">
              <p>&copy; {new Date().getFullYear()} Low·sAI. All rights reserved.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors duration-300">Terms of Service</a>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors duration-300">Privacy Policy</a>
                <a href="/cookies" className="text-gray-300 hover:text-white transition-colors duration-300">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSubmit={handleAuthSubmit}
          error={authError}
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </>
  );
};

export default LandingPage;
