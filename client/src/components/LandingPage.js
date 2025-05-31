import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';
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
      // ...your login/signup API call here...
      // Suppose you get a token from the response:
      // const token = response.data.token;
      // localStorage.setItem('token', token);

      // For demonstration, let's simulate a token:
      localStorage.setItem('token', 'demo-token');
      setShowAuthModal(false);
      // Optionally, force a re-render:
      window.location.reload(); // or use a state variable to trigger re-render
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
          onSignUpClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
        />
        {/* Hero Section */}
        <section className="py-20 px-4 mt-64">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center md:text-left">
                <h1 className="loci-header text-5xl md:text-6xl mb-6 text-center !text-white">
                  Want to boost your memory? <br /> You've come to the right place.
                </h1>
                <p className="text-xl text-text-light text-center text-white mb-8">
                  Transform how you remember with AI-powered memory palaces, <br />aka the method loci (pronounced <em>low·sai</em>).
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
                  <button
                    onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
                    className="btn-loci-secondary text-lg px-8 py-4"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-20 px-0">
          <h2 className="loci-header text-4xl text-center mb-16 !text-white">
            Powerful Features for Better Memory
          </h2>
          <div className="flex flex-col gap-0 w-full">
            {features.map((feature, index) => {
              const purpleShades = [
                'bg-purple-200',
                'bg-purple-300',
                'bg-purple-400',
                'bg-purple-300',
                'bg-purple-200',
              ];
              const shade = purpleShades[index % purpleShades.length];
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`w-full py-24 px-4 ${shade} flex`}
                >
                  <div
                    className={`
                      max-w-md w-full
                      mx-auto
                      ${isEven ? 'text-left ml-12' : 'text-right mr-12'}
                    `}
                  >
                    <h3 className="text-2xl font-semibold mb-2 text-purple-900">{feature.title}</h3>
                    <p className="text-purple-900/90 text-lg">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* Use Cases Section */}
        <section className="py-20 px-4 bg-background">
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
        </section>
        {/* CTA Section */}
        <section className="py-20 px-4 loci-bg">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="loci-header text-4xl mb-6">
              Start Building Your Memory Palace Today
            </h2>
            {/* <p className="text-xl text-text-light mb-8">
              Join thousands of learners who have transformed their memory with Loci.
            </p> */}
            <button
              onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
              className="btn-loci text-lg px-8 py-4"
            >
              Create Free Account
            </button>
          </div>
        </section>
        {/* Footer */}
        <footer className="py-12 px-4 bg-primary text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Loci</h3>
                <p className="text-gray-300">
                  Where memories find their place.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Features</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Pricing</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Demo</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Blog</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Tutorials</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">About</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Contact</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Privacy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-300">
              <p>&copy; {new Date().getFullYear()} Loci. All rights reserved.</p>
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
