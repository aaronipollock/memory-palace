import React from 'react';

const PasswordStrength = ({ strength, label, color, requirements = [] }) => {
  const strengthBars = 6;
  const filledBars = strength;

  const getBarColor = (index) => {
    if (index < filledBars) {
      if (strength <= 2) return 'bg-red-500';
      if (strength <= 3) return 'bg-orange-500';
      if (strength <= 4) return 'bg-yellow-500';
      if (strength <= 5) return 'bg-blue-500';
      return 'bg-green-500';
    }
    return 'bg-gray-200';
  };

  if (strength === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-medium ${color}`}>{label}</span>
      </div>

      <div className="flex space-x-1 mb-2">
        {Array.from({ length: strengthBars }, (_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${getBarColor(index)}`}
          />
        ))}
      </div>

      {requirements.length > 0 && (
        <div className="text-xs text-gray-500">
          <p className="mb-1">Requirements:</p>
          <ul className="space-y-1">
            {requirements.map((requirement, index) => (
              <li key={index} className="flex items-center">
                <span className="text-red-400 mr-1">•</span>
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
