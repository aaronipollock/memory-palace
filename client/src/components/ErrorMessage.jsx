import React from 'react';
import { getErrorType, getErrorStyling } from '../utils/errorHandler';

const ErrorMessage = ({ error, context = '', className = '', onRetry }) => {
  if (!error) return null;

  const errorType = getErrorType(error);
  const styling = getErrorStyling(errorType);

  const getRetryText = () => {
    switch (errorType) {
      case 'network':
        return 'Retry Connection';
      case 'timeout':
        return 'Try Again';
      case 'server':
        return 'Retry';
      default:
        return 'Try Again';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${styling} ${className}`}>
      <div className="flex-1">
        <p className="font-medium mb-2">
          {error.response?.data?.error || error.message || 'An error occurred'}
        </p>
        {error.response?.data?.details && (
          <p className="text-sm opacity-75 mb-3">
            {error.response.data.details}
          </p>
        )}
        {(errorType === 'network' || errorType === 'timeout' || errorType === 'server') && onRetry && (
          <button
            onClick={onRetry}
            className="bg-white bg-opacity-50 hover:bg-opacity-75 px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            {getRetryText()}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
