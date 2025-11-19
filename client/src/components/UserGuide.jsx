import React from 'react';
import NavBar from './NavBar';

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-primary">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Low·sAI User Guide</h1>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Table of Contents</h2>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li><a href="#introduction" className="text-blue-600 hover:text-blue-800">Introduction</a></li>
              <li><a href="#getting-started" className="text-blue-600 hover:text-blue-800">Getting Started</a></li>
              <li><a href="#creating-palace" className="text-blue-600 hover:text-blue-800">Creating Your First Memory Palace</a></li>
              <li><a href="#using-visualizer" className="text-blue-600 hover:text-blue-800">Using the Visualizer</a></li>
              <li><a href="#managing-palaces" className="text-blue-600 hover:text-blue-800">Managing Your Memory Palaces</a></li>
              <li><a href="#tips" className="text-blue-600 hover:text-blue-800">Tips for Effective Memory Palaces</a></li>
              <li><a href="#troubleshooting" className="text-blue-600 hover:text-blue-800">Troubleshooting</a></li>
              <li><a href="#faq" className="text-blue-600 hover:text-blue-800">FAQ</a></li>
            </ul>

            <section id="introduction" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Introduction</h2>
              <p className="text-gray-600 mb-4">
                Welcome to Low·sAI, an AI-powered application that helps you create and use the ancient method of loci (pronounced <em>low-sai</em>) to improve your memory. This technique uses spatial memory and visual associations to make information more memorable.
              </p>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">What is a Memory Palace?</h3>
              <p className="text-gray-600 mb-4">
                A memory palace is a mental technique where you associate information you want to remember with specific locations in a familiar place (like a room). By creating vivid, memorable images for each piece of information and placing them at distinct locations, you can recall the information by mentally "walking through" the space.
              </p>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Key Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>AI-Powered Image Generation</strong>: Transform any information into vivid, memorable images</li>
                <li><strong>Interactive Memory Palaces</strong>: Build and explore your own memory palaces with interactive anchor points</li>
                <li><strong>Multiple Room Types</strong>: Choose from throne rooms, bedchambers, and dungeons</li>
                <li><strong>Art Style Customization</strong>: Select from various art styles for your generated images</li>
                <li><strong>Save and Review</strong>: Store your memory palaces for later review and practice</li>
              </ul>
            </section>

            <section id="getting-started" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Getting Started</h2>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Demo Mode</h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li><strong>Visit the Landing Page</strong>: Navigate to the application's homepage</li>
                <li><strong>Try Demo</strong>: Click the "Try Demo" button to experience the application without creating an account</li>
                <li><strong>Explore Features</strong>: The demo includes sample memory palaces to help you understand the concept</li>
              </ol>
            </section>

            <section id="creating-palace" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Creating Your First Memory Palace</h2>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Step 1: Choose Your Room Type</h3>
              <p className="text-gray-600 mb-4">Select from available room types:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Throne Room</strong>: Majestic setting with royal elements</li>
                <li><strong>Bedchamber</strong>: Cozy bedroom environment</li>
                <li><strong>Dungeon</strong>: Mysterious underground space</li>
              </ul>
              <p className="text-gray-600 mb-4">Each room type has unique anchor points (specific locations where you'll place your memories).</p>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Step 2: Select Art Style</h3>
              <p className="text-gray-600 mb-4">Choose your preferred visual style for generated images:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Random</strong>: AI selects the best style for each image</li>
                <li><strong>Digital Art</strong>: Modern digital illustrations</li>
                <li><strong>Cartoon</strong>: Fun, animated style</li>
                <li><strong>3D Render</strong>: Realistic 3D graphics</li>
                <li><strong>Watercolor</strong>: Soft, artistic paintings</li>
                <li><strong>Pop Art</strong>: Bold, colorful style</li>
                <li><strong>Photorealistic</strong>: Highly detailed, realistic images</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Step 3: Add Your Memorables</h3>
              <p className="text-gray-600 mb-4">Enter the items, concepts, or information you want to remember. Each item should be on a separate line.</p>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Examples:</p>
                <pre className="text-sm text-gray-600">Milk
Bread
Eggs
Apples
Chicken
Coffee
Pasta</pre>
              </div>

              <h4 className="text-lg font-semibold text-gray-700 mb-3">Tips for Better Memorables:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Be specific and concrete</li>
                <li>Use nouns rather than abstract concepts</li>
                <li>Keep items related to a single theme or category</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Step 4: Generate Your Memory Palace</h3>
              <p className="text-gray-600 mb-4">Click "Create Memory Palace" to generate your personalized memory palace with AI-created images for each memorable item.</p>
            </section>

            <section id="using-visualizer" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Using the Visualizer</h2>
              <p className="text-gray-600 mb-4">The Visualizer is where you interact with your memory palace and review the generated images.</p>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Understanding the Interface</h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li><strong>Room Display</strong>: The main area shows your chosen room with highlighted anchor points</li>
                <li><strong>Anchor Points</strong>: Clickable areas marked with visual indicators</li>
                <li><strong>Image Popup</strong>: Appears when you click an anchor point, showing the generated image</li>
                <li><strong>Accept/Reject Controls</strong>: Buttons to approve or regenerate images</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Working with Images</h3>

              <h4 className="text-lg font-semibold text-gray-700 mb-3">Viewing Images</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Click on any highlighted anchor point in the room</li>
                <li>The generated image will appear in a popup window</li>
                <li>Review the image and its association with your memorable item</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-700 mb-3">Accepting Images</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>If you like the generated image, click "Accept"</li>
                <li>The image will be saved for that anchor point</li>
                <li>A checkmark or indicator will show the point is complete</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-700 mb-3">Regenerating Images</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>If you don't like the image, click "Reject"</li>
                <li>A new image will be generated for the same anchor point</li>
                <li>Continue until you find an image that works for you</li>
              </ul>
            </section>

            <section id="tips" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Tips for Effective Memory Palaces</h2>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Creating Strong Associations</h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li><strong>Be Specific</strong>: Use concrete, specific items rather than abstract concepts</li>
                <li><strong>Make it Vivid</strong>: Choose memorable items that stand out</li>
                <li><strong>Use Emotion</strong>: Include items that evoke strong emotions or reactions</li>
                <li><strong>Create Stories</strong>: Link items together in a narrative when possible</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Reviewing Your Memory Palace</h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li><strong>Regular Review</strong>: Visit your palace daily for the first week</li>
                <li><strong>Mental Walkthrough</strong>: Practice mentally walking through the room</li>
                <li><strong>Test Yourself</strong>: Try to recall items without looking at the images</li>
                <li><strong>Add Details</strong>: Enhance associations with additional sensory details</li>
              </ol>
            </section>

            <section id="faq" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Q: How many items should I put in a memory palace?</h3>
                  <p className="text-gray-600">A: For best results, aim for 10 items per palace. This provides enough variety while remaining manageable for memory retention.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Q: How often should I practice my memory palace?</h3>
                  <p className="text-gray-600">A: Review daily for the first week, then weekly for the first month. After that, monthly reviews help maintain long-term retention.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Q: Can I use the same room type for different memory palaces?</h3>
                  <p className="text-gray-600">A: Yes, but using different room types can help prevent confusion between different sets of information.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Q: What if I don't like any of the generated images?</h3>
                  <p className="text-gray-600">A: Keep using the "Reject" button to generate new images. You can also try different art styles for variety.</p>
                </div>
              </div>
            </section>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Support and Feedback</h3>
              <p className="text-blue-700">
                If you encounter any issues or have suggestions for improvement, please contact our support team. We're committed to making Low·sAI the best tool for improving your memory and learning.
              </p>
              <p className="text-blue-800 font-semibold mt-2">Happy memorizing!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
