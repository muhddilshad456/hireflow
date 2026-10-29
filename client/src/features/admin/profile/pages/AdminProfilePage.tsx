import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Camera,
  Loader2,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMyAdminProfile } from "../services/AdminProfileService";
import { changePasswordApi } from "../../../shared/services/authService";
import { changeBasicInfo } from "../../../user/profile/services/profileService";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface InterviewerProfileData {
  _id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture: string | null;
  companyName?: string;
  isProfileComplete: boolean;
  signupDate?: string;
}

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

const PillButton: React.FC<{
  variant?: "primary" | "secondary" | "danger" | "outline";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ variant = "primary", onClick, disabled, className = "", children }) => {
  const base =
    "rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    secondary: "border border-gray-200 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-400 text-white hover:bg-red-500",
    outline: "border border-emerald-500 text-emerald-600 hover:bg-emerald-50",
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="mb-1.5 block text-xs font-medium text-gray-600">
    {children}
  </label>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-emerald-400 ${props.className ?? ""}`}
  />
);

/* ------------------------------------------------------------------ */
/* Edit basic info modal (name + profile picture only — no email)      */
/* ------------------------------------------------------------------ */

const EditBasicInfoModal: React.FC<{
  open: boolean;
  onClose: () => void;
  current: { name: string; profilePicture: string | null };
  onSaved: () => void;
}> = ({ open, onClose, current, onSaved }) => {
  const [name, setName] = useState(current.name);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(current.profilePicture);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(current.name);
      setPreview(current.profilePicture);
      setFile(null);
      setError(null);
    }
  }, [open, current]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (file) formData.append("avatar", file);
      await changeBasicInfo(formData);
      toast.success("Basic Profile Updated.");
      onSaved();
      onClose();
    } catch (err: any) {
      console.log(err?.response);
      setError("Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Edit basic info" onClose={onClose}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100"
            style={
              preview
                ? {
                    backgroundImage: `url(${preview})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!preview && <UserIcon className="h-8 w-8 text-gray-400" />}
          </div>
          <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow">
            <Camera className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      <div className="mt-5">
        <FieldLabel>Name</FieldLabel>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <PillButton variant="secondary" onClick={onClose}>
          Cancel
        </PillButton>
        <PillButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </PillButton>
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Change password modal                                               */
/* ------------------------------------------------------------------ */

const ChangePasswordModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await changePasswordApi({ currentPassword, newPassword });
      toast.success("Password Changed.");
      setSuccess(true);
    } catch (err: any) {
      console.log(err);
      setError(err?.response?.data?.message ?? "Couldn't change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Change password" onClose={onClose}>
      {success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <ShieldCheck className="h-8 w-8 text-emerald-500" />
          <p className="text-sm text-gray-700">
            Password updated successfully.
          </p>
          <PillButton onClick={onClose}>Done</PillButton>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <FieldLabel>Current password</FieldLabel>
              <TextInput
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>New password</FieldLabel>
              <TextInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Confirm new password</FieldLabel>
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          <div className="mt-6 flex justify-end gap-2">
            <PillButton variant="secondary" onClick={onClose}>
              Cancel
            </PillButton>
            <PillButton onClick={handleSave} disabled={saving}>
              {saving ? "Updating…" : "Update password"}
            </PillButton>
          </div>
        </>
      )}
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<InterviewerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [basicInfoOpen, setBasicInfoOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await getMyAdminProfile();
      setProfile(res.data ?? res);
    } catch (err) {
      console.log(err);
      setError("Couldn't load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F2]">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F2] px-4">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-sm text-red-600">
          {error ?? "Something went wrong."}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ---- Top bar ---- */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* ---- Page header ---- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        </div>

        {/* ---- Identity card ---- */}
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center">
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 bg-cover bg-center"
            style={
              profile.profilePicture
                ? { backgroundImage: `url(${profile.profilePicture})` }
                : undefined
            }
          >
            {!profile.profilePicture && (
              <UserIcon className="h-10 w-10 text-gray-400" />
            )}
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {profile.name}
          </h2>
          <p className="text-sm text-emerald-600">{profile.email}</p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <PillButton
              variant="secondary"
              onClick={() => setBasicInfoOpen(true)}
            >
              Edit basic info
            </PillButton>
            <PillButton
              variant="secondary"
              onClick={() => setPasswordOpen(true)}
            >
              Change password
            </PillButton>
          </div>
        </div>
      </div>

      {/* ---- Modals ---- */}
      <EditBasicInfoModal
        open={basicInfoOpen}
        onClose={() => setBasicInfoOpen(false)}
        current={{ name: profile.name, profilePicture: profile.profilePicture }}
        onSaved={loadProfile}
      />
      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </>
  );
}
