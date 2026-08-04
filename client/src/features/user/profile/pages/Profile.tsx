import { useState, useRef, useEffect } from "react";
import { Header } from "../../shared/components/Header";
import { fetchProfile } from "../../../shared/services/profileService";
import {
  changeEmail,
  changePasswordApi,
  logoutApi,
} from "../../../shared/services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  addProfileItem,
  addResumeData,
  addSkill,
  changeBasicInfo,
  changeBasicProfile,
  deleteSkill,
  removeProfileItem,
  updateProfileItem,
} from "../services/profileService";
import { useAppDispatch, useAppSelector } from "../../../../hooks/reduxHooks";
import { logout } from "../../../../redux/slice/authSlice";

// ─── Types ────────────────────────────────────────────────────────────────────
type TempProfile = {
  name: string;
  file: File | null;
  preview: string;
};

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  years?: number;
  description?: string;
}

interface JobPreference {
  role: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  location: string;
  workMode: "ONSITE" | "REMOTE" | "HYBRID";
  expectedSalary?: number;
}

interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear?: number;
}

interface Resume {
  id: string;
  name: string;
  isDefault: boolean;
}

interface CoverLetter {
  id: string;
  title: string;
  content: string;
}

interface ContactEntry {
  id: string;
  value: string;
}

export interface Profile {
  profilePicture?: string;

  phone?: string;
  location?: string;
  summary?: string;

  skills: string[];

  education?: {
    id: string;
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number;
  }[];

  experience: {
    id: string;
    title: string;
    company: string;
    years?: number;
    description?: string;
  }[];

  jobPreference?: JobPreference;

  resumes: {
    id: string;
    url: string;
    name: string;
    isDefault: boolean;
    uploadedAt: string;
  }[];

  coverLetters: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }[];

  profileCompleted: boolean;
}

const activityStats = { ongoing: 3, hired: 1, rejected: 1 };

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function isProfileComplete(p: Profile | null): boolean {
  if (!p) return false;

  return !!(
    p.phone &&
    p.phone.length > 0 &&
    p.location &&
    p.location.length > 0 &&
    p.summary &&
    p.summary.length > 0 &&
    p.skills &&
    p.skills.length > 0 &&
    p.education &&
    p.experience &&
    p.experience.length > 0 &&
    p.resumes &&
    p.resumes.length > 0
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  confirmClass = "bg-red-500 hover:bg-red-600",
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <p className="text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg text-white font-medium ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium">
      {label}
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-600 font-bold leading-none"
      >
        &minus;
      </button>
    </span>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-orange-100 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function GreenBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1 rounded-full transition-colors"
    >
      {children}
    </button>
  );
}

function RedBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-full transition-colors"
    >
      {children}
    </button>
  );
}

function OrangeBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-1 rounded-full transition-colors"
    >
      {children}
    </button>
  );
}

function PlusBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center text-lg leading-none transition-colors"
    >
      +
    </button>
  );
}

// ─── Label/Value display row ──────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  onEdit,
  onDelete,
}: {
  label: string;
  value: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-gray-700 text-sm font-medium truncate">{value}</p>
      </div>
      <div className="flex gap-1.5 ml-3 shrink-0">
        <GreenBtn onClick={onEdit}>Edit</GreenBtn>
        <RedBtn onClick={onDelete}>Delete</RedBtn>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Edit profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState<TempProfile>({
    name: "",
    file: null,
    preview: "",
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Summary
  const [editSummaryOpen, setEditSummaryOpen] = useState(false);
  const [tempSummary, setTempSummary] = useState("");

  // Phone
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [tempPhone, setTempPhone] = useState("");

  // Location
  const [editLocOpen, setEditLocOpen] = useState(false);
  const [tempLoc, setTempLoc] = useState("");

  // Skills
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [tempSkill, setTempSkill] = useState("");

  // Education
  const [addEduOpen, setAddEduOpen] = useState(false);
  const [editEdu, setEditEdu] = useState<Education | null>(null);
  const [deleteEduId, setDeleteEduId] = useState<string | null>(null);
  const [tempEdu, setTempEdu] = useState<Omit<Education, "id">>({
    degree: "",
    fieldOfStudy: "",
    institution: "",
    graduationYear: undefined,
  });

  // Job Preferences
  const [editJPOpen, setEditJPOpen] = useState(false);
  const [editJP, setEditJP] = useState<JobPreference | null>(null);
  const [deleteJPId, setDeleteJPId] = useState<string | null>(null);
  const [tempJP, setTempJP] = useState<Omit<JobPreference, "id">>({
    role: "",
    type: "FULL_TIME",
    location: "",
    workMode: "ONSITE",
    expectedSalary: 0,
  });

  // Experience
  const [addExpOpen, setAddExpOpen] = useState(false);
  const [editExpOpen, setEditExpOpen] = useState<Experience | null>(null);
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null);
  const [tempExp, setTempExp] = useState<Omit<Experience, "id">>({
    title: "",
    company: "",
    years: undefined,
    description: "",
  });

  // Resume
  const [addResumeOpen, setAddResumeOpen] = useState(false);
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(
    null,
  );
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Cover Letter
  const [addCLOpen, setAddCLOpen] = useState(false);
  const [editCL, setEditCL] = useState<CoverLetter | null>(null);
  const [deleteCLId, setDeleteCLId] = useState<string | null>(null);
  const [tempCL, setTempCL] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  // Logout
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Change Email
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [tempEmailConfirm, setTempEmailConfirm] = useState("");
  const [emailError, setEmailError] = useState("");

  // Change Password
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [tempCurrentPassword, setTempCurrentPassword] = useState("");
  const [tempNewPassword, setTempNewPassword] = useState("");
  const [tempConfirmPassword, setTempConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

  const incomplete = !isProfileComplete(profile);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);

  const getProfile = async () => {
    try {
      const result = await fetchProfile();
      console.log("result for fetch user profile : ", result);
      setUser({
        id: result?.data?.user?.id,
        name: result?.data?.user?.name,
        email: result?.data?.user?.email,
        profilePicture: result?.data?.user?.profilePicture,
      });
      const profileData = result?.data?.profile;
      if (profileData) {
        setProfile({
          ...profileData,

          experience: profileData?.experience?.map((exp: any) => ({
            ...exp,
            id: exp._id,
          })),

          education: profileData?.education?.map((edu: any) => ({
            ...edu,
            id: edu._id,
          })),

          resumes: profileData?.resumes?.map((res: any) => ({
            ...res,
            id: res._id,
          })),

          coverLetters: profileData?.coverLetters?.map((cl: any) => ({
            ...cl,
            id: cl._id,
          })),
        });
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      console.log(error?.response);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  // change email

  const handleChangeEmail = async () => {
    if (!tempEmail.trim()) return setEmailError("Please enter a new email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempEmail))
      return setEmailError("Please enter a valid email address.");
    if (tempEmail !== tempEmailConfirm)
      return setEmailError("Emails do not match.");

    try {
      console.log("temp email : ", tempEmail);
      const result = await changeEmail({ newEmail: tempEmail });
      console.log(result);
      setChangeEmailOpen(false);
      navigate("/verify-email", { state: { email: tempEmail } });
    } catch (error: any) {
      console.log(error);
    }
  };

  // change password

  const handleChangePassword = async () => {
    if (!tempCurrentPassword)
      return setPasswordError("Please enter your current password.");
    if (tempNewPassword.length < 8)
      return setPasswordError("New password must be at least 8 characters.");
    if (tempNewPassword !== tempConfirmPassword)
      return setPasswordError("Passwords do not match.");
    try {
      const result = await changePasswordApi({
        currentPassword: tempCurrentPassword,
        newPassword: tempNewPassword,
      });
      console.log("result of change password : ", result);
      toast.success("Password changed successfully.");
      setChangePasswordOpen(false);
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  // ── Edit Profile ──
  const openEditProfile = () => {
    setTempProfile({
      name: user?.name ?? "",
      file: null,
      preview: user?.profilePicture ?? "",
    });

    setEditProfileOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setTempProfile((p) => ({
      ...p,
      file: file,
      preview: previewUrl,
    }));
  };

  const handleProfileChange = async () => {
    const formData = new FormData();

    formData.append("name", tempProfile.name);

    if (tempProfile.file) {
      formData.append("avatar", tempProfile.file);
    }

    try {
      const res = await changeBasicInfo(formData);
      toast.success("Profile edited successfully.");
      console.log("Success:", res.data);
      getProfile();
    } catch (error: any) {
      console.error(error?.response);
      toast.error(error?.response?.data?.message);
    } finally {
      setEditProfileOpen(false);
    }
  };

  // ── Summary ──
  const openEditSummary = () => {
    setTempSummary(profile?.summary ?? "");
    setEditSummaryOpen(true);
  };
  const handleChangeSummery = async () => {
    try {
      const result = await changeBasicProfile({ summary: tempSummary });
      console.log(result);
      toast.success("Summery changed successfully.");
      getProfile();
      setEditSummaryOpen(false);
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
    setEditSummaryOpen(false);
  };

  // ── Phone ──
  const openEditPhone = () => {
    setTempPhone(profile?.phone ?? "");
    setEditPhoneOpen(true);
  };

  const handleChangePhone = async () => {
    try {
      const result = await changeBasicProfile({ phone: tempPhone });
      console.log(result);
      toast.success("Phone changed successfully.");
      getProfile();
      setEditPhoneOpen(false);
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
    setEditSummaryOpen(false);
  };

  // ── Location ──
  const openEditLocation = () => {
    setTempLoc(profile?.location ?? "");
    setEditLocOpen(true);
    console.log(profile);
  };

  const handleChangeLoc = async () => {
    try {
      const result = await changeBasicProfile({ location: tempLoc });
      console.log(result);
      toast.success("Location changed successfully.");
      getProfile();
      setEditLocOpen(false);
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  // ── Skills ──
  const saveAddSkill = async () => {
    console.log("temp skill : ", tempSkill);
    if (!tempSkill.trim()) {
      console.log("temp skill is empty.");
      return;
    }
    try {
      const result = await addSkill({ skill: tempSkill });
      toast.success("Skill added successfully.");
      setTempSkill("");
      getProfile();
      setAddSkillOpen(false);
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };
  const removeSkill = (s: string) => {
    setSkillToDelete(s);
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) {
      console.log("skill of delete is empty");
      return;
    }
    console.log(skillToDelete);
    try {
      const result = await deleteSkill(skillToDelete);
      console.log(result);
      toast.success("Skill deleted successfully.");
      setSkillToDelete(null);
      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  // ── Education ──
  const openAddEdu = () => {
    setTempEdu({
      degree: "",
      fieldOfStudy: "",
      institution: "",
      graduationYear: undefined,
    });
    setAddEduOpen(true);
  };
  const openEditEdu = (edu: Education) => {
    setEditEdu(edu);
    setTempEdu({
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      institution: edu.institution,
      graduationYear: edu.graduationYear,
    });
  };
  const saveEdu = async () => {
    try {
      if (editEdu) {
        const result = await updateProfileItem(
          "education",
          editEdu.id,
          tempEdu,
        );
        console.log("Education update result:", result);
        toast.success("Education updated.");
      } else {
        const result = await addProfileItem("education", tempEdu);
        console.log("Education add result:", result);
        toast.success("Education added.");
      }

      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setEditEdu(null);
      setAddEduOpen(false);
    }
  };
  const confirmDeleteEdu = async () => {
    if (!deleteEduId) {
      console.log("id required");
      return;
    }
    try {
      const result = await removeProfileItem("education", deleteEduId);
      toast.success("Education deleted successfully.");
      setDeleteEduId(null);
      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  // ── Job Preferences ──
  const openEditJP = () => {
    setTempJP({
      role: profile?.jobPreference?.role ?? "",
      type: profile?.jobPreference?.type ?? "FULL_TIME",
      location: profile?.jobPreference?.location ?? "",
      workMode: profile?.jobPreference?.workMode ?? "ONSITE",
      expectedSalary: profile?.jobPreference?.expectedSalary ?? 0,
    });
    setEditJPOpen(true);
  };

  const handleChangeJP = async () => {
    try {
      const result = await changeBasicProfile({ jobPreference: tempJP });
      console.log(result);
      toast.success("Job preference changed successfully.");
      getProfile();
      setEditJPOpen(false);
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };
  const confirmDeleteJP = () => {
    setDeleteJPId(null);
  };

  // ── Experience ──
  const openAddExp = () => {
    setTempExp({ title: "", company: "", years: 0, description: "" });
    setAddExpOpen(true);
  };
  const openEditExp = (exp: Experience) => {
    setEditExpOpen(exp);
    setTempExp({
      title: exp.title,
      company: exp.company,
      years: exp.years,
      description: exp.description ?? "",
    });
  };
  const saveExp = async () => {
    try {
      if (editExpOpen) {
        // Editing an existing experience — call PATCH with its _id
        const result = await updateProfileItem(
          "experience",
          editExpOpen.id,
          tempExp,
        );
        console.log("Experience update result:", result);
        toast.success("Experience updated.");
      } else {
        // Adding a new experience — call POST
        const result = await addProfileItem("experience", tempExp);
        console.log("Experience add result:", result);
        toast.success("Experience added.");
      }

      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setEditExpOpen(null);
      setAddExpOpen(false);
    }
  };
  const confirmDeleteExp = async () => {
    if (!deleteExpId) {
      console.log("id required");
      return;
    }
    try {
      const result = await removeProfileItem("experience", deleteExpId);
      toast.success("Experience deleted successfully.");
      setDeleteExpId(null);
      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  // ── Resume ──
  const setDefaultResume = (id: string) => {};
  const confirmDeleteResume = async () => {
    console.log("Resume to delete : ", deleteResumeId);
    if (!deleteResumeId) {
      console.log("Resume to delete not selected");
      return;
    }
    try {
      const result = await removeProfileItem("resumes", deleteResumeId);
      toast.success("Resume deleted successfully.");
      setDeleteResumeId(null);
      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedResumeFile(file);
  };
  const addResume = async () => {
    if (!selectedResumeFile) {
      console.log("Resume not added");
      return;
    }

    const formData = new FormData();

    if (selectedResumeFile) {
      formData.append("resume", selectedResumeFile);
    }

    try {
      const result = await addResumeData(formData);
      console.log(result);
      toast.success("Resume added successfully.");
      setAddResumeOpen(false);
      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }

    setSelectedResumeFile(null);
    setAddResumeOpen(false);
  };

  // ── Cover Letter ──
  const openAddCL = () => {
    setTempCL({ title: "", content: "" });
    setAddCLOpen(true);
  };
  const openEditCL = (cl: CoverLetter) => {
    setEditCL(cl);
    setTempCL({ title: cl.title, content: cl.content });
  };
  const saveCL = async () => {
    if (!tempCL.title.trim() || !tempCL.content.trim()) {
      console.log("cover letter data missing.");
    }

    try {
      if (editCL) {
        const result = await updateProfileItem(
          "coverLetters",
          editCL.id,
          tempCL,
        );
        console.log("Coverletter update result:", result);
        toast.success("Coverletter updated.");
      } else {
        // Adding a new experience — call POST
        const result = await addProfileItem("coverLetters", tempCL);
        console.log("coverLetters add result:", result);
        toast.success("coverLetter added.");
      }

      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setEditCL(null);
      setAddCLOpen(false);
    }
  };
  const confirmDeleteCL = async () => {
    if (!deleteCLId) {
      console.log("id required to delete cover letter");
      return;
    }
    try {
      const result = await removeProfileItem("coverLetters", deleteCLId);
      toast.success("Coverletter deleted successfully.");
      setDeleteCLId(null);
      getProfile();
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  // logout
  const handleLogout = async () => {
    if (!userId) return;
    try {
      await logoutApi({ id: userId });
      dispatch(logout());
      toast.success("Logged out");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase();

  // ── Reusable Education / JP form fields ──
  const EduForm = () => (
    <div className="flex flex-col gap-4">
      {(
        ["degree", "fieldOfStudy", "institution", "graduationYear"] as const
      ).map((field) => (
        <div key={field}>
          <label className="text-xs font-semibold text-gray-500 block mb-1 capitalize">
            {field.replace(/([A-Z])/g, " $1")}
          </label>
          <input
            value={tempEdu[field]}
            onChange={(e) =>
              setTempEdu((p) => ({ ...p, [field]: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
        </div>
      ))}
      <button
        onClick={saveEdu}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        Save
      </button>
    </div>
  );

  const JPForm = () => (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          Preferred Role
        </label>
        <input
          value={tempJP.role}
          onChange={(e) => setTempJP((p) => ({ ...p, role: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          Type
        </label>
        <select
          value={tempJP.type}
          onChange={(e) =>
            setTempJP((p) => ({
              ...p,
              type: e.target.value as JobPreference["type"],
            }))
          }
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
        >
          {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          Location
        </label>
        <input
          value={tempJP.location}
          onChange={(e) =>
            setTempJP((p) => ({ ...p, location: e.target.value }))
          }
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          Work Mode
        </label>
        <select
          value={tempJP.workMode}
          onChange={(e) =>
            setTempJP((p) => ({
              ...p,
              workMode: e.target.value as JobPreference["workMode"],
            }))
          }
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
        >
          {["ONSITE", "REMOTE", "HYBRID"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          Expected Salary
        </label>
        <input
          value={tempJP.expectedSalary ?? ""}
          onChange={(e) =>
            setTempJP((p) => ({
              ...p,
              expectedSalary: e.target.value
                ? Number(e.target.value)
                : undefined,
            }))
          }
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
      </div>
      <button
        onClick={handleChangeJP}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        Save
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Incomplete banner */}
        {incomplete && (
          <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <svg
              className="w-5 h-5 text-amber-500 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div>
              <p className="text-amber-800 font-semibold text-sm">
                Complete your profile
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                A complete profile increases your chances of getting hired. Add
                your summary, skills, experience, and resume.
              </p>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold text-gray-800 mb-4">Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Profile Card */}
            <SectionCard>
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  {user?.profilePicture ? (
                    <img
                      src={user?.profilePicture}
                      alt="avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-orange-400 flex items-center justify-center text-2xl font-bold text-orange-500 bg-orange-50">
                      {avatarLetter}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-sm text-orange-500 font-medium truncate">
                    {user?.email}
                  </p>
                  <button
                    onClick={openEditProfile}
                    className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-1.5 rounded-full transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Phone */}
            <SectionCard>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800">Phone</h2>
                <div className="flex gap-1.5">
                  <GreenBtn onClick={openEditPhone}>Edit</GreenBtn>
                </div>
              </div>
              {profile?.phone ? (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.phone}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No summary added yet. Add one to stand out to employers.
                </p>
              )}
            </SectionCard>

            {/* Location */}
            <SectionCard>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800">Location</h2>
                <div className="flex gap-1.5">
                  <GreenBtn onClick={openEditLocation}>Edit</GreenBtn>
                </div>
              </div>
              {profile?.location ? (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.location}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No location added yet. Add one to stand out to employers.
                </p>
              )}
            </SectionCard>

            {/* Summary */}
            <SectionCard>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800">Summary</h2>
                <div className="flex gap-1.5">
                  <GreenBtn onClick={openEditSummary}>Edit</GreenBtn>
                </div>
              </div>
              {profile?.summary ? (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.summary}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No summary added yet. Add one to stand out to employers.
                </p>
              )}
            </SectionCard>

            {/* Skills */}
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Skills</h2>
                <PlusBtn onClick={() => setAddSkillOpen(true)} />
              </div>
              {profile?.skills.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No skills added yet. Add your technical and professional
                  skills.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 items-center">
                  {profile?.skills.map((s) => (
                    <Chip key={s} label={s} onRemove={() => removeSkill(s)} />
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Education */}
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Education</h2>
                <PlusBtn onClick={openAddEdu} />
              </div>
              {!profile?.education ? (
                <p className="text-sm text-gray-400 italic">
                  No education added yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {profile?.education?.map((edu) => (
                    <div
                      key={edu.id}
                      className="bg-gray-50 rounded-xl p-4 flex gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">
                          {edu?.degree} — {edu?.fieldOfStudy}
                        </p>

                        <p className="text-orange-500 text-xs font-medium mt-0.5">
                          {edu?.institution}
                        </p>

                        <p className="text-gray-400 text-xs mt-0.5">
                          Graduated {edu?.graduationYear}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <GreenBtn
                          onClick={() => {
                            openEditEdu(edu);
                          }}
                        >
                          Edit
                        </GreenBtn>

                        <RedBtn
                          onClick={() => {
                            setDeleteEduId(edu.id);
                          }}
                        >
                          Delete
                        </RedBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Job Preferences */}
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Job Preferences</h2>
                <GreenBtn onClick={openEditJP}>Edit</GreenBtn>
              </div>

              {!profile?.jobPreference ? (
                <p className="text-sm text-gray-400 italic">
                  No job preferences added yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Role</p>
                        <p className="text-gray-700 font-medium">
                          {profile.jobPreference.role}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs">Type</p>
                        <p className="text-gray-700 font-medium">
                          {profile.jobPreference.type}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs">Location</p>
                        <p className="text-gray-700 font-medium">
                          {profile.jobPreference.location}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs">Work Mode</p>
                        <p className="text-gray-700 font-medium">
                          {profile.jobPreference.workMode}
                        </p>
                      </div>

                      {profile.jobPreference.expectedSalary && (
                        <div>
                          <p className="text-gray-400 text-xs">Salary</p>
                          <p className="text-gray-700 font-medium">
                            ₹{profile.jobPreference.expectedSalary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Experience */}
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Experience</h2>
                <PlusBtn onClick={openAddExp} />
              </div>
              {profile?.experience.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No experience added yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {profile?.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="bg-gray-50 rounded-xl p-4 flex gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">
                          {exp.title}
                        </p>
                        <p className="text-orange-500 text-xs font-medium">
                          {exp.company}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {exp.years} {exp.years === 1 ? "year" : "years"}
                        </p>
                        {exp.description && (
                          <p className="text-gray-600 text-xs mt-1.5 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <GreenBtn onClick={() => openEditExp(exp)}>
                          Edit
                        </GreenBtn>
                        <RedBtn onClick={() => setDeleteExpId(exp.id)}>
                          Delete
                        </RedBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Cover Letters */}
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Cover Letters</h2>
                <PlusBtn onClick={openAddCL} />
              </div>
              {profile?.coverLetters.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No cover letters added yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {profile?.coverLetters.map((cl) => (
                    <div
                      key={cl.id}
                      className="border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800 text-sm">
                          {cl.title}
                        </p>
                        <div className="flex gap-2">
                          <GreenBtn onClick={() => openEditCL(cl)}>
                            Edit
                          </GreenBtn>
                          <RedBtn onClick={() => setDeleteCLId(cl.id)}>
                            Delete
                          </RedBtn>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {cl.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-5">
            {/* Account Settings */}
            <div className="bg-orange-400 rounded-2xl p-5 text-white">
              <h2 className="font-bold text-lg mb-4">Account Settings</h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setTempEmail("");
                    setTempEmailConfirm("");
                    setEmailError("");
                    setChangeEmailOpen(true);
                  }}
                  className="w-full bg-white text-orange-500 font-semibold text-sm rounded-full py-2 hover:bg-orange-50 transition-colors"
                >
                  Change Email
                </button>
                <button
                  onClick={() => {
                    setTempCurrentPassword("");
                    setTempNewPassword("");
                    setTempConfirmPassword("");
                    setPasswordError("");
                    setChangePasswordOpen(true);
                  }}
                  className="w-full bg-white text-orange-500 font-semibold text-sm rounded-full py-2 hover:bg-orange-50 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Activity Stats */}
            {/* <div className="bg-stone-700 rounded-2xl p-5 text-white">
              <h2 className="font-bold text-lg mb-1">Activity Stats</h2>
              <p className="text-stone-300 text-xs mb-4">Applied Jobs</p>
              <div className="flex flex-col gap-3">
                <div className="bg-blue-500 rounded-2xl p-4 text-center">
                  <p className="text-sm font-medium text-blue-100">Ongoing</p>
                  <p className="text-3xl font-black mt-1">
                    {activityStats.ongoing}
                  </p>
                </div>
                <div className="bg-green-500 rounded-2xl p-4 text-center">
                  <p className="text-sm font-medium text-green-100">Hired</p>
                  <p className="text-3xl font-black mt-1">
                    {activityStats.hired}
                  </p>
                </div>
                <div className="bg-red-500 rounded-2xl p-4 text-center">
                  <p className="text-sm font-medium text-red-100">Rejected</p>
                  <p className="text-3xl font-black mt-1">
                    {activityStats.rejected}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Resume */}
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Resume</h2>
                <OrangeBtn
                  onClick={() => {
                    setSelectedResumeFile(null);
                    setAddResumeOpen(true);
                  }}
                >
                  Add
                </OrangeBtn>
              </div>
              <div className="flex flex-col gap-2">
                {profile?.resumes.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    No resume uploaded.
                  </p>
                )}
                {profile?.resumes.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {r.name}
                      </p>
                      {r.isDefault && (
                        <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 items-end">
                      {/* {!r.isDefault && (
                        <button
                          onClick={() => setDefaultResume(r.id)}
                          className="text-xs text-blue-500 hover:underline font-medium"
                        >
                          Set Default
                        </button>
                      )} */}
                      <button
                        onClick={() => setDeleteResumeId(r.id)}
                        className="text-xs text-red-500 hover:underline font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Log Out */}
            <button
              onClick={() => setLogoutOpen(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </main>

      {/* ══════════ MODALS ══════════ */}

      {/* Edit Profile */}
      {editProfileOpen && (
        <Modal title="Edit Profile" onClose={() => setEditProfileOpen(false)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {tempProfile.preview ? (
                  <img
                    src={tempProfile.preview}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-orange-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-orange-400 flex items-center justify-center text-3xl font-bold text-orange-500 bg-orange-50">
                    {(tempProfile.name || user?.name)?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-orange-600"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-gray-400">
                Click camera icon to change photo
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Full Name
              </label>
              <input
                value={tempProfile.name}
                onChange={(e) =>
                  setTempProfile((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <button
              onClick={handleProfileChange}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Summary modal */}
      {editSummaryOpen && (
        <Modal
          title={profile?.summary ? "Edit Summary" : "Add Summary"}
          onClose={() => setEditSummaryOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <textarea
              value={tempSummary}
              onChange={(e) => setTempSummary(e.target.value)}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
              placeholder="Write a short professional summary..."
            />
            <button
              onClick={handleChangeSummery}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Phone */}
      {editPhoneOpen && (
        <Modal
          title={"Edit Phone"}
          onClose={() => {
            setTempPhone("");
            setEditPhoneOpen(false);
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Phone Number
              </label>
              <input
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. 9876543210"
              />
            </div>
            <button
              onClick={handleChangePhone}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Location */}
      {editLocOpen && (
        <Modal
          title={"Edit Location"}
          onClose={() => {
            setEditLocOpen(false);
            setTempLoc("");
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Location
              </label>
              <input
                value={tempLoc}
                onChange={(e) => setTempLoc(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. Kerala, India"
              />
            </div>
            <button
              onClick={handleChangeLoc}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Add Skill */}
      {addSkillOpen && (
        <Modal title="Add Skill" onClose={() => setAddSkillOpen(false)}>
          <div className="flex flex-col gap-4">
            <input
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              placeholder="e.g. Node.js"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
              onKeyDown={(e) => e.key === "Enter" && saveAddSkill()}
            />
            <button
              onClick={saveAddSkill}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Add Skill
            </button>
          </div>
        </Modal>
      )}

      {/* Add/Edit Education */}
      {(addEduOpen || editEdu) && (
        <Modal
          title={editEdu ? "Edit Education" : "Add Education"}
          onClose={() => {
            setAddEduOpen(false);
            setEditEdu(null);
          }}
        >
          <EduForm />
        </Modal>
      )}

      {/* Add/Edit Job Preference */}
      {editJPOpen && (
        <Modal
          title={editJP ? "Edit Job Preference" : "Add Job Preference"}
          onClose={() => {
            setEditJPOpen(false);
            setTempJP({
              role: "",
              type: "FULL_TIME",
              location: "",
              workMode: "ONSITE",
              expectedSalary: 0,
            });
          }}
        >
          <JPForm />
        </Modal>
      )}

      {/* Add/Edit Experience */}
      {(addExpOpen || editExpOpen) && (
        <Modal
          title={addExpOpen ? "Add Experience" : "Edit Experience"}
          onClose={() => {
            setAddExpOpen(false);
            setEditExpOpen(null);
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Job Title
              </label>
              <input
                value={tempExp.title}
                onChange={(e) =>
                  setTempExp((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. Senior Developer"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Company
              </label>
              <input
                value={tempExp.company}
                onChange={(e) =>
                  setTempExp((p) => ({ ...p, company: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. TechCorp"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Years
              </label>
              <input
                type="number"
                min={0}
                value={tempExp.years}
                onChange={(e) =>
                  setTempExp((p) => ({ ...p, years: Number(e.target.value) }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Description (optional)
              </label>
              <textarea
                value={tempExp.description}
                onChange={(e) =>
                  setTempExp((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
                placeholder="Describe your role..."
              />
            </div>
            <button
              onClick={saveExp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {addExpOpen ? "Add Experience" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Resume */}
      {addResumeOpen && (
        <Modal
          title="Add Resume"
          onClose={() => {
            setAddResumeOpen(false);
            setSelectedResumeFile(null);
          }}
        >
          <div className="flex flex-col gap-4">
            {/* Drop zone — clicking anywhere on it triggers the file picker */}
            <button
              type="button"
              onClick={() => resumeInputRef.current?.click()}
              className="w-full border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-xl p-8 text-center transition-colors group"
            >
              <svg
                className="w-10 h-10 text-orange-300 group-hover:text-orange-400 mx-auto mb-3 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {selectedResumeFile ? (
                <div>
                  <p className="text-sm font-semibold text-orange-600 truncate">
                    {selectedResumeFile.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(selectedResumeFile.size / 1024).toFixed(1)} KB — click to
                    change
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Click to browse your files
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC up to 5 MB
                  </p>
                </div>
              )}
            </button>
            {/* Hidden real file input */}
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeFileChange}
            />
            <button
              onClick={addResume}
              disabled={!selectedResumeFile}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {selectedResumeFile ? "Upload Resume" : "Select a file first"}
            </button>
          </div>
        </Modal>
      )}

      {/* Add/Edit Cover Letter */}
      {(addCLOpen || editCL) && (
        <Modal
          title={addCLOpen ? "Add Cover Letter" : "Edit Cover Letter"}
          onClose={() => {
            setAddCLOpen(false);
            setEditCL(null);
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Title
              </label>
              <input
                value={tempCL.title}
                onChange={(e) =>
                  setTempCL((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. Software Engineer Application"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Content
              </label>
              <textarea
                value={tempCL.content}
                onChange={(e) =>
                  setTempCL((p) => ({ ...p, content: e.target.value }))
                }
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
                placeholder="Write your cover letter..."
              />
            </div>
            <button
              onClick={saveCL}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {addCLOpen ? "Add Cover Letter" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Confirmation modals ── */}
      {deleteEduId && (
        <ConfirmModal
          message="Delete this education entry?"
          onConfirm={confirmDeleteEdu}
          onCancel={() => setDeleteEduId(null)}
        />
      )}
      {deleteJPId && (
        <ConfirmModal
          message="Delete this job preference?"
          onConfirm={confirmDeleteJP}
          onCancel={() => setDeleteJPId(null)}
        />
      )}
      {deleteExpId && (
        <ConfirmModal
          message="Delete this experience entry?"
          onConfirm={confirmDeleteExp}
          onCancel={() => setDeleteExpId(null)}
        />
      )}
      {deleteResumeId && (
        <ConfirmModal
          message="Remove this resume?"
          onConfirm={confirmDeleteResume}
          onCancel={() => setDeleteResumeId(null)}
        />
      )}
      {deleteCLId && (
        <ConfirmModal
          message="Delete this cover letter?"
          onConfirm={confirmDeleteCL}
          onCancel={() => setDeleteCLId(null)}
        />
      )}
      {skillToDelete && (
        <ConfirmModal
          message="Delete this skill?"
          onConfirm={confirmDeleteSkill}
          onCancel={() => setSkillToDelete(null)}
        />
      )}
      {/* Change Email */}
      {changeEmailOpen && (
        <Modal title="Change Email" onClose={() => setChangeEmailOpen(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-3">
                Current email:{" "}
                <span className="font-semibold text-gray-600">
                  {user?.email}
                </span>
              </p>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                New Email
              </label>
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => {
                  setTempEmail(e.target.value);
                  setEmailError("");
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Confirm New Email
              </label>
              <input
                type="email"
                value={tempEmailConfirm}
                onChange={(e) => {
                  setTempEmailConfirm(e.target.value);
                  setEmailError("");
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="you@example.com"
              />
            </div>
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            <button
              onClick={handleChangeEmail}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Update Email
            </button>
          </div>
        </Modal>
      )}

      {/* Change Password */}
      {changePasswordOpen && (
        <Modal
          title="Change Password"
          onClose={() => setChangePasswordOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={tempCurrentPassword}
                onChange={(e) => {
                  setTempCurrentPassword(e.target.value);
                  setPasswordError("");
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                New Password
              </label>
              <input
                type="password"
                value={tempNewPassword}
                onChange={(e) => {
                  setTempNewPassword(e.target.value);
                  setPasswordError("");
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={tempConfirmPassword}
                onChange={(e) => {
                  setTempConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="••••••••"
              />
            </div>
            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
            <button
              onClick={handleChangePassword}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Update Password
            </button>
          </div>
        </Modal>
      )}

      {logoutOpen && (
        <ConfirmModal
          message="Are you sure you want to log out?"
          onConfirm={() => {
            handleLogout(); /* call logout handler here */
          }}
          onCancel={() => setLogoutOpen(false)}
          confirmLabel="Log Out"
          confirmClass="bg-red-500 hover:bg-red-600"
        />
      )}
    </div>
  );
}
