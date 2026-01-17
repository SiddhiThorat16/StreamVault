// frontend/src/components/Share/ShareModal.jsx
import { useState, useEffect } from "react";
import {
  Share2,
  Mail,
  Link,
  UserPlus,
  Lock,
  Eye,
  Edit3,
  Copy,
  X,
  Check,
  CheckCircle,
} from "lucide-react";
import axios from "axios"; // Add axios import

const ShareModal = ({ file, onClose }) => {
  const [permissions, setPermissions] = useState("private");
  const [permissionLevel, setPermissionLevel] = useState("viewer");
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareToken, setShareToken] = useState(null);

  // Generate or fetch share token
  const generateShareLink = () => {
    if (shareToken) {
      return `${window.location.origin}/share/${file._id}?token=${shareToken}`;
    }
    return `${window.location.origin}/share/${file._id}`;
  };

  // Copy link to clipboard
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink || generateShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create share link via API
  const createShare = async () => {
    setLoading(true);
    try {
      const payload = {
        resourceType: "file",
        resourceId: file._id,
        granteeUserId: null, // Will be null for public links, handled by LinkShare model
        role: permissionLevel,
      };

      const response = await axios.post("/api/shares", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setShareToken(response.data.shareId);
      setShareLink(response.data.shareUrl);
      setEmails([]);
      setEmail("");

      // Auto-copy new link
      await copyLink();
    } catch (error) {
      console.error("Share creation failed:", error);
      alert(
        "Failed to create share: " +
          (error.response?.data?.error?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Send email invite
  const sendEmailInvite = async () => {
    if (!email.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `/api/files/${file._id}/share`,
        {
          emails: [email.trim()],
          permission: permissionLevel,
          isPublic: false,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setEmail("");
      alert("Email invite sent successfully!");
    } catch (error) {
      alert(
        "Failed to send email: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle email input (comma-separated)
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Parse emails for preview
    const parsed = value
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    setEmails(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Share "{file.name}"
              </h2>
              <p className="text-sm text-gray-500">
                {(file.size_bytes / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Permissions Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 block">
            Who can access
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPermissions("private")}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                permissions === "private"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <Lock className="h-5 w-5 mx-auto mb-1" />
              <div className="text-xs font-medium">Private</div>
              <div className="text-xs">Only you</div>
            </button>
            <button
              onClick={() => setPermissions("public")}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                permissions === "public"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <Eye className="h-5 w-5 mx-auto mb-1" />
              <div className="text-xs font-medium">Public</div>
              <div className="text-xs">Anyone with link</div>
            </button>
          </div>
        </div>

        {/* Permission Level */}
        {permissions === "public" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="flex items-center space-x-2 text-sm font-medium text-blue-900 mb-2">
              <Edit3 className="h-4 w-4" />
              Permission level
            </label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value)}
              className="w-full p-3 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="viewer">Can view</option>
              <option value="editor">Can edit</option>
            </select>
          </div>
        )}

        {/* Email Sharing */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            Invite by email
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="name@example.com (or comma separate multiple)"
              value={email}
              onChange={handleEmailChange}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              onClick={sendEmailInvite}
              disabled={!email.trim() || loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          {emails.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {emails.map((e, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Share Link */}
        {permissions === "public" && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Link className="h-4 w-4 text-gray-500" />
              Shareable link
            </label>
            <div className="relative">
              <input
                readOnly
                value={shareLink || generateShareLink()}
                onFocus={() => !shareLink && setShareLink(generateShareLink())}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                onClick={copyLink}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-xl transition-all"
                disabled={loading}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>Link copied to clipboard!</span>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          {permissions === "public" && (
            <button
              onClick={createShare}
              disabled={loading || !shareToken}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : shareToken ? (
                "Update Share"
              ) : (
                "Create Link"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
