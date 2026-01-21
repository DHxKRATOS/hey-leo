import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { setCredentials } from "../store/authSlice";
import { LinkedInCallback } from "./LinkedInCallback";

const STRAPI_URL = "http://localhost:1337";

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const authenticateWithGoogle = async (
    idToken: string,
    accessToken: string
  ) => {
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, accessToken }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Google authentication failed");
      }

      const data = await res.json();

      // Save JWT token
      localStorage.setItem("token", data.jwt);

      // Update Redux state
      dispatch(
        setCredentials({
          user: data.user,
          token: data.jwt,
        })
      );

      return data.user;
    } catch (err) {
      console.error("Google authentication error:", err);
      throw err;
    }
  };

  const authenticateWithLinkedIn = async (code: string) => {
    try {
      // For LinkedIn, we need to exchange the code for user data
      // This would typically involve calling LinkedIn's API
      // For now, we'll simulate this process
      const res = await fetch(`${STRAPI_URL}/api/auth/linkedin/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "LinkedIn authentication failed");
      }

      const data = await res.json();

      // Save JWT token
      localStorage.setItem("token", data.jwt);

      // Update Redux state
      dispatch(
        setCredentials({
          user: data.user,
          token: data.jwt,
        })
      );

      return data.user;
    } catch (err) {
      console.error("LinkedIn authentication error:", err);
      throw err;
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const idToken = params.get("id_token");
        const accessToken = params.get("access_token");
        const code = params.get("code");
        const state = params.get("state");
        const provider =
          params.get("provider") || (idToken ? "google" : "linkedin");

        if (provider === "google" && idToken && accessToken) {
          const user = await authenticateWithGoogle(idToken, accessToken);

          // Navigate to onboarding with social import data
          navigate("/onboarding", {
            state: {
              socialImportData: {
                provider: "google",
                importedData: user.socialData,
              },
            },
          });
        } else if (provider === "linkedin" && code) {
          const user = await authenticateWithLinkedIn(code);

          // Navigate to onboarding with social import data
          navigate("/onboarding", {
            state: {
              socialImportData: {
                provider: "linkedin",
                importedData: user.socialData,
              },
            },
          });
        } else {
          throw new Error("Invalid callback parameters");
        }
      } catch (err) {
        console.error("Authentication callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, dispatch]);

  // Check if this is a LinkedIn popup callback
  // const params = new URLSearchParams(window.location.search);
  // if (window.opener && (params.get("code") || params.get("error"))) {
  //   return <LinkedInCallback />;
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Authentication Error
          </div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// const handleCallback = async () => {
//   try {
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get("code");
//     const state = params.get("state");
//     const error = params.get("error");

//     // Check if this is a LinkedIn callback in a popup window
//     if (window.opener && (code || error)) {
//       // This is the LinkedIn popup callback - render the LinkedInCallback component
//       return;
//     }

//     // Handle regular OAuth callbacks
//     if (error) {
//       throw new Error(params.get("error_description") || error);
//     }

//     if (code && state) {
//       const user = await authenticateWithLinkedIn(code);

//       // Navigate based on whether user is new or existing
//       if (user.isNewUser) {
//         navigate("/onboarding", {
//           state: {
//             socialImportData: {
//               provider: "linkedin",
//               importedData: user.socialData,
//             },
//           },
//         });
//       } else {
//         navigate("/dashboard");
//       }
//     } else {
//       throw new Error("Invalid callback parameters");
//     }
//   } catch (err) {
//     console.error("Authentication callback error:", err);
//     setError(err instanceof Error ? err.message : "Authentication failed");
//   } finally {
//     setLoading(false);
//   }
// };
