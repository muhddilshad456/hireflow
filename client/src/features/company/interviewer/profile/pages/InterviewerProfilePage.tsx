import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Camera,
  Loader2,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import {
  getMyInterviewerProfile,
  updateMyInterviewerProfile,
  setMyAvailability,
} from "../services/interviewerProfileService";
import toast from "react-hot-toast";
import { changeBasicInfo } from "../../../../user/profile/services/profileService";
import { changePasswordApi } from "../../../../shared/services/authService";

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
  capabilities: string[];
  bio: string;
  isAvailable: boolean;
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
    } catch (err) {
      console.log(err);
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
/* Complete / edit interviewer profile modal (capabilities + bio)      */
/* ------------------------------------------------------------------ */

const EditInterviewerDetailsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  current: { capabilities: string[]; bio: string };
  onSaved: () => void;
}> = ({ open, onClose, current, onSaved }) => {
  const [capabilities, setCapabilities] = useState<string[]>(
    current.capabilities,
  );
  const [tagInput, setTagInput] = useState("");
  const [bio, setBio] = useState(current.bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCapabilities(current.capabilities);
      setBio(current.bio);
      setTagInput("");
      setError(null);
    }
  }, [open, current]);

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (capabilities.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setTagInput("");
      return;
    }
    setCapabilities((prev) => [...prev, value]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setCapabilities((prev) => prev.filter((c) => c !== tag));
  };

  const handleSave = async () => {
    if (capabilities.length === 0) {
      setError("Add at least one capability.");
      return;
    }
    if (!bio.trim()) {
      setError("Add a short bio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateMyInterviewerProfile({ capabilities, bio: bio.trim() });
      toast.success("Profile updated.");
      onSaved();
      onClose();
    } catch (err) {
      console.log(err);
      setError("Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Interviewer details" onClose={onClose}>
      <div>
        <FieldLabel>Capabilities</FieldLabel>
        <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 p-2">
          {capabilities.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-emerald-500 hover:text-emerald-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type and press Enter — e.g. technical, hr"
            className="min-w-[140px] flex-1 border-none p-1 text-sm text-gray-800 outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Bio</FieldLabel>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="A short introduction interviewers on the other side of a request will see."
          className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-800 outline-none transition focus:border-emerald-400"
        />
        <p className="mt-1 text-right text-[11px] text-gray-400">
          {bio.length}/1000
        </p>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <PillButton variant="secondary" onClick={onClose}>
          Cancel
        </PillButton>
        <PillButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save details"}
        </PillButton>
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Availability confirmation modal                                     */
/* ------------------------------------------------------------------ */

const AvailabilityConfirmModal: React.FC<{
  open: boolean;
  turningOn: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}> = ({ open, turningOn, onClose, onConfirm }) => {
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={turningOn ? "Turn availability on?" : "Turn availability off?"}
      onClose={onClose}
    >
      <p className="text-sm text-gray-600">
        {turningOn
          ? "Recruiters will be able to send you interview requests while you're available."
          : "You won't receive new interview requests until you turn availability back on."}
      </p>

      <div className="mt-6 flex justify-end gap-2">
        <PillButton variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </PillButton>
        <PillButton
          variant={turningOn ? "primary" : "danger"}
          onClick={handleConfirm}
          disabled={saving}
        >
          {saving ? "Updating…" : turningOn ? "Yes, turn on" : "Yes, turn off"}
        </PillButton>
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */

export default function InterviewerProfilePage() {
  const [profile, setProfile] = useState<InterviewerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [basicInfoOpen, setBasicInfoOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [availabilityModal, setAvailabilityModal] = useState<{
    open: boolean;
    turningOn: boolean;
  }>({
    open: false,
    turningOn: false,
  });

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await getMyInterviewerProfile();
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

  const handleToggleAvailability = (turningOn: boolean) => {
    setAvailabilityModal({ open: true, turningOn });
  };

  const confirmToggleAvailability = async () => {
    try {
      if (!profile) return;
      await setMyAvailability(availabilityModal.turningOn);
      toast.success("Availability Updated.");
      await loadProfile();
    } catch (error: any) {
      console.log(error.response);
      toast.error(error.response.data);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            Interviewer Profile
          </h1>
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
          <p className="mt-1 text-xs text-gray-500">
            <span className="font-medium text-gray-700">Interviewer</span>
            {profile.companyName ? ` · ${profile.companyName}` : ""}
          </p>

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

        {/* ---- Interviewer details card ---- */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Interviewer details
            </h3>
            {profile.isProfileComplete && (
              <PillButton
                variant="outline"
                onClick={() => setDetailsOpen(true)}
              >
                Edit
              </PillButton>
            )}
          </div>

          {!profile.isProfileComplete ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-amber-50 px-4 py-6 text-center">
              <p className="text-sm text-amber-700">
                Your interviewer profile isn't complete yet. Add your
                capabilities and a short bio so recruiters can find and request
                you.
              </p>
              <PillButton onClick={() => setDetailsOpen(true)}>
                Complete profile
              </PillButton>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500">
                  Capabilities
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.capabilities.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500">Bio</p>
                <p className="mt-1 text-sm text-gray-700">{profile.bio}</p>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Availability
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile.isAvailable
                      ? "You're visible to recruiters for new interview requests."
                      : "You're currently hidden from new interview requests."}
                  </p>
                </div>
                <PillButton
                  variant={profile.isAvailable ? "danger" : "primary"}
                  onClick={() => handleToggleAvailability(!profile.isAvailable)}
                >
                  {profile.isAvailable ? "Turn off" : "Turn on"}
                </PillButton>
              </div>
            </>
          )}
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
      <EditInterviewerDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        current={{ capabilities: profile.capabilities, bio: profile.bio }}
        onSaved={loadProfile}
      />
      <AvailabilityConfirmModal
        open={availabilityModal.open}
        turningOn={availabilityModal.turningOn}
        onClose={() => setAvailabilityModal({ open: false, turningOn: false })}
        onConfirm={confirmToggleAvailability}
      />
    </>
  );
}
