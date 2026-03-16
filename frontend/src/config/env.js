/**
 * Centralized Environment Configuration
 * 
 * Do not use process.env directly. Import this configuration object instead.
 * In Vite, environment variables are accessible via import.meta.env and MUST
 * be prefixed with VITE_.
 */

const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Investomart',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export default envConfig;
