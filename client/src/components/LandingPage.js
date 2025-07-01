import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';
import LoadingSpinner from './LoadingSpinner';
import './LandingPage.css';

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
              const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        localStorage.setItem('token', result.token);
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
                    onClick={() => {
                      // Simulate demo login
                      localStorage.setItem('token', 'demo-token');
                      navigate('/demo'); // Go to InputPage after setting token
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
          <div className="flex flex-col gap-0 w-full">
            {features.map((feature, index) => {
              const blueShades = [
                'bg-blue-200',
                'bg-blue-400',
                'bg-blue-300',
                'bg-blue-300',
                'bg-blue-200',
              ];
              const shade = blueShades[index % blueShades.length];
              // Unified layout for the three main features
              if (
                feature.title === 'AI-Powered Memory Creation' ||
                feature.title === 'Interactive Memory Palaces' ||
                feature.title === 'Personalized Learning'
              ) {
                let imageSrc = '';
                let imageAlt = '';
                if (feature.title === 'AI-Powered Memory Creation') {
                  imageSrc = '/images/memorable.png';
                  imageAlt = 'Memorable';
                } else if (feature.title === 'Interactive Memory Palaces') {
                  imageSrc = '/images/throne_room.webp';
                  imageAlt = 'Throne Room';
                } else if (feature.title === 'Personalized Learning') {
                  imageSrc = '/images/saved_rooms.png';
                  imageAlt = 'Saved Rooms';
                }
                return (
                  <div
                    key={index}
                    className={`w-full py-24 px-4 ${shade} gradient-${shade.replace('bg-', '')} flex items-center justify-center`}
                  >
                    <div className="max-w-md w-full mx-auto text-right">
                      <h3 className="text-2xl font-semibold mb-2 text-primary">{feature.title}</h3>
                      <p className="text-text-light text-lg">{feature.description}</p>
                    </div>
                    <img
                      src={imageSrc}
                      alt={imageAlt}
                      className="w-full max-w-sm h-56 object-cover mx-auto ml-12 hidden md:block mr-24 rounded-xl"
                    />
                  </div>
                );
              }
            })}
          </div>
        </section>
        {/* Coming Soon Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-white to-[#2B4C7E]/10">
          <div className="container mx-auto max-w-6xl">
            <h2 className="loci-header text-4xl text-center mb-12 !text-primary">
              Coming Soon
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/80 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold mb-2 text-primary">User Accounts</h3>
                <p className="text-text-light">Save and manage multiple memory palaces with your personal account.</p>
              </div>
              <div className="bg-white/80 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2 text-primary">More Room Types</h3>
                <p className="text-text-light">New room types including Great Hall, Chapel, and Kitchen coming soon.</p>
              </div>
              <div className="bg-white/80 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Mobile App</h3>
                <p className="text-text-light">Access your memory palaces on the go with our upcoming mobile app.</p>
              </div>
              <div className="bg-white/80 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Enhanced Memory Creation</h3>
                <p className="text-text-light">Two-stage AI process: LLM generates creative associations, followed by AI image generation for more memorable visual anchors.</p>
              </div>
              <div className="hidden lg:block"></div>
              <div className="bg-white/80 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Custom Room Creation</h3>
                <p className="text-text-light">Create personalized memory palaces using AI to generate rooms that match your familiar spaces, making memory associations even stronger.</p>
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
        <section className="py-20 px-4 loci-bg section-overlay">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="loci-header text-4xl mb-6">
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
              {/* <p>&copy; {new Date().getFullYear()} low·sAI. All rights reserved.</p> */}
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
