import axios from 'axios';

// OAuth configuration
const OAUTH_CONFIG = {
  google: {
    clientId: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback`,
    scope: 'openid email profile',
  },
  linkedin: {
    clientId: (import.meta as any).env?.VITE_LINKEDIN_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback`,
    scope: 'r_liteprofile r_emailaddress',
  },
};

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'linkedin';
  isNewUser: boolean;
  socialData: {
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
    company?: string;
    jobTitle?: string;
    location?: string;
    bio?: string;
  };
  subscription?: any;
}

class OAuthService {
  private apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:1337/api';

  // Google OAuth using Google Identity Services
  async signInWithGoogle(): Promise<OAuthUser> {
    return new Promise((resolve, reject) => {
      // Load Google Identity Services script if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => this.initializeGoogleAuth(resolve, reject);
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
      } else {
        this.initializeGoogleAuth(resolve, reject);
      }
    });
  }

  private initializeGoogleAuth(resolve: (user: OAuthUser) => void, reject: (error: Error) => void) {
    if (!OAUTH_CONFIG.google.clientId) {
      reject(new Error('Google Client ID not configured. Please check your environment variables.'));
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: OAUTH_CONFIG.google.clientId,
        callback: async (response: any) => {
          try {
            if (!response.credential) {
              throw new Error('No credential received from Google');
            }
            const user = await this.handleGoogleCallback(response.credential);
            resolve(user);
          } catch (error) {
            console.error('Google callback error:', error);
            reject(error as Error);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Use renderButton for more reliable authentication
      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'fixed';
      buttonContainer.style.top = '-9999px';
      buttonContainer.style.left = '-9999px';
      document.body.appendChild(buttonContainer);

      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300,
        click_listener: () => {
          // Button clicked, authentication will proceed
        }
      });

      // Trigger the button click
      setTimeout(() => {
        const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          button.click();
        } else {
          // Fallback to prompt
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              reject(new Error('Google sign-in was cancelled or blocked'));
            }
          });
        }
        // Clean up
        setTimeout(() => {
          if (document.body.contains(buttonContainer)) {
            document.body.removeChild(buttonContainer);
          }
        }, 1000);
      }, 100);

    } catch (error) {
      console.error('Google initialization error:', error);
      reject(new Error('Failed to initialize Google authentication'));
    }
  }

  private async handleGoogleCallback(idToken: string): Promise<OAuthUser> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/auth/google/callback`, {
        idToken,
      });

      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google authentication failed');
    }
  }

  // LinkedIn OAuth using OAuth 2.0
  async signInWithLinkedIn(): Promise<OAuthUser> {
    if (!OAUTH_CONFIG.linkedin.clientId) {
      throw new Error('LinkedIn Client ID not configured');
    }

    // Generate state parameter for security
    const state = this.generateRandomString(32);
    sessionStorage.setItem('linkedin_oauth_state', state);

    // Build LinkedIn authorization URL
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', OAUTH_CONFIG.linkedin.clientId);
    authUrl.searchParams.append('redirect_uri', OAUTH_CONFIG.linkedin.redirectUri);
    authUrl.searchParams.append('scope', OAUTH_CONFIG.linkedin.scope);
    authUrl.searchParams.append('state', state);

    // Open LinkedIn authorization in a popup
    return new Promise((resolve, reject) => {
      const popup = window.open(
        authUrl.toString(),
        'linkedin-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Failed to open LinkedIn authorization popup'));
        return;
      }

      // Listen for the callback
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('LinkedIn authorization was cancelled'));
        }
      }, 1000);

      // Listen for messages from the popup
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'LINKEDIN_OAUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup.close();

          try {
            const user = await this.handleLinkedInCallback(event.data.code, event.data.state);
            resolve(user);
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'LINKEDIN_OAUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error || 'LinkedIn authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  private async handleLinkedInCallback(code: string, state: string): Promise<OAuthUser> {
    // Verify state parameter
    const storedState = sessionStorage.getItem('linkedin_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    sessionStorage.removeItem('linkedin_oauth_state');

    try {
      // Exchange code for access token and get user data
      const tokenResponse = await this.exchangeLinkedInCode(code);
      const userData = await this.getLinkedInUserData(tokenResponse.access_token);

      // Send to backend
      const response = await axios.post(`${this.apiBaseUrl}/auth/linkedin/callback`, {
        code,
        accessToken: tokenResponse.access_token,
        userData,
      });

      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'LinkedIn authentication failed');
    }
  }

  private async exchangeLinkedInCode(code: string) {
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: OAUTH_CONFIG.linkedin.clientId,
      client_secret: (import.meta as any).env?.VITE_LINKEDIN_CLIENT_SECRET || '',
      redirect_uri: OAUTH_CONFIG.linkedin.redirectUri,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  }

  private async getLinkedInUserData(accessToken: string) {
    // Get basic profile
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/people/~:(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Get email
    const emailResponse = await axios.get(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const profile = profileResponse.data;
    const email = emailResponse.data.elements?.[0]?.['handle~']?.emailAddress;

    return {
      id: profile.id,
      localizedFirstName: profile.localizedFirstName,
      localizedLastName: profile.localizedLastName,
      email,
      profilePicture: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
    };
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Global type declarations
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export const oauthService = new OAuthService();
