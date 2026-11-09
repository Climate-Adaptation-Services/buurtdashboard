import { dev } from '$app/environment';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

// This configures the app for SPA behavior (client-side routing)
export const prerender = true;
export const ssr = false;

injectAnalytics({ mode: dev ? 'development' : 'production' });
