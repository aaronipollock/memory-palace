import React, { useEffect, useRef } from 'react';

const About = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with X button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">About Low·sAI</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At Low·sAI, we believe that everyone has the potential to dramatically improve their memory and learning capabilities. Our mission is to make the ancient and powerful technique of memory palaces accessible to everyone through modern AI technology.
              </p>
              <p className="text-gray-600 mb-4">
                We're passionate about helping students, professionals, and lifelong learners unlock their cognitive potential through the method of loci (pronounced <em>low-sai</em>), a time-tested memory technique that has been used for thousands of years.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">What is the Method of Loci?</h2>
              <p className="text-gray-600 mb-4">
                The method of loci, also known as the memory palace technique, is one of the most powerful memory enhancement methods ever discovered. It was used by ancient Greek and Roman orators to memorize long speeches and has been employed by memory champions worldwide.
              </p>
              <p className="text-gray-600 mb-4">
                The technique works by associating information you want to remember with specific locations in a familiar space. By creating vivid, memorable images for each piece of information and placing them at distinct locations, you can recall the information by mentally "walking through" the space.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">How We're Different</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">AI-Powered Image Generation</h3>
                  <p className="text-blue-700">
                    Our advanced AI creates vivid, memorable images tailored to your specific information, making the memory palace technique more effective than ever.
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">Interactive Experience</h3>
                  <p className="text-green-700">
                    Unlike traditional memory palace methods, our interactive interface lets you explore and practice your memory palaces with visual feedback.
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">Multiple Room Types</h3>
                  <p className="text-purple-700">
                    Choose from throne rooms, bedchambers, and dungeons, each with unique anchor points to keep your memory palaces distinct and organized.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-orange-800 mb-3">Art Style Customization</h3>
                  <p className="text-orange-700">
                    Select from various art styles to create images that resonate with your personal preferences and learning style.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Who We Serve</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🎓</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Students</h3>
                    <p className="text-gray-600">Master complex subjects, memorize facts, and ace exams with visual memory techniques.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">💼</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Professionals</h3>
                    <p className="text-gray-600">Remember presentations, procedures, client information, and key business concepts.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🌍</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Language Learners</h3>
                    <p className="text-gray-600">Build vocabulary, learn grammar, and master new languages through visual associations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">⚕️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Medical Students</h3>
                    <p className="text-gray-600">Learn anatomy, medical terms, and procedures through memorable visual memory palaces.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Technology</h2>
              <p className="text-gray-600 mb-4">
                Low·sAI is built using cutting-edge AI technology and modern web development practices. We use advanced image generation models to create vivid, memorable images that help you retain information more effectively.
              </p>
              <p className="text-gray-600 mb-4">
                Our platform is designed to be intuitive and accessible, whether you're a complete beginner to memory techniques or an experienced practitioner looking to enhance your skills with AI assistance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">The Science Behind Memory Palaces</h2>
              <p className="text-gray-600 mb-4">
                Research has consistently shown that the method of loci is one of the most effective memory enhancement techniques available. Studies have demonstrated that people using memory palaces can:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Remember significantly more information than traditional study methods</li>
                <li>Retain information for longer periods of time</li>
                <li>Recall information more quickly and accurately</li>
                <li>Improve their overall cognitive performance</li>
              </ul>
              <p className="text-gray-600 mb-4">
                The technique works by leveraging our brain's natural ability to remember spatial information and visual imagery, which are processed by different neural networks than abstract information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Commitment</h2>
              <p className="text-gray-600 mb-4">
                We're committed to continuously improving Low·sAI based on user feedback and the latest research in cognitive science and AI technology. Our goal is to make memory enhancement accessible, effective, and enjoyable for everyone.
              </p>
              <p className="text-gray-600 mb-4">
                We believe that with the right tools and techniques, anyone can dramatically improve their memory and learning capabilities. Low·sAI is our contribution to making that vision a reality.
              </p>
            </section>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Get Started?</h3>
              <p className="text-gray-700 mb-4">
                Experience the power of memory palaces for yourself. Try our demo to see how AI-powered memory enhancement can transform your learning.
              </p>
              <a
                href="/#/"
                className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
                style={{ color: 'white' }}
              >
                Try Demo Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
