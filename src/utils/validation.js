// Client-side validation utilities

export const validateMobile = (mobile) => {
  if (!mobile || mobile.trim() === '') {
    return 'Mobile number is required';
  }

  // Remove any spaces or special characters for validation
  const cleanMobile = mobile.replace(/\s+/g, '').replace(/[-()]/g, '');

  // Check if it's exactly 10 digits
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(cleanMobile)) {
    return 'Please enter a valid 10-digit mobile number';
  }

  return null; // Valid
};

export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (password.length > 14) {
    return 'Password must be at most 14 characters long';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  return null; // Valid
};

export const validateAmount = (amount, minAmount = 1, maxAmount = 100000) => {
  if (!amount || amount === '') {
    return 'Amount is required';
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return 'Please enter a valid amount';
  }

  if (numAmount < minAmount) {
    return `Amount must be at least ₹${minAmount}`;
  }

  if (numAmount > maxAmount) {
    return `Amount cannot exceed ₹${maxAmount}`;
  }

  // Check if it's a whole number (no decimals for rupees)
  if (numAmount !== Math.floor(numAmount)) {
    return 'Amount must be a whole number';
  }

  return null; // Valid
};

export const validateAnswer = (answer) => {
  if (!answer || answer.trim() === '') {
    return 'Please enter an answer';
  }

  // Check if it's a valid number
  const numAnswer = parseFloat(answer);
  if (isNaN(numAnswer)) {
    return 'Answer must be a number';
  }

  // Check for reasonable bounds (math quiz answers shouldn't be extremely large)
  if (Math.abs(numAnswer) > 1000000000) {
    return 'Answer seems too large. Please check your calculation.';
  }

  return null; // Valid
};

export const validateEntryFee = (fee, walletBalance) => {
  if (!fee || fee <= 0) {
    return 'Please select a valid entry fee';
  }

  if (walletBalance < fee) {
    return 'Insufficient wallet balance for this entry fee';
  }

  return null; // Valid
};

// Sanitization functions
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags
};

export const sanitizeMobile = (mobile) => {
  if (!mobile) return '';
  return mobile.replace(/\s+/g, '').replace(/[^0-9]/g, '');
};

// Form validation helpers
export const validateForm = (fields, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(fieldName => {
    const rule = validationRules[fieldName];
    const value = fields[fieldName];
    const error = rule(value, fields);

    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Real-time validation helper
export const getFieldError = (fieldName, value, validationRule, allFields = {}) => {
  if (!validationRule) return null;
  return validationRule(value, allFields);
};
