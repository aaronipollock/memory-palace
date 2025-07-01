// import React, { useState } from 'react';
// import { useDemo } from '../contexts/DemoContext';

// const DemoTutorial = () => {
//     const { preferences, updatePreferences } = useDemo();
//     const [currentStep, setCurrentStep] = useState(0);

//     const steps = [
//         {
//             title: "Welcome to Your Memory Palace!",
//             content: "Let's take a quick tour of how to create and use your memory palace.",
//             position: "center"
//         },
//         {
//             title: "Choose Your Room",
//             content: "Start by selecting a room type that resonates with you. Each room has unique anchor points for your memories.",
//             position: "top"
//         },
//         {
//             title: "Add Your Items",
//             content: "Enter the items you want to remember. These will be transformed into memorable images.",
//             position: "center"
//         },
//         {
//             title: "Generate Images",
//             content: "Click on anchor points to generate AI-powered images that represent your items.",
//             position: "bottom"
//         },
//         {
//             title: "Save Your Palace",
//             content: "Once you're happy with your memory palace, save it to revisit later.",
//             position: "center"
//         }
//     ];

//     const handleNext = () => {
//         if (currentStep < steps.length - 1) {
//             setCurrentStep(currentStep + 1);
//         } else {
//             // End tutorial
//             updatePreferences({ ...preferences, showTutorial: false });
//         }
//     };

//     const handleSkip = () => {
//         updatePreferences({ ...preferences, showTutorial: false });
//     };

//     if (!preferences.showTutorial) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
//                 <div className="absolute top-4 right-4">
//                     <button
//                         onClick={handleSkip}
//                         className="text-gray-500 hover:text-gray-700"
//                     >
//                         Skip Tutorial
//                     </button>
//                 </div>

//                 <h2 className="text-2xl font-bold mb-4 text-primary">
//                     {steps[currentStep].title}
//                 </h2>

//                 <p className="text-gray-600 mb-8">
//                     {steps[currentStep].content}
//                 </p>

//                 <div className="flex justify-between items-center">
//                     <div className="flex space-x-2">
//                         {steps.map((_, index) => (
//                             <div
//                                 key={index}
//                                 className={`w-2 h-2 rounded-full ${
//                                     index === currentStep ? 'bg-primary' : 'bg-gray-300'
//                                 }`}
//                             />
//                         ))}
//                     </div>

//                     <button
//                         onClick={handleNext}
//                         className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300"
//                     >
//                         {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DemoTutorial;
