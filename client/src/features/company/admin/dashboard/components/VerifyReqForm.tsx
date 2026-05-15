import { useState, useRef } from "react";
import type { ReactNode, ChangeEvent } from "react";
import type { VerificationFormData } from "../types/verification.types";
import toast from "react-hot-toast";
import { verifyRequestApi } from "../services/comapanyServices";
import { Ico } from "../../../../../assets/icons/CompanyIcons";

interface FormErrors {
  [k: string]: string;
}

const EMPTY: VerificationFormData = {
  companyName: "",
  regNumber: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  description: "",
  country: "",
  state: "",
  city: "",
  zip: "",
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
        ${error ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
    />
  );
}

export function VerifyForm({
  onSubmit,
  onClose,
}: {
  onSubmit: () => void;
  onClose: () => void;
}) {
  const [fd, setFd] = useState<VerificationFormData>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<FormErrors>({});
  const [loading, setLd] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set =
    (k: keyof VerificationFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFd((p: VerificationFormData) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!fd.companyName.trim()) e.companyName = "Company name is required";
    if (!fd.regNumber.trim()) e.regNumber = "Registration number is required";
    if (!fd.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email))
      e.email = "Enter a valid email address";
    if (!fd.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,}$/.test(fd.phone))
      e.phone = "Enter a valid phone number";
    if (fd.website && !/^https?:\/\/.+/.test(fd.website))
      e.website = "URL must start with http:// or https://";
    if (!fd.address.trim()) e.address = "Business address is required";
    if (!fd.description.trim())
      e.description = "Company description is required";
    if (!file) {
      e.document = "Document required";
    }
    if (!fd.country.trim()) e.country = "Country is required";
    if (!fd.state.trim()) e.state = "State is required";
    if (!fd.city.trim()) e.city = "City is required";
    if (!fd.zip.trim()) e.zip = "ZIP / Postal code is required";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // 🔹 validate (optional but recommended)
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Invalid file type");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File too large (max 10MB)");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();

      Object.entries(fd).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("document", file as File);

      const result = await verifyRequestApi(formData);

      toast.success("verification requested");

      console.log(result);
      onSubmit();
    } catch (error: any) {
      console.log("company verify req error", error.response?.data);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              Verify Your Company
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the details below to submit your verification request
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Ico.X />
          </button>
        </div>

        {/* Form body */}
        <div className="overflow-y-auto px-7 py-5 space-y-4 flex-1">
          {/* Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" error={err.companyName}>
              <Input
                value={fd.companyName}
                onChange={set("companyName")}
                placeholder="Acme Corp."
                error={err.companyName}
              />
            </Field>
            <Field label="Registration Number *" error={err.regNumber}>
              <Input
                value={fd.regNumber}
                onChange={set("regNumber")}
                placeholder="REG-123456"
                error={err.regNumber}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Email *" error={err.email}>
              <Input
                type="email"
                value={fd.email}
                onChange={set("email")}
                placeholder="contact@company.com"
                error={err.email}
              />
            </Field>
            <Field label="Phone Number *" error={err.phone}>
              <Input
                type="tel"
                value={fd.phone}
                onChange={set("phone")}
                placeholder="+1 234 567 8900"
                error={err.phone}
              />
            </Field>
          </div>

          <Field label="Company Description *" error={err.description}>
            <textarea
              value={fd.description}
              onChange={set("description")}
              rows={3}
              placeholder="Briefly describe your company..."
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 resize-none
      ${err.description ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            />
          </Field>

          <Field label="Website" error={err.website}>
            <Input
              value={fd.website}
              onChange={set("website")}
              placeholder="https://company.com"
              error={err.website}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country *" error={err.country}>
              <Input
                value={fd.country}
                onChange={set("country")}
                placeholder="India"
                error={err.country}
              />
            </Field>

            <Field label="State *" error={err.state}>
              <Input
                value={fd.state}
                onChange={set("state")}
                placeholder="Kerala"
                error={err.state}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City *" error={err.city}>
              <Input
                value={fd.city}
                onChange={set("city")}
                placeholder="Calicut"
                error={err.city}
              />
            </Field>

            <Field label="ZIP / Postal Code *" error={err.zip}>
              <Input
                value={fd.zip}
                onChange={set("zip")}
                placeholder="673001"
                error={err.zip}
              />
            </Field>
          </div>

          <Field label="Business Address *" error={err.address}>
            <textarea
              value={fd.address}
              onChange={set("address")}
              rows={2}
              placeholder="123 Main St, City, State, ZIP"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 resize-none
                ${err.address ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            />
          </Field>

          {/* File upload */}
          <Field label="Registration Document *" error={err.docName}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed transition-colors
                ${err.docName ? "border-rose-300 bg-rose-50" : file?.name ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50"}`}
            >
              <span
                className={file?.name ? "text-emerald-500" : "text-slate-400"}
              >
                <Ico.Upload />
              </span>
              {file ? (
                <p className="text-xs font-bold text-emerald-700">
                  {file.name}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-600">
                    Click to upload PDF or image
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
              className="hidden"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Verification"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
