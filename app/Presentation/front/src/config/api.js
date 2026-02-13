/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints and authentication.
 * All environment variables must be prefixed with VITE_ to be accessible in Vite.
 */

// Validate required environment variables
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_AUTH_PASSWORD: import.meta.env.VITE_AUTH_PASSWORD,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(', ')}\n` +
    `Please check your .env.local file and ensure all variables are set.`
  );
}

// API Configuration
export const API_CONFIG = {
  // Supabase API
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Application settings
  AUTH_PASSWORD: import.meta.env.VITE_AUTH_PASSWORD || '',
  
  // API Headers (constructed from config)
  getHeaders: () => ({
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }),
  
  // Full API URL
  getApiUrl: (endpoint = '') => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    // Remove trailing slash from base URL and leading slash from endpoint
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return cleanEndpoint ? `${cleanBaseUrl}/${cleanEndpoint}` : cleanBaseUrl;
  },
};

// Export individual values for convenience
export const API_URL = API_CONFIG.SUPABASE_URL;
export const API_HEADERS = API_CONFIG.getHeaders();
export const AUTH_PASSWORD = API_CONFIG.AUTH_PASSWORD;

// Helper function to get full API endpoint URL
export const getApiEndpoint = (endpoint) => API_CONFIG.getApiUrl(endpoint);
