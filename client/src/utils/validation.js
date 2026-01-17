// Authentication validation utilities

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, message: 'Email is too long' };
  }

  return { isValid: true, message: '' };
};

// Password validation
export const validatePassword = (password) => {
  const validations = [];

  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 0 };
  }

  if (password.length < 8) {
    validations.push('At least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    validations.push('At least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    validations.push('At least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    validations.push('At least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    validations.push('At least one special character');
  }

  // Calculate password strength
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  if (password.length >= 12) strength += 1;

  const strengthLabels = {
    0: 'Very Weak',
    1: 'Very Weak',
    2: 'Weak',
    3: 'Fair',
    4: 'Good',
    5: 'Strong',
    6: 'Very Strong'
  };

  const strengthColors = {
    0: 'text-red-500',
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-yellow-500',
    4: 'text-blue-500',
    5: 'text-green-500',
    6: 'text-green-600'
  };

  const isValid = validations.length === 0;
  const message = isValid ? '' : `Password must contain: ${validations.join(', ')}`;

  return {
    isValid,
    message,
    strength,
    strengthLabel: strengthLabels[strength],
    strengthColor: strengthColors[strength],
    requirements: validations
  };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true, message: '' };
};

// Form validation
export const validateAuthForm = (formData, mode) => {
  const errors = {};
  const isValidations = {};

  // Email validation
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  isValidations.email = emailValidation.isValid;

  // Password validation
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  isValidations.password = passwordValidation.isValid;

  // Password confirmation validation (only for signup)
  if (mode === 'signup') {
    const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
    if (!confirmValidation.isValid) {
      errors.confirmPassword = confirmValidation.message;
    }
    isValidations.confirmPassword = confirmValidation.isValid;

    // First name validation (required)
    if (!formData.firstName || formData.firstName.trim().length === 0) {
      errors.firstName = 'First name is required';
      isValidations.firstName = false;
    } else if (formData.firstName.length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
      isValidations.firstName = false;
    } else {
      isValidations.firstName = true;
    }

    // Last name validation (required)
    if (!formData.lastName || formData.lastName.trim().length === 0) {
      errors.lastName = 'Last name is required';
      isValidations.lastName = false;
    } else if (formData.lastName.length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
      isValidations.lastName = false;
    } else {
      isValidations.lastName = true;
    }

    // Username validation (optional)
    if (formData.username && formData.username.trim().length > 0) {
      if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
        isValidations.username = false;
      } else if (formData.username.length > 30) {
        errors.username = 'Username must be less than 30 characters';
        isValidations.username = false;
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
        isValidations.username = false;
      } else {
        isValidations.username = true;
      }
    } else {
      isValidations.username = true; // Optional field
    }
  }

  const isFormValid = Object.keys(errors).length === 0;

  return {
    isValid: isFormValid,
    errors,
    isValidations,
    passwordStrength: passwordValidation.strength,
    passwordStrengthLabel: passwordValidation.strengthLabel,
    passwordStrengthColor: passwordValidation.strengthColor,
    passwordRequirements: passwordValidation.requirements
  };
};

// Get field styling based on validation state
export const getFieldStyling = (isValid, hasValue, isTouched) => {
  if (!hasValue) {
    return 'border-gray-300 focus:ring-primary focus:border-primary';
  }

  if (!isTouched) {
    return 'border-gray-300 focus:ring-primary focus:border-primary';
  }

  if (isValid) {
    return 'border-green-500 focus:ring-green-500 focus:border-green-500';
  }

  return 'border-red-500 focus:ring-red-500 focus:border-red-500';
};

// Get field icon based on validation state
export const getFieldIcon = (isValid, hasValue, isTouched) => {
  if (!hasValue || !isTouched) {
    return null;
  }

  if (isValid) {
    return '✓';
  }

  return '✗';
};
