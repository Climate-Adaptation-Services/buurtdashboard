// Fix for SvelteKit client routing and WebSocket token errors
if (typeof window !== 'undefined') {
  // Define required SvelteKit variables if they don't exist
  if (typeof __SVELTEKIT_CLIENT_ROUTING__ === 'undefined') {
    window.__SVELTEKIT_CLIENT_ROUTING__ = true;
  }
  
  if (typeof __SVELTEKIT_CSR__ === 'undefined') {
    window.__SVELTEKIT_CSR__ = true;
  }
  
  // Handle WebSocket token issues
  if (typeof __WS_TOKEN__ === 'undefined') {
    window.__WS_TOKEN__ = 'disabled';
  }
}
