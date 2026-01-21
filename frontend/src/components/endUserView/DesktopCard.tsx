import { Building2, Download, MapPin, Share, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { mockCardData } from "../../utils/endUserViewConstants";
import { Button } from "../ui/button";
import { useAppSelector } from "../../hooks";

interface DesktopCardProps {
  cardData?: any;
  onAskAI: () => void;
  onShare: () => void;
  onDownload: () => void;
  onSocialClick: (link: (typeof mockCardData.socialLinks)[0]) => void;
}

export function DesktopCard({
  cardData,
  onAskAI,
  onShare,
  onDownload,
  onSocialClick,
}: DesktopCardProps) {
  const { currentCard: data } = useAppSelector((state) => state.cards);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-[900px] mx-auto"
    >
      {/* Gradient Orb Background */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, #F26522 0%, transparent 70%)",
        }}
      />

      {/* Main Card Container */}
      <div
        className="relative bg-white rounded-3xl p-20 shadow-2xl border border-gray-100"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div className="flex items-start gap-16">
          {/* Left Column - Profile Photo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <img
                src={`http://localhost:1337${data?.card_profile_image?.url}`}
                alt={data?.first_name}
                className="w-48 h-48 rounded-3xl object-cover"
                style={{ boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)" }}
              />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                <span className="text-2xl">🦁</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <div className="flex-1 space-y-8">
            {/* Name & Title */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <h1
                className="text-5xl font-bold tracking-tight"
                style={{
                  fontSize: "48px",
                  lineHeight: "52px",
                  color: "#1D1D1F",
                  letterSpacing: "-0.02em",
                }}
              >
                {data?.first_name + data?.last_name}{" "}
              </h1>
              <h2
                className="text-2xl font-semibold"
                style={{
                  fontSize: "24px",
                  color: "#F26522",
                  letterSpacing: "-0.01em",
                }}
              >
                {data?.job_title}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                {data?.company ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{data?.company}</span>
                  </div>
                ) : null}
                {data?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{data?.location}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent" />

            {/* Bio */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p
                className="leading-relaxed"
                style={{
                  fontSize: "16px",
                  lineHeight: "28px",
                  color: "#1D1D1F",
                  letterSpacing: "-0.01em",
                }}
              >
                {data?.description}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <Button
                onClick={onAskAI}
                className="h-12 px-8 text-white font-semibold text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #F26522 0%, #E85A17 100%)",
                  border: "none",
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />✨ Ask AI
              </Button>

              <Button
                variant="outline"
                onClick={onShare}
                className="h-12 px-6 font-medium rounded-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={onDownload}
                className="h-12 px-6 font-medium rounded-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Save Contact
              </Button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              {Object.keys(data?.custom_links || [])
                .slice(0, 6)
                .map((link, index) => (
                  <motion.button
                    key={link.platform || link.name || index}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSocialClick(link)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all duration-200"
                    style={{
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {typeof link.icon === "string" ? (
                      <span className="text-lg">{link.icon}</span>
                    ) : link.icon ? (
                      React.createElement(link.icon, {
                        className: "w-5 h-5 text-gray-700",
                      })
                    ) : (
                      <span className="text-lg">🔗</span>
                    )}
                  </motion.button>
                ))}
            </motion.div>

            {/* Powered by Leo */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center justify-center gap-2 pt-4"
            >
              <span
                className="text-xs font-medium"
                style={{
                  color: "#9B9B9B",
                  letterSpacing: "0.025em",
                }}
              >
                powered by
              </span>
              <span
                className="text-xs font-semibold"
                style={{
                  color: "#F26522",
                  letterSpacing: "0.025em",
                }}
              >
                🦁 leo
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
