import React from "react";
import { motion } from "motion/react";
import { Share, Download, Sparkles, Building2, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { mockCardData } from "../../utils/endUserViewConstants";
import { useAppSelector } from "../../hooks";

interface TabletCardProps {
  cardData?: any;
  onAskAI: () => void;
  onShare: () => void;
  onDownload: () => void;
  onSocialClick: (link: (typeof mockCardData.socialLinks)[0]) => void;
}

export function TabletCard({
  cardData,
  onAskAI,
  onShare,
  onDownload,
  onSocialClick,
}: TabletCardProps) {
  // Use provided cardData or fallback to mock data
  const { currentCard: data } = useAppSelector((state) => state.cards);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-[600px] mx-auto"
    >
      {/* Gradient Orb Background */}
      <div
        className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-60 h-60 rounded-full opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, #F26522 0%, transparent 70%)",
        }}
      />

      {/* Main Card Container */}
      <div
        className="relative bg-white rounded-3xl p-12 shadow-2xl border border-gray-100"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div className="text-center space-y-8">
          {/* Profile Photo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative inline-block"
          >
            <img
              src={`http://localhost:1337${data?.card_profile_image?.url}`}
              alt={data?.first_name}
              className="w-40 h-40 rounded-3xl object-cover mx-auto"
              style={{ boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)" }}
            />
            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-100">
              <span className="text-xl">🦁</span>
            </div>
          </motion.div>

          {/* Name & Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-3"
          >
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{
                color: "#1D1D1F",
                letterSpacing: "-0.02em",
              }}
            >
              {data?.first_name + data?.last_name}
            </h1>
            <h2
              className="text-xl font-semibold"
              style={{
                color: "#F26522",
                letterSpacing: "-0.01em",
              }}
            >
              {data?.job_title}
            </h2>
            <div className="flex items-center justify-center gap-4 text-gray-600">
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
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto" />

          {/* Bio */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p
              className="leading-relaxed text-center max-w-md mx-auto"
              style={{
                fontSize: "15px",
                lineHeight: "26px",
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              {data?.description?.slice(0, 200)}
              ...
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <Button
              onClick={onAskAI}
              className="h-12 px-8 text-white font-semibold text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #F26522 0%, #E85A17 100%)",
                border: "none",
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />✨ Ask AI
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onShare}
                className="h-10 px-5 font-medium rounded-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={onDownload}
                className="h-10 px-5 font-medium rounded-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center gap-3"
          >
            {Object.keys(data?.custom_links || [])
              .slice(0, 5)
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
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
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
    </motion.div>
  );
}
