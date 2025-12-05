#!/usr/bin/env node

/**
 * Configuration Validation CLI Tool
 * 
 * Validates application configuration and can be run standalone or integrated
 * into the application startup process.
 * 
 * Usage:
 *   node config/validate.js                    # Validate and report
 *   node config/validate.js --exit-on-error    # Exit with code 1 if errors
 *   node config/validate.js --silent           # No console output
 *   node config/validate.js --arb-only         # Validate only ARB config
 */

const { validateConfigAtStartup, validateARBConfig, validateGeneralConfig } = require('./validator');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  exitOnError: args.includes('--exit-on-error'),
  silent: args.includes('--silent'),
  arbOnly: args.includes('--arb-only'),
  generalOnly: args.includes('--general-only')
};

function main() {
  let result;
  
  if (options.arbOnly) {
    result = validateARBConfig();
    if (!options.silent) {
      console.log('🔧 ARB Configuration Validation');
      console.log('================================');
    }
  } else if (options.generalOnly) {
    result = validateGeneralConfig();
    if (!options.silent) {
      console.log('🔧 General Configuration Validation');
      console.log('===================================');
    }
  } else {
    result = validateConfigAtStartup(options);
  }
  
  // Exit with appropriate code
  const exitCode = result.isValid ? 0 : 1;
  
  if (!options.silent) {
    if (result.isValid) {
      console.log('✅ Configuration validation completed successfully!');
    } else {
      console.log(`❌ Configuration validation failed with ${result.summary.totalErrors} error(s)`);
    }
  }
  
  if (options.exitOnError) {
    process.exit(exitCode);
  }
  
  return result;
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = main;