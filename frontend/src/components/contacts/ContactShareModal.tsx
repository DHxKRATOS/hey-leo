import React, { useState } from "react";
import { X, Check, Send, Users, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Card } from "../ui/card";
import { simulateContactShare } from "../../utils/contactHelpers";

interface ContactShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: any;
}

export function ContactShareModal({
  isOpen,
  onClose,
  contact,
}: ContactShareModalProps) {
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareWithNotes, setShareWithNotes] = useState(true);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!shareEmail.trim()) return;

    setSharing(true);
    try {
      const result = await simulateContactShare(
        shareEmail,
        contact,
        shareMessage,
        shareWithNotes
      );

      onClose();
      setShareEmail("");
      setShareMessage("");
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
        <div
          className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Share Contact
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Share {contact.name} with another professional
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-lg hover:bg-surface-hover"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Contact Preview */}
            <Card className="p-4 bg-accent/50 rounded-xl border border-border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">
                    {contact.name}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {contact.job_title} at {contact.company}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label
                htmlFor="shareEmail"
                className="text-sm font-medium text-text-primary"
              >
                Recipient Email Address
              </Label>
              <Input
                id="shareEmail"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="h-12 px-4 rounded-xl border-border focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label
                htmlFor="shareMessage"
                className="text-sm font-medium text-text-primary"
              >
                Personal Message (Optional)
              </Label>
              <Textarea
                id="shareMessage"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="I thought you'd like to connect with this contact..."
                rows={3}
                className="px-4 py-3 rounded-xl border-border focus:border-primary focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-text-primary">
                      Include your notes
                    </Label>
                    <p className="text-xs text-text-secondary">
                      Share your context and meeting notes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={shareWithNotes}
                  onCheckedChange={setShareWithNotes}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Leo User Info */}
              <div className="flex items-start space-x-3 p-4 bg-info/5 rounded-xl border border-info/20">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-info mb-1">
                    Smart Sharing
                  </h4>
                  <p className="text-xs text-text-secondary">
                    If the recipient has Leo, they'll get full access.
                    Otherwise, they'll be invited to join.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6 bg-accent/30">
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={sharing}
                className="px-6 h-12 rounded-xl border-border hover:bg-surface-hover"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={sharing || !shareEmail.trim()}
                className="px-6 h-12 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm"
              >
                {sharing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Share Contact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
