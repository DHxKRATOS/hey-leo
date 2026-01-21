import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Save,
  Check,
  AlertTriangle,
  UserX,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/toast";
import { settingsApi } from "../../api/settingsApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
// import { createClient } from "../../utils/supabase/client";
import { projectId } from "../../utils/supabase/info";
import { signOut } from "../../store/authSlice";
import { useAppDispatch } from "../../hooks";
interface User {
  user: any;
  id: string;
  email: string;
  name: string;
  contacts_count: number;
  cards_count: number;
}

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  plan: string;
  cards_count: number;
  contacts_count: number;
  ai_credits?: {
    used: number;
    limit: number;
  };
}

interface SecuritySectionProps {
  user: User;
}

export function SecuritySection() {
  const [userProfile, setUserProfile] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const { addToast } = useToast();
  const dispatch = useAppDispatch();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load 2FA status on mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setIsLoading(true);
      const response = await settingsApi.getProfile();
      setUserProfile(response);
      setTwoFactorEnabled(response.user.two_factor_enabled || false);
    } catch (error) {
      console.error("Error loading security settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword.trim()) {
      addToast({
        type: "error",
        title: "Validation Error",
        message: "Current password is required",
      });
      return;
    }

    if (!passwordData.newPassword.trim()) {
      addToast({
        type: "error",
        title: "Validation Error",
        message: "New password is required",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({
        type: "error",
        title: "Validation Error",
        message: "Passwords do not match",
      });
      return;
    }

    // Validate password requirements
    const requirements = getPasswordRequirements();
    const unmetRequirements = requirements.filter((req) => !req.met);
    if (unmetRequirements.length > 0) {
      addToast({
        type: "error",
        title: "Password Requirements",
        message: "Please meet all password requirements",
      });
      return;
    }

    setIsPasswordSaving(true);
    try {
      await settingsApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      addToast({
        type: "success",
        title: "Password Updated",
        message: "Your password has been successfully changed",
      });
    } catch (error: any) {
      console.error("Error saving password:", error);
      addToast({
        type: "error",
        title: "Password Change Failed",
        message:
          error.message ||
          "Failed to change password. Please check your current password and try again.",
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setIsToggling2FA(true);
    try {
      const response = await settingsApi.toggleTwoFactor(enabled);
      setTwoFactorEnabled(response.two_factor_enabled);

      addToast({
        type: "success",
        title: enabled ? "2FA Enabled" : "2FA Disabled",
        message: `Two-factor authentication has been ${
          enabled ? "enabled" : "disabled"
        }`,
      });
    } catch (error: any) {
      console.error("Error toggling 2FA:", error);
      addToast({
        type: "error",
        title: "2FA Toggle Failed",
        message:
          error.message ||
          "Failed to update two-factor authentication settings",
      });
    } finally {
      setIsToggling2FA(false);
    }
  };

  // GDPR-compliant account deletion handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      addToast({
        type: "error",
        title: "Confirmation Required",
        message: 'Please type "DELETE" to confirm account deletion',
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      await settingsApi.deleteAccount();
      await dispatch(signOut());

      addToast({
        type: "success",
        title: "Account Deleted",
        message:
          "Your account has been successfully deleted. You will be logged out shortly.",
      });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      addToast({
        type: "error",
        title: "Deletion Failed",
        message:
          error.message ||
          "Failed to delete account. Please try again or contact support.",
      });
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmationText("");
    }
  };

  // Password validation
  const getPasswordRequirements = () => {
    const password = passwordData.newPassword;
    return [
      { text: "At least 8 characters", met: password.length >= 8 },
      { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { text: "Contains number", met: /\d/.test(password) },
      {
        text: "Contains special character",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-foreground mb-6">Login & Security</h3>

        {/* Two-Factor Authentication */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-foreground font-semibold">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  Enable Two-Factor Authentication
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Secure your account with an additional authentication step"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isToggling2FA && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={isToggling2FA || isLoading}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Password Management */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="space-y-6">
            <h4 className="text-foreground">Change Password</h4>

            <div>
              <Label htmlFor="current-password" className="text-foreground">
                Current password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  placeholder="Enter current password"
                  className="bg-input-background border-border pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password" className="text-foreground">
                  New password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    placeholder="Enter new password"
                    className="bg-input-background border-border pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-foreground">
                  Confirm password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="bg-input-background border-border pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            {passwordData.newPassword && (
              <div className="space-y-2">
                <Label className="text-foreground">Password requirements</Label>
                <div className="space-y-1">
                  {getPasswordRequirements().map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.met ? "bg-success" : "bg-muted"
                        }`}
                      >
                        {req.met && (
                          <Check className="w-3 h-3 text-success-foreground" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          req.met ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleSavePassword}
              disabled={
                isPasswordSaving ||
                isLoading ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isPasswordSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* GDPR Danger Zone - Delete Account */}
        <Card className="p-6 bg-card border-destructive">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h4 className="text-foreground font-semibold">Danger Zone</h4>
                <p className="text-sm text-muted-foreground">
                  Irreversible actions that will permanently affect your account
                </p>
              </div>
            </div>

            <Separator className="bg-destructive/20" />

            <div className="space-y-4">
              <div>
                <h5 className="text-foreground font-medium mb-2">
                  Delete Account
                </h5>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your Leo account and all associated data.
                  This action cannot be undone and will:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4 ml-4">
                  <li>• Delete all your digital business cards</li>
                  <li>• Remove all contact information and interactions</li>
                  <li>• Cancel your subscription and stop all billing</li>
                  <li>• Delete your AI assistant training data</li>
                  <li>• Remove all analytics and insights</li>
                  <li>• Permanently delete your account within 30 days</li>
                </ul>
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning-foreground">
                    <strong>GDPR Compliance:</strong> In accordance with data
                    protection regulations, your data will be permanently
                    deleted within 30 days. You can contact support within 24
                    hours to recover your account if deleted by mistake.
                  </p>
                </div>
              </div>

              <AlertDialog
                open={showDeleteConfirmation}
                onOpenChange={setShowDeleteConfirmation}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-2xl">
                  <AlertDialogHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <AlertDialogTitle className="text-left">
                          Delete Account Permanently
                        </AlertDialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>

                    <AlertDialogDescription className="text-left space-y-4">
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                        <h4 className="font-semibold text-destructive mb-2">
                          ⚠️ Final Warning
                        </h4>
                        <p className="text-sm text-foreground">
                          You are about to permanently delete your account{" "}
                          <strong>{userProfile?.user?.email}</strong> and all
                          associated data.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-medium text-foreground">
                          What will be deleted:
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-destructive rounded-full"></div>
                            <span>
                              {userProfile?.user?.cards_count || 0} digital
                              business cards
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-destructive rounded-full"></div>
                            <span>
                              {userProfile?.user?.contacts_count || 0} contacts
                              & interactions
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-destructive rounded-full"></div>
                            <span>All AI assistant training data</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-destructive rounded-full"></div>
                            <span>Analytics and insights</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-destructive rounded-full"></div>
                            <span>Subscription and billing data</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-destructive rounded-full"></div>
                            <span>Account settings & preferences</span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                          <p className="text-sm text-info-foreground">
                            <strong>Data Protection:</strong> Your data will be
                            permanently deleted within 30 days in compliance
                            with GDPR and other data protection regulations.
                            Contact support within 24 hours if you need to
                            recover your account.
                          </p>
                        </div>

                        <div className="mt-4">
                          <Label
                            htmlFor="delete-confirmation"
                            className="text-foreground"
                          >
                            Type <strong>DELETE</strong> to confirm account
                            deletion:
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmationText}
                            onChange={(e) =>
                              setDeleteConfirmationText(e.target.value)
                            }
                            placeholder="DELETE"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={
                        deleteConfirmationText !== "DELETE" || isDeletingAccount
                      }
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      {isDeletingAccount ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-destructive-foreground border-t-transparent"></div>
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        "Delete Account Permanently"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
