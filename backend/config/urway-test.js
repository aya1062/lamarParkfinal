// URWAY Test Configuration
// هذه بيانات تجريبية - يجب استبدالها ببياناتك الحقيقية من URWAY

const URWAY_TEST_CONFIG = {
  test: {
    baseUrl: 'https://payments-dev.urway-tech.com/URWAYPGService',
    terminalId: 'test_terminal_123', // استبدل ب Terminal ID الحقيقي
    password: 'test_password_123', // استبدل ب Password الحقيقي
    secretKey: 'test_secret_key_123' // استبدل ب Secret Key الحقيقي
  },
  production: {
    baseUrl: 'https://payments.urway-tech.com/URWAYPGService',
    terminalId: 'prod_terminal_123', // استبدل ب Terminal ID الحقيقي
    password: 'prod_password_123', // استبدل ب Password الحقيقي
    secretKey: 'prod_secret_key_123' // استبدل ب Secret Key الحقيقي
  }
};

module.exports = URWAY_TEST_CONFIG; 