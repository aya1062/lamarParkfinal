/**
 * Configuration Validation Module
 * 
 * Validates application configuration at startup, especially ARB payment gateway
 * settings. Provides detailed validation results and helpful error messages.
 * 
 * @module ConfigValidator
 */

/**
 * ARB Configuration Requirements
 */
const ARB_CONFIG_REQUIREMENTS = {
  ARB_TRANPORTAL_ID: {
    required: true,
    description: 'Terminal ID from Al Rajhi Bank',
    validation: (value) => {
      if (!value || typeof value !== 'string') return 'Must be a non-empty string';
      if (value.length < 8) return 'Should be at least 8 characters long';
      return null;
    }
  },
  ARB_TRANPORTAL_PASSWORD: {
    required: true,
    description: 'Password from Al Rajhi Bank',
    validation: (value) => {
      if (!value || typeof value !== 'string') return 'Must be a non-empty string';
      if (value.length < 8) return 'Should be at least 8 characters long';
      return null;
    }
  },
  ARB_RESOURCE_KEY: {
    required: true,
    description: 'AES encryption key (32 bytes or 64 hex characters)',
    validation: (value) => {
      if (!value || typeof value !== 'string') return 'Must be a non-empty string';
      
      // Check if it's 32 bytes (raw key)
      if (value.length === 32) return null;
      
      // Check if it's 64 hex characters
      if (value.length === 64 && /^[0-9a-fA-F]+$/.test(value)) return null;
      
      return `Invalid format: expected 32 bytes or 64 hex characters, got ${value.length} characters`;
    }
  },
  ARB_TRANPORTAL_URL: {
    required: true,
    description: 'ARB API endpoint URL',
    validation: (value) => {
      if (!value || typeof value !== 'string') return 'Must be a non-empty string';
      if (!/^https?:\/\/.+/.test(value)) return 'Must be a valid HTTP/HTTPS URL';
      return null;
    }
  },
  ARB_PAYMENT_URL: {
    required: false,
    description: 'ARB hosted payment page URL (fallback to TRANPORTAL_URL if not provided)',
    validation: (value) => {
      if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid HTTP/HTTPS URL';
      return null;
    }
  },
  ARB_RESPONSE_URL: {
    required: false,
    description: 'Payment response callback URL (auto-generated if not provided)',
    validation: (value) => {
      if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid HTTP/HTTPS URL';
      return null;
    }
  },
  ARB_ERROR_URL: {
    required: false,
    description: 'Payment error callback URL (auto-generated if not provided)',
    validation: (value) => {
      if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid HTTP/HTTPS URL';
      return null;
    }
  }
};

/**
 * General Configuration Requirements
 */
const GENERAL_CONFIG_REQUIREMENTS = {
  BACKEND_URL: {
    required: false,
    description: 'Backend server URL for callback generation',
    defaultValue: 'http://localhost:5000',
    validation: (value) => {
      if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid HTTP/HTTPS URL';
      return null;
    }
  },
  FRONTEND_URL: {
    required: false,
    description: 'Frontend application URL for redirects',
    defaultValue: 'http://localhost:3000',
    validation: (value) => {
      if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid HTTP/HTTPS URL';
      return null;
    }
  },
  NODE_ENV: {
    required: false,
    description: 'Node environment (development, production, test)',
    defaultValue: 'development',
    validation: (value) => {
      const validEnvs = ['development', 'production', 'test'];
      if (value && !validEnvs.includes(value)) {
        return `Must be one of: ${validEnvs.join(', ')}`;
      }
      return null;
    }
  }
};

/**
 * Configuration validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether all validation passed
 * @property {Array<Object>} errors - Array of validation errors
 * @property {Array<Object>} warnings - Array of validation warnings
 * @property {Object} summary - Summary of validation results
 */

/**
 * Validate a single configuration value
 * @private
 * @param {string} key - Configuration key
 * @param {*} value - Configuration value
 * @param {Object} requirements - Requirements object
 * @returns {{error?: string, warning?: string}} Validation result
 */
function validateConfigValue(key, value, requirements) {
  const req = requirements[key];
  if (!req) return {}; // Unknown key, skip validation

  // Check required fields
  if (req.required && (!value || value === '')) {
    return { error: `Required field missing: ${key} - ${req.description}` };
  }

  // Skip validation for empty optional fields
  if (!req.required && (!value || value === '')) {
    return {};
  }

  // Run custom validation if provided
  if (req.validation) {
    const validationError = req.validation(value);
    if (validationError) {
      return { error: `${key}: ${validationError}` };
    }
  }

  return {};
}

/**
 * Validate ARB payment gateway configuration
 * @param {Object} [env=process.env] - Environment variables object
 * @returns {ValidationResult} Validation results
 */
function validateARBConfig(env = process.env) {
  const errors = [];
  const warnings = [];

  // Validate each ARB configuration field
  for (const [key, requirements] of Object.entries(ARB_CONFIG_REQUIREMENTS)) {
    const result = validateConfigValue(key, env[key], ARB_CONFIG_REQUIREMENTS);
    if (result.error) errors.push({ field: key, message: result.error });
    if (result.warning) warnings.push({ field: key, message: result.warning });
  }

  // Check for localhost URLs in production
  if (env.NODE_ENV === 'production') {
    const localhostFields = ['ARB_RESPONSE_URL', 'ARB_ERROR_URL', 'BACKEND_URL'];
    for (const field of localhostFields) {
      const value = env[field];
      if (value && (value.includes('localhost') || value.includes('127.0.0.1'))) {
        warnings.push({
          field,
          message: `${field} uses localhost in production environment - this may not be accessible to ARB`
        });
      }
    }
  }

  // Check for HTTPS in production
  if (env.NODE_ENV === 'production') {
    const urlFields = ['ARB_RESPONSE_URL', 'ARB_ERROR_URL'];
    for (const field of urlFields) {
      const value = env[field];
      if (value && !value.startsWith('https://')) {
        warnings.push({
          field,
          message: `${field} should use HTTPS in production for security`
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      requiredFields: Object.keys(ARB_CONFIG_REQUIREMENTS).filter(k => ARB_CONFIG_REQUIREMENTS[k].required),
      configuredFields: Object.keys(ARB_CONFIG_REQUIREMENTS).filter(k => env[k]),
      missingRequired: errors.filter(e => e.message.includes('Required field missing')),
      totalErrors: errors.length,
      totalWarnings: warnings.length
    }
  };
}

/**
 * Validate general application configuration
 * @param {Object} [env=process.env] - Environment variables object
 * @returns {ValidationResult} Validation results
 */
function validateGeneralConfig(env = process.env) {
  const errors = [];
  const warnings = [];

  // Validate each general configuration field
  for (const [key, requirements] of Object.entries(GENERAL_CONFIG_REQUIREMENTS)) {
    const result = validateConfigValue(key, env[key], GENERAL_CONFIG_REQUIREMENTS);
    if (result.error) errors.push({ field: key, message: result.error });
    if (result.warning) warnings.push({ field: key, message: result.warning });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      configuredFields: Object.keys(GENERAL_CONFIG_REQUIREMENTS).filter(k => env[k]),
      totalErrors: errors.length,
      totalWarnings: warnings.length
    }
  };
}

/**
 * Validate complete application configuration
 * @param {Object} [env=process.env] - Environment variables object
 * @returns {ValidationResult} Combined validation results
 */
function validateConfig(env = process.env) {
  const arbResult = validateARBConfig(env);
  const generalResult = validateGeneralConfig(env);

  return {
    isValid: arbResult.isValid && generalResult.isValid,
    errors: [...arbResult.errors, ...generalResult.errors],
    warnings: [...arbResult.warnings, ...generalResult.warnings],
    summary: {
      arb: arbResult.summary,
      general: generalResult.summary,
      totalErrors: arbResult.errors.length + generalResult.errors.length,
      totalWarnings: arbResult.warnings.length + generalResult.warnings.length
    }
  };
}

/**
 * Print formatted validation results to console
 * @param {ValidationResult} result - Validation results
 * @param {boolean} [exitOnError=false] - Whether to exit process on validation errors
 */
function printValidationResults(result, exitOnError = false) {
  console.log('\\n🔧 Configuration Validation Results:');
  console.log('=====================================');

  if (result.isValid) {
    console.log('✅ All configuration validation passed!');
  } else {
    console.log('❌ Configuration validation failed!');
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log('\\n🚨 Errors:');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.message}`);
    });
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('\\n⚠️  Warnings:');
    result.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning.message}`);
    });
  }

  // Print summary
  console.log('\\n📊 Summary:');
  console.log(`   Total Errors: ${result.summary.totalErrors}`);
  console.log(`   Total Warnings: ${result.summary.totalWarnings}`);
  
  if (result.summary.arb) {
    console.log(`   ARB Required Fields: ${result.summary.arb.requiredFields.length}`);
    console.log(`   ARB Configured Fields: ${result.summary.arb.configuredFields.length}`);
  }

  console.log('');

  if (exitOnError && !result.isValid) {
    console.error('❌ Exiting due to configuration errors. Please fix the above issues and restart.');
    process.exit(1);
  }
}

/**
 * Validate configuration and optionally exit on errors
 * Convenience function for startup validation
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.exitOnError=false] - Exit process on validation errors
 * @param {boolean} [options.silent=false] - Don't print results to console
 * @param {Object} [options.env=process.env] - Environment variables to validate
 * @returns {ValidationResult} Validation results
 */
function validateConfigAtStartup(options = {}) {
  const { exitOnError = false, silent = false, env = process.env } = options;
  
  const result = validateConfig(env);
  
  if (!silent) {
    printValidationResults(result, exitOnError);
  }
  
  return result;
}

module.exports = {
  validateARBConfig,
  validateGeneralConfig,
  validateConfig,
  printValidationResults,
  validateConfigAtStartup,
  ARB_CONFIG_REQUIREMENTS,
  GENERAL_CONFIG_REQUIREMENTS
};