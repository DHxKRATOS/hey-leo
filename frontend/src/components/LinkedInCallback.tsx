import React, { useEffect } from 'react';

export function LinkedInCallback() {
  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'LINKEDIN_OAUTH_ERROR',
        error: errorDescription || error,
      }, window.location.origin);
    } else if (code && state) {
      // Send success to parent window
      window.opener?.postMessage({
        type: 'LINKEDIN_OAUTH_SUCCESS',
        code,
        state,
      }, window.location.origin);
    } else {
      // Send generic error
      window.opener?.postMessage({
        type: 'LINKEDIN_OAUTH_ERROR',
        error: 'Invalid callback parameters',
      }, window.location.origin);
    }

    // Close the popup
    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Processing LinkedIn authentication...</p>
      </div>
    </div>
  );
}
