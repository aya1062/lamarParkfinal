const fs = require('fs');
const path = require('path');

console.log('🚀 Lamar Park Setup Script');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found!');
  console.log('📝 Creating .env file from template...');
  
  const envTemplate = `# Database Configuration
MONGO_URI=mongodb://localhost:27017/lamar

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000

# Cloudinary Configuration (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret 

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Environment
NODE_ENV=development
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('📋 Please update the .env file with your actual configuration values.\n');
} else {
  console.log('✅ .env file found!\n');
}

// Check for required directories
const requiredDirs = [
  'client/public/lamar',
  'client/public/imageProperety'
];

console.log('📁 Checking required directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

console.log('\n🎯 Setup Complete!');
console.log('📋 Next steps:');
console.log('   1. Update .env file with your configuration');
console.log('   2. Run "npm install" to install dependencies');
console.log('   3. Run "cd client && npm install" to install frontend dependencies');
console.log('   4. Start MongoDB if using local database');
console.log('   5. Run "npm start" to start the backend');
console.log('   6. Run "cd client && npm run dev" to start the frontend');
console.log('\n🌐 The application will be available at:');
console.log('   - Backend: http://localhost:5000');
console.log('   - Frontend: http://localhost:3000'); 