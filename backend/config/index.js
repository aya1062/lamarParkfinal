/**
 * Centralized Configuration Management
 * 
 * Simple function-based configuration management with proper defaults,
 * type coercion, and validation.
 * 
 * @module Config
 */

const { validateConfig } = require('./validator');

/**
 * Configuration schema with defaults and type coercion
 */
const CONFIG_SCHEMA = {
  // Server Configuration
  NODE_ENV: {
    type: 'string',
    defaultValue: 'development',
    allowedValues: ['development', 'production', 'test']
  },
  PORT: {
    type: 'number',
    defaultValue: 5000,
    coerce: (value) => parseInt(value, 10) || 5000
  },
  
  // Database Configuration
  MONGODB_URI: {
    type: 'string',
    defaultValue: 'mongodb://localhost:27017/lamar-booking'
  },
  
  // URL Configuration
  BACKEND_URL: {
    type: 'string',
    defaultValue: 'http://localhost:5000'
  },
  FRONTEND_URL: {
    type: 'string', 
    defaultValue: 'http://localhost:3000'
  },
  
  // ARB Payment Gateway Configuration
  ARB_TRANPORTAL_ID: {
    type: 'string',
    required: true,
    sensitive: true
  },
  ARB_TRANPORTAL_PASSWORD: {
    type: 'string',
    required: true,
    sensitive: true
  },
  ARB_RESOURCE_KEY: {
    type: 'string',
    required: true,
    sensitive: true
  },
  ARB_TRANPORTAL_URL: {
    type: 'string',
    required: true,
    defaultValue: 'https://securepayments.neoleap.com.sa/pg/payment/hosted.htm'
  },
  ARB_PAYMENT_URL: {
    type: 'string',
    defaultValue: 'https://securepayments.neoleap.com.sa/pg/payment/hosted.htm'
  },
  ARB_RESPONSE_URL: {
    type: 'string',
    // Will be auto-generated from BACKEND_URL if not provided
  },
  ARB_ERROR_URL: {
    type: 'string',
    // Will be auto-generated from BACKEND_URL if not provided
  },
  
  // JWT Configuration
  JWT_SECRET: {
    type: 'string',
    defaultValue: 'default-secret-change-in-production',
    sensitive: true
  },
  JWT_EXPIRES_IN: {
    type: 'string',
    defaultValue: '7d'
  },
  
  // Cloudinary Configuration (optional)
  CLOUDINARY_CLOUD_NAME: {
    type: 'string',
    sensitive: false
  },
  CLOUDINARY_API_KEY: {
    type: 'string',
    sensitive: true
  },
  CLOUDINARY_API_SECRET: {
    type: 'string',
    sensitive: true
  }
};

// Load and process configuration
let _config = null;
let _validationResult = null;

function loadConfig(env = process.env) {
  _config = {};
  
  // Process each configuration field
  for (const [key, schema] of Object.entries(CONFIG_SCHEMA)) {
    const envValue = env[key];
    let value;
    
    // Use environment value if provided
    if (envValue !== undefined && envValue !== '') {
      value = schema.coerce ? schema.coerce(envValue) : envValue;
    }
    // Otherwise use default value
    else if (schema.defaultValue !== undefined) {
      value = schema.defaultValue;
    }
    // Required field without value
    else if (schema.required) {
      value = undefined; // Will be caught in validation
    }
    // Optional field without value
    else {
      value = undefined;
    }
    
    _config[key] = value;
  }
  
  // Auto-generate values
  autoGenerateValues();
  
  // Validate configuration
  _validationResult = validateConfig(_config);
}

/**
 * Auto-generate configuration values based on other settings
 * @private
 */
function autoGenerateValues() {
  // Auto-generate ARB callback URLs if not provided
  if (!_config.ARB_RESPONSE_URL && _config.BACKEND_URL) {
    _config.ARB_RESPONSE_URL = `${_config.BACKEND_URL}/api/payment/response`;
  }
  
  if (!_config.ARB_ERROR_URL && _config.BACKEND_URL) {
    _config.ARB_ERROR_URL = `${_config.BACKEND_URL}/api/payment/response`;
  }
}

/**
 * Get configuration value
 * @param {string} key - Configuration key
 * @returns {*} Configuration value
 */
function get(key) {
  if (!_config) loadConfig();
  
  if (!(key in CONFIG_SCHEMA)) {
    console.warn(`⚠️ Accessing unknown configuration key: ${key}`);
  }
  return _config[key];
}

/**
 * Check if configuration value exists and is not empty
 * @param {string} key - Configuration key
 * @returns {boolean} Whether value exists
 */
function has(key) {
  if (!_config) loadConfig();
  
  const value = _config[key];
  return value !== undefined && value !== null && value !== '';
}

/**
 * Get all configuration (with sensitive values masked)
 * @param {boolean} [includeSensitive=false] - Whether to include sensitive values
 * @returns {Object} Configuration object
 */
function getAll(includeSensitive = false) {
  if (!_config) loadConfig();
  
  if (includeSensitive) {
    return { ..._config };
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(_config)) {
    const schema = CONFIG_SCHEMA[key];
    if (schema && schema.sensitive && value) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Get ARB-specific configuration
 * @returns {Object} ARB configuration object
 */
function getARBConfig() {
  return {
    tranportalId: get('ARB_TRANPORTAL_ID'),
    password: get('ARB_TRANPORTAL_PASSWORD'),
    resourceKey: get('ARB_RESOURCE_KEY'),
    tranportalUrl: get('ARB_TRANPORTAL_URL'),
    paymentUrl: get('ARB_PAYMENT_URL'),
    responseUrl: get('ARB_RESPONSE_URL'),
    errorUrl: get('ARB_ERROR_URL')
  };
}

/**
 * Check if ARB configuration is complete
 * @returns {boolean} Whether ARB is properly configured
 */
function isARBConfigured() {
  const required = ['ARB_TRANPORTAL_ID', 'ARB_TRANPORTAL_PASSWORD', 'ARB_RESOURCE_KEY', 'ARB_TRANPORTAL_URL'];
  return required.every(key => has(key));
}

/**
 * Get validation result
 * @returns {ValidationResult} Configuration validation result
 */
function getValidationResult() {
  if (!_validationResult) loadConfig();
  return _validationResult;
}

/**
 * Check if configuration is valid
 * @returns {boolean} Whether configuration is valid
 */
function isValid() {
  const result = getValidationResult();
  return result ? result.isValid : false;
}

/**
 * Get environment name
 * @returns {string} Environment name
 */
function getEnvironment() {
  return get('NODE_ENV');
}

/**
 * Check if running in production
 * @returns {boolean} Whether in production environment
 */
function isProduction() {
  return getEnvironment() === 'production';
}

/**
 * Check if running in development
 * @returns {boolean} Whether in development environment
 */
function isDevelopment() {
  return getEnvironment() === 'development';
}

/**
 * Get configuration summary for logging
 * @returns {Object} Configuration summary
 */
function getSummary() {
  const validation = getValidationResult();
  return {
    environment: getEnvironment(),
    port: get('PORT'),
    arbConfigured: isARBConfigured(),
    cloudinaryConfigured: has('CLOUDINARY_CLOUD_NAME') && has('CLOUDINARY_API_KEY') && has('CLOUDINARY_API_SECRET'),
    validationStatus: {
      isValid: isValid(),
      errors: validation ? validation.summary.totalErrors : 0,
      warnings: validation ? validation.summary.totalWarnings : 0
    }
  };
}

// Initialize configuration on module load
loadConfig();

module.exports = {
  get,
  has,
  getAll,
  getARBConfig,
  isARBConfigured,
  getValidationResult,
  isValid,
  getEnvironment,
  isProduction,
  isDevelopment,
  getSummary
};