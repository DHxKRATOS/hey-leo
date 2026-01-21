import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import cardApi from "../../api/cardApi";
import { useAppDispatch } from "../../hooks";
import { setCurrentCard } from "../../store/cardSlice";
import { ContactCaptureModal } from "../ContactCaptureModal";
import { EndUserView } from "../EndUserView";

export const EndUserPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const dispatch = useAppDispatch();

  // Track unique visitors using localStorage
  const getVisitorKey = (profileLink: string) => `visited_${profileLink}`;

  const hasVisitedBefore = useCallback((profileLink: string) => {
    try {
      return localStorage.getItem(getVisitorKey(profileLink)) === "true";
    } catch {
      return false;
    }
  }, []);

  const markAsVisited = useCallback((profileLink: string) => {
    try {
      localStorage.setItem(getVisitorKey(profileLink), "true");
    } catch {
      // Silently fail if localStorage is not available
    }
  }, []);

  // Track view for analytics
  const trackView = useCallback(
    async (cardId: string) => {
      if (hasTrackedView) return;

      try {
        await cardApi.incrementViews(cardId);
        await cardApi.incrementLeads(cardId);
        setHasTrackedView(true);
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    },
    [hasTrackedView]
  );

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res: any = await cardApi.getByProfileLink(username);
        dispatch(setCurrentCard(res));
        setCardData(res);

        // Track view for analytics
        if (res.id) {
          await trackView(res.id);
        }

        // Track unique visitor
        if (res.card_profile_link && !hasVisitedBefore(res.card_profile_link)) {
          markAsVisited(res.card_profile_link);
        }

        // Show contact capture modal if enabled and user hasn't submitted before
        if (res.contact_capture_enabled) {
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch card", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchCard();
  }, [username, dispatch, trackView, hasVisitedBefore, markAsVisited]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!cardData) return <div className="p-8">Card not found</div>;

  return (
    <>
      <EndUserView cardData={cardData} device="" isPreview={false} />

      {/* Contact Modal */}
      <ContactCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardProfileLink={cardData.card_profile_link}
        headerMessage={cardData.contact_capture_header_message}
        allowSkip={cardData.contact_capture_allow_skip}
        fields={cardData.contact_capture_fields || []}
        cardOwnerName={`${cardData.first_name} ${cardData.last_name}`}
      />
    </>
  );
};
