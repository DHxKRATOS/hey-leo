import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PreLaunchPageProps {
  onNavigateToHome?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToBlog?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToCookies?: () => void;
}

export function PreLaunchPage({
  // onNavigateToHome,
  onNavigateToAbout,
  onNavigateToPricing,
  // onNavigateToBlog,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToCookies,
}: PreLaunchPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  // Trigger animations on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        // import.meta.env.VITE_APP_GOOGLE_SCRIPT_URL,
        "https://script.google.com/macros/s/AKfycbxXOWvbRXIcn_CS0a_H131_9Cfm_GBIS2e5pX537QM35gWheMKWbHUeqSpQYtzOIKXY/exec",
        new URLSearchParams({ Email: email }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to submit email");
      }

      setIsSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Error submitting email:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsSubmitted(false), 4000);
    }
  };

  const handleNavigateToBlogPage = () => {
    // navigate("https://ghost.heyleo.ai/");
    // window.open("https://ghost.heyleo.ai/", "_blank");
    // window.open("/blogs/");
    // navigate("/blogs/");
    window.location.href = `${window.location.origin}/blogs/`;
  };

  const handleNavigateToHome = () => {
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-white flex flex-col relative overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="orb orb-1"
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(242, 101, 34, 0.3) 0%, transparent 70%)",
            top: "-200px",
            right: "-100px",
            borderRadius: "50%",
            filter: "blur(40px)",
            opacity: "0.4",
            animation: "float 20s infinite ease-in-out",
          }}
        />
        <div
          className="orb orb-2"
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(242, 101, 34, 0.2) 0%, transparent 70%)",
            bottom: "-150px",
            left: "-100px",
            borderRadius: "50%",
            filter: "blur(40px)",
            opacity: "0.4",
            animation: "float 20s infinite ease-in-out",
            animationDelay: "10s",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center px-8 py-6">
        {/* Back to Site button - positioned at top right */}
        <div className="w-full flex justify-end mb-4">
          {/* <button
            onClick={handleNavigateToHome}
            className="text-gray-400 hover:text-black transition-colors duration-200 text-sm font-medium"
          >
            Back to Site
          </button> */}
        </div>

        {/* Centered Logo */}
        <div
          className={`logo flex items-center gap-3 ${
            mounted ? "animate-fadeInDown" : "opacity-0"
          }`}
          style={{
            animationDelay: "0s",
            marginBottom: "0",
          }}
        >
          <div
            className="logo-icon w-14 h-14 flex items-center justify-center relative overflow-hidden"
            style={{
              backgroundColor: "#F26522",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #F26522 0%, #E05511 100%)",
              boxShadow: "0 4px 16px rgba(242, 101, 34, 0.3)",
              animation: "subtle-pulse 3s ease-in-out infinite",
            }}
          >
            <span
              className="text-white select-none"
              style={{ fontSize: "28px" }}
            >
              🦁
            </span>
          </div>
          <span
            className="text-black select-none"
            style={{
              fontSize: "36px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            leo
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Enhanced Headlines */}
          <h1
            className={`text-black mb-6 ${
              mounted ? "animate-fadeInUp" : "opacity-0"
            }`}
            style={{
              fontSize: window.innerWidth <= 640 ? "36px" : "56px",
              fontWeight: "800",
              lineHeight: "1.1",
              letterSpacing: "-0.03em",
              maxWidth: "800px",
              margin: "0 auto 24px",
              animationDelay: "0.2s",
              animationFillMode: "both",
            }}
          >
            The world's first{" "}
            <span
              className="highlight"
              style={{ color: "#F26522", fontWeight: "600" }}
            >
              AI-powered
            </span>{" "}
            business card.
          </h1>

          <p
            className={`subtitle text-gray-500 mb-12 ${
              mounted ? "animate-fadeInUp" : "opacity-0"
            }`}
            style={{
              fontSize: window.innerWidth <= 640 ? "18px" : "21px",
              fontWeight: "400",
              color: "#666666",
              lineHeight: "1.4",
              maxWidth: "600px",
              margin: "0 auto",
              animationDelay: "0.3s",
              animationFillMode: "both",
            }}
          >
            Be first to experience AI-powered business cards that work while you
            sleep.
          </p>

          {/* Enhanced Email Form */}
          <div
            className={`${mounted ? "animate-fadeInUp" : "opacity-0"}`}
            style={{
              animationDelay: "0.4s",
              animationFillMode: "both",
            }}
          >
            {!isSubmitted ? (
              <form
                onSubmit={handleEmailSubmit}
                className="email-form"
                style={{
                  display: "flex",
                  gap: "12px",
                  maxWidth: "480px",
                  margin: "48px auto 0",
                  alignItems: "center",
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="email-input flex-1 transition-all duration-300 focus:outline-none disabled:opacity-60"
                  style={{
                    height: "56px",
                    padding: "0 24px",
                    fontSize: "17px",
                    border: "2px solid #E5E5E7",
                    borderRadius: "12px",
                    background: "#FFFFFF",
                    color: "#000",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F26522";
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(242, 101, 34, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E5E7";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="submit-btn relative overflow-hidden transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:transform-none"
                  style={{
                    height: "56px",
                    padding: "0 32px",
                    whiteSpace: "nowrap",
                    fontSize: "17px",
                    borderRadius: "12px",
                    backgroundColor: "#F26522",
                    fontWeight: "600",
                    letterSpacing: "0.02em",
                    boxShadow: "0 4px 12px rgba(242, 101, 34, 0.3)",
                    border: "none",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(242, 101, 34, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(242, 101, 34, 0.3)";
                    }
                  }}
                >
                  {isLoading ? (
                    <div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />
                  ) : (
                    "Notify Me"
                  )}
                </button>
              </form>
            ) : (
              <div
                className="success-message text-center"
                style={{
                  marginTop: "20px",
                  padding: "16px 24px",
                  background: "rgba(52, 199, 89, 0.1)",
                  border: "1px solid rgba(52, 199, 89, 0.3)",
                  borderRadius: "8px",
                  color: "#2E7D32",
                  fontWeight: "500",
                  animation: "slideInUp 0.3s ease",
                }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
                  style={{ animation: "bounce-subtle 0.6s ease-out" }}
                >
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
                <p>✓ You're on the list! We'll notify you first.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer
        className="footer-links relative z-10"
        style={{
          padding: "32px",
          marginTop: "auto",
        }}
      >
        <div
          className="flex justify-center gap-10"
          style={{ fontSize: "15px" }}
        >
          <button
            onClick={handleNavigateToBlogPage}
            className="footer-link text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium relative"
            style={{ textDecoration: "none" }}
          >
            Blog
          </button>
          <a
            href="https://substack.com/@heyleoai"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium relative"
            style={{ textDecoration: "none" }}
          >
            Substack
          </a>
          <a
            href="https://www.linkedin.com/company/heyleo/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium relative"
            style={{ textDecoration: "none" }}
          >
            LinkedIn
          </a>
        </div>
      </footer>

      {/* Enhanced Custom Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Text selection styling */
          ::selection {
            background: rgba(242, 101, 34, 0.2);
            color: #1D1D1F;
          }
          
          /* Animation keyframes */
          @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(30px, -30px); }
            66% { transform: translate(-20px, 20px); }
          }
          
          @keyframes subtle-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes fadeInDown {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInUp {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes bounce-subtle {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0, 0, 0);
            }
            40%, 43% {
              transform: translate3d(0, -8px, 0);
            }
            70% {
              transform: translate3d(0, -4px, 0);
            }
            90% {
              transform: translate3d(0, -2px, 0);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Animation classes */
          .animate-fadeInDown {
            animation: fadeInDown 0.8s ease-out;
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out;
          }
          
          /* Footer link hover animation */
          .footer-link::after {
            content: '';
            display: block;
            width: 0;
            height: 1px;
            background: #F26522;
            transition: width 0.3s ease;
            position: absolute;
            bottom: -4px;
            left: 0;
          }
          
          .footer-link:hover::after {
            width: 100%;
          }
          
          /* Email input placeholder styling */
          .email-input::placeholder {
            color: #999999;
          }

          /* Mobile Responsive Styles */
          @media (max-width: 640px) {
            .logo {
              margin-bottom: 60px !important;
            }
            
            .email-form {
              flex-direction: column;
              width: 100%;
              padding: 0 20px;
              gap: 12px !important;
            }
            
            .email-input,
            .submit-btn {
              width: 100% !important;
            }
            
            .footer-links .flex {
              gap: 32px !important;
            }
          }
        `,
        }}
      />
    </div>
  );
}
