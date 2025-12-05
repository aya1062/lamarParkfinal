require('dotenv').config();

// Validate configuration at startup
const { validateConfigAtStartup } = require('./config/validator');
const validationResult = validateConfigAtStartup({ 
  exitOnError: process.env.NODE_ENV === 'production' 
});

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

console.log('=== SERVER STARTED FROM server.js ===');

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Show configuration status in startup message
  if (validationResult.isValid) {
    console.log('✅ Configuration validation passed');
  } else {
    console.log(`⚠️  Configuration issues detected: ${validationResult.summary.totalErrors} error(s), ${validationResult.summary.totalWarnings} warning(s)`);
    if (process.env.NODE_ENV !== 'production') {
      console.log('💡 Run "node config/validate.js" for detailed configuration analysis');
    }
  }
});
