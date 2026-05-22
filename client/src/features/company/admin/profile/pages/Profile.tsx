import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProfileApi } from "../services/profileService";

type VerificationStatus = "verified" | "pending" | "rejected" | "none";

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

const BUSINESS_TYPES = [
  "Technology & Software Services",
  "Information Technology",
  "Finance & Banking",
  "Healthcare",
  "Manufacturing",
  "Retail & E-commerce",
  "Education",
  "Other",
];

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
    useState<VerificationStatus>("verified");
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

  const handleSaveChanges = () => {
    setCompanyInfo({ ...draftCompany });
    setVerificationStatus("pending");
    setDemoMode("pending");
    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleSaveEmail = () => {
    setNewEmail(emailDraft);
    setShowEmailModal(false);
  };

  // Demo controls
  const simulateRejection = () => {
    setVerificationStatus("rejected");
    setRejectionReason(
      "The registration number RC-99827364510 could not be verified with the provided documentation. Please re-upload a valid Business License.",
    );
    setDemoMode("rejected");
  };
  const simulateApprove = () => {
    setVerificationStatus("verified");
    setDemoMode("verified");
  };

  const isEditDisabled = verificationStatus === "pending";

  const fileUrl = companyDetails?.document;
  const previewUrl = fileUrl;
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

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <>
      {/* Demo Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
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
      </div>

      <div className="max-w-5xl mx-auto px-4  sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* Status Banner */}
        {verificationStatus === "pending" && (
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

        {verificationStatus === "rejected" && (
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
                Your company profile update was rejected.{" "}
                <span className="font-medium">Reason:</span> {rejectionReason}
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
                  <div className="w-16 h-16 bg-white rounded-xl border-2 border-white shadow-md flex items-center justify-center text-2xl font-bold text-gray-700 flex-shrink-0">
                    {companyDetails?.companyName
                      ? companyDetails.companyName.charAt(0).toUpperCase()
                      : basicDetails?.name.charAt(0).toUpperCase()}
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
                      {verificationStatus === "verified" && (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified & Approved
                        </span>
                      )}
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
        <Modal onClose={handleCancelEdit}>
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Edit Company Profile
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your organization's public presence and verification
                data.
              </p>
            </div>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600 transition mt-0.5"
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

          <div className="flex justify-end gap-2 mb-5">
            <button
              onClick={handleCancelEdit}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#22c55e] text-white hover:bg-[#16a34a] transition"
            >
              Save Changes
            </button>
          </div>

          {/* Company Logo */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Company Logo
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  Preferred size 204×52px (PNG, SVG)
                </p>
                <button className="text-xs font-medium text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  Change Logo
                </button>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <FormField
              label="Company Name"
              value={draftCompany.companyName}
              onChange={(v) =>
                setDraftCompany((d) => ({ ...d, companyName: v }))
              }
            />
            <FormField
              label="Legal Name"
              value={draftCompany.legalName}
              onChange={(v) => setDraftCompany((d) => ({ ...d, legalName: v }))}
            />
            <FormField
              label="Registration Number"
              value={draftCompany.registrationNumber}
              onChange={(v) =>
                setDraftCompany((d) => ({ ...d, registrationNumber: v }))
              }
            />
            <FormField
              label="Business Type"
              value={draftCompany.businessType}
              onChange={(v) =>
                setDraftCompany((d) => ({ ...d, businessType: v }))
              }
              type="select"
              options={BUSINESS_TYPES}
            />
            <FormField
              label="Tax ID"
              value={draftCompany.taxId}
              onChange={(v) => setDraftCompany((d) => ({ ...d, taxId: v }))}
            />
            <FormField
              label="Company Contact Email"
              value={draftCompany.contactEmail}
              onChange={() => {}}
              disabled
              hint="Company email cannot be changed for security reasons."
            />
            <FormField
              label="Contact Number"
              value={draftCompany.contactNumber}
              onChange={(v) =>
                setDraftCompany((d) => ({ ...d, contactNumber: v }))
              }
            />
            <FormField
              label="Website"
              value={draftCompany.website}
              onChange={(v) => setDraftCompany((d) => ({ ...d, website: v }))}
            />
            <div className="sm:col-span-2">
              <FormField
                label="Address"
                value={draftCompany.address}
                onChange={(v) => setDraftCompany((d) => ({ ...d, address: v }))}
                type="textarea"
              />
            </div>
          </div>

          {/* Verification Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Verification Details
              </p>
              <button className="text-xs font-medium text-[#22c55e] border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add New
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Business_License.pdf
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Uploaded on Jan 12, 2024
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button className="hover:text-blue-500 transition">
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
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                    />
                  </svg>
                </button>
                <button className="hover:text-green-500 transition">
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
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </button>
                <button className="hover:text-red-500 transition">
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
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Modal>
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
