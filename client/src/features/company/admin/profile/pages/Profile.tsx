import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProfileApi } from "../services/profileService";
import { Building2 } from "lucide-react";
import { VerifyForm } from "../../dashboard/components/VerifyReqForm";
import {
  getStatusApi,
  verifyRequestApi,
} from "../../dashboard/services/comapanyServices";

type VerificationStatus = "approved" | "pending" | "rejected" | "not_submitted";

type VerificationData = {
  adminNote: string;
  status: VerificationStatus;
};

type BasicDetails = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
};

type CompanyDetails = {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  regNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  description: string;
  document: string;
  isActive: boolean;
  website?: string;
  profilePicture?: string; // if added
};

interface CompanyInfo {
  companyName: string;
  legalName: string;
  registrationNumber: string;
  businessType: string;
  taxId: string;
  contactEmail: string;
  contactNumber: string;
  website: string;
  address: string;
  logoUrl?: string;
}

const INITIAL_COMPANY: CompanyInfo = {
  companyName: "TechCorp Solutions Inc.",
  legalName: "TechCorp Solutions International Inc.",
  registrationNumber: "RC-99827364510",
  businessType: "Technology & Software Services",
  taxId: "TX-863301-A",
  contactEmail: "admin@techcorp.io",
  contactNumber: "+1 (555) 012-3456",
  website: "www.techcorp.io",
  address:
    "One Infinite Loop, Suite 100, Silicon Valley, San Jose, CA 95101, United States",
};

export default function ProfilePage() {
  const [basicDetails, setBasicDetails] = useState<BasicDetails | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null,
  );
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY);
  const [draftCompany, setDraftCompany] =
    useState<CompanyInfo>(INITIAL_COMPANY);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationData>({ status: "not_submitted", adminNote: "" });
  const [rejectionReason, setRejectionReason] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("sarah.jenkins@techcorp.io");
  const [emailDraft, setEmailDraft] = useState("sarah.jenkins@techcorp.io");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // For demo: toggle rejection
  const [demoMode, setDemoMode] = useState<
    "pending" | "rejected" | "verified" | "none"
  >("verified");

  const handleOpenEdit = () => {
    setDraftCompany({ ...companyInfo });
    setShowEditModal(true);
  };

  const handleSaveEmail = () => {
    setNewEmail(emailDraft);
    setShowEmailModal(false);
  };

  const isEditDisabled = verificationStatus.status === "pending";

  const fileUrl = companyDetails?.document;
  const downloadUrl = fileUrl?.replace("/upload/", "/upload/fl_attachment/");
  const fileName = fileUrl?.split("/").pop();
  const isPdf = fileUrl?.toLowerCase().includes(".pdf");

  const getProfile = async () => {
    try {
      const result = await getProfileApi();
      console.log("company profile", result);
      setBasicDetails(result.data.basicDetails);
      setCompanyDetails(result.data.companyDetails);
    } catch (error: any) {
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      const result = await verifyRequestApi(data, "UPDATE");
      console.log("result of edit company details request : ", result);
      toast.success("Edit request submited");
    } catch (error: any) {
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message);
    } finally {
      setShowEditModal(false);
    }
  };

  async function getStatus() {
    let result = await getStatusApi("UPDATE");
    setVerificationStatus(result.data);
    console.log("result of status fetch : ", result);
  }

  useEffect(() => {
    getProfile();
    getStatus();
  }, [showEditModal]);

  console.log(`profile status : ${verificationStatus}`);

  return (
    <>
      {/* Demo Controls */}
      {/* <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Demo
        </span>
        <button
          onClick={simulateRejection}
          className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition"
        >
          Simulate Reject
        </button>
        <button
          onClick={simulateApprove}
          className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition"
        >
          Simulate Approve
        </button>
      </div> */}

      <div className="max-w-5xl mx-auto px-4  sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* Status Banner */}
        {verificationStatus.status === "pending" && (
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
            <span className="mt-0.5 text-amber-500">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                Profile Under Review
              </p>
              <p className="text-amber-700 text-sm mt-0.5">
                Your company profile update is currently under verification. You
                cannot change the profile information until the review is
                complete.
              </p>
            </div>
          </div>
        )}

        {verificationStatus.status === "rejected" && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <span className="mt-0.5 text-red-500">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-red-800 text-sm">
                Profile Update Rejected
              </p>
              <p className="text-red-700 text-sm mt-0.5">
                Your company profile update was rejected.
                <span className="font-medium">Reason:</span>{" "}
                {verificationStatus?.adminNote}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {/* Banner */}
              <div className="h-24 sm:h-28 bg-gradient-to-br from-[#5bbf6e] via-[#7ed98a] to-[#d4f5db] relative" />
              {/* Avatar + actions */}
              <div className="px-5 pb-5 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 -mt-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
                    {companyDetails?.profilePicture ? (
                      <img
                        src={companyDetails.profilePicture}
                        alt="company-logo"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
                    <button
                      onClick={() => {
                        setEmailDraft(newEmail);
                        setShowEmailModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-[#2563eb] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 3.487a2.1 2.1 0 1 1 2.97 2.97L7.5 18.79l-4 1 1-4 12.362-12.303z"
                        />
                      </svg>
                      Edit Email
                    </button>
                    <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900">
                      {companyDetails?.companyName}
                    </h2>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0-9.75 6.75-9.75-6.75"
                      />
                    </svg>
                    <span className="truncate">{basicDetails?.email}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Company Information Card */}

            {companyDetails ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">
                      Company Information
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleOpenEdit}
                        disabled={isEditDisabled}
                        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg border transition
                      ${
                        isEditDisabled
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 3.487a2.1 2.1 0 1 1 2.97 2.97L7.5 18.79l-4 1 1-4 12.362-12.303z"
                          />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <InfoField
                      label="Company Name"
                      value={companyDetails.companyName}
                    />
                    <InfoField
                      label="Registration Number"
                      value={companyDetails.regNumber}
                    />
                    <InfoField
                      label="Contact Email"
                      value={companyDetails.email}
                    />
                    <InfoField
                      label="Contact Number"
                      value={companyDetails.phone}
                    />
                    <InfoField label="Country" value={companyDetails.country} />
                    <InfoField label="City" value={companyDetails.city} />
                    <InfoField label="State" value={companyDetails.state} />
                    <InfoField label="Zip" value={companyDetails.zip} />
                    {companyDetails.website && (
                      <InfoField
                        label="Website"
                        value={companyDetails.website}
                        isLink
                      />
                    )}
                    <div className="sm:col-span-2">
                      <InfoField
                        label="Address"
                        value={companyDetails.address}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <InfoField
                        label="Description"
                        value={companyDetails.description}
                      />
                    </div>
                  </div>
                </div>
                {/* Verification Documents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    Verification Documents
                  </h3>

                  {fileUrl ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      {/* LEFT SIDE */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          📄
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {fileName}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded document
                          </p>
                        </div>
                      </div>

                      {/* RIGHT SIDE ACTIONS */}
                      <div className="flex items-center gap-2">
                        {/* ✅ PREVIEW */}
                        <button
                          onClick={() => setIsPreviewOpen(true)}
                          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100"
                        >
                          Preview
                        </button>

                        {/* ✅ DOWNLOAD */}
                        <a
                          href={downloadUrl}
                          className="text-xs px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No document uploaded
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                {/* Icon */}
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  No Company Details Found
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 max-w-sm mb-4">
                  Please verify and complete your company profile to access all
                  features and start posting jobs.
                </p>

                {/* Button */}
                <button
                  onClick={handleOpenEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
                >
                  Verify Company
                </button>
              </div>
            )}
          </div>

          {/* Right column: Plan */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Current Plan
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Free Plan
              </h3>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Premium Benefits
              </p>
              <ul className="flex flex-col gap-2.5 mb-5">
                {[
                  "Unlimited Jobs",
                  "Unlimited Recruiters",
                  "Advanced Analytics",
                  "Priority Support",
                ].map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Upgrade to Premium
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Cancel or change your plan at any time. Billed monthly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Company Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <VerifyForm
              onClose={() => setShowEditModal(false)}
              onSubmit={handleEditSubmit}
              initialData={companyDetails ?? null}
            />
          </div>
        </div>
      )}

      {/* Edit Email Modal */}
      {showEmailModal && (
        <Modal onClose={() => setShowEmailModal(false)}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Email</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Update your account email address.
              </p>
            </div>
            <button
              onClick={() => setShowEmailModal(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowEmailModal(false)}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEmail}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#22c55e] text-white hover:bg-[#16a34a] transition"
            >
              Save Email
            </button>
          </div>
        </Modal>
      )}
      {isPreviewOpen && fileUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setIsPreviewOpen(false)} // ✅ close on outside click
        >
          {/* Modal Box */}
          <div
            onClick={(e) => e.stopPropagation()} // ✅ prevent closing when clicking inside
            className="bg-white rounded-2xl shadow-lg w-[90%] max-w-3xl p-4 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Document Preview
            </h3>

            {/* Content */}
            <div className="w-full h-[500px] rounded-lg overflow-hidden border">
              {isPdf ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={fileUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoField({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string | null;
  isLink?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      {isLink ? (
        <a
          href={`https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#2563eb] hover:underline font-medium"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  options,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "select" | "textarea";
  options?: string[];
  disabled?: boolean;
  hint?: string;
}) {
  const baseClass = `w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100" : "border-gray-200 bg-white"}`;
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          {options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${baseClass} ${disabled ? "pr-8" : ""}`}
          />
          {disabled && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"
                />
              </svg>
            </span>
          )}
        </div>
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 z-10">
        {children}
      </div>
    </div>
  );
}
