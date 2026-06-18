import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  approveCompanyApi,
  getCompanyReq,
  rejectCompanyApi,
} from "../../services/adminServices";
import toast from "react-hot-toast";

// ─── CSS Injection ─────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("hireflow-styles")) return;
  const style = document.createElement("style");
  style.id = "hireflow-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
    .hireflow * { box-sizing: border-box; }
    .hireflow { font-family: 'DM Sans', sans-serif; }
    @keyframes hf-fadeIn  { from{opacity:0}to{opacity:1} }
    @keyframes hf-slideUp { from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes hf-slideIn { from{transform:translateX(-100%)}to{transform:translateX(0)} }
    @keyframes hf-shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    .hf-overlay { animation:hf-fadeIn .18s ease both }
    .hf-modal   { animation:hf-slideUp .22s cubic-bezier(.16,1,.3,1) both }
    .hf-shake   { animation:hf-shake .4s ease both }
    .hf-scroll::-webkit-scrollbar{width:4px}
    .hf-scroll::-webkit-scrollbar-track{background:transparent}
    .hf-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
    .hf-ta:focus{outline:none;box-shadow:0 0 0 3px rgba(239,68,68,.13),0 0 0 1px #ef4444}
    .hf-ta-err{box-shadow:0 0 0 3px rgba(239,68,68,.1),0 0 0 1px #fca5a5}
    .hf-inp:focus{outline:none;box-shadow:0 0 0 2px rgba(239,68,68,.12),0 0 0 1px #fca5a5}
  `;
  document.head.appendChild(style);
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  Menu: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeWidth="2.5" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Search: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Download: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
  Eye: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  Chevron: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  File: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  Alert: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
  Info: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" d="M12 8v4M12 16h.01" />
    </svg>
  ),
  Spin: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════════════════════════
// REUSABLE MODAL PRIMITIVE
// Props: open, onClose, children, persistent (blocks backdrop + ESC close)
// ══════════════════════════════════════════════════════════════════════════════
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  persistent?: boolean;
}
function Modal({ open, onClose, children, persistent = false }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persistent) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, persistent]);
  if (!open) return null;
  return (
    <div
      className="hireflow fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(3px)" }}
    >
      <div
        className="hf-overlay absolute inset-0"
        style={{ background: "rgba(15,23,42,.48)" }}
        onClick={() => !persistent && onClose()}
      />
      <div className="hf-modal relative w-full max-w-[420px] z-10">
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REJECT MODAL  (reusable — drop in anywhere)
// Props: open, onClose, onConfirm(reason), companyName?
// ══════════════════════════════════════════════════════════════════════════════
interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  companyName?: string;
}
function RejectModal({
  open,
  onClose,
  onConfirm,
  companyName = "this company",
}: RejectModalProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [shake, setShake] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const MIN = 20,
    MAX = 500;

  const error =
    touched && reason.trim().length < MIN
      ? reason.trim().length === 0
        ? "Rejection reason is required."
        : `Minimum ${MIN} characters required (${reason.trim().length}/${MIN}).`
      : null;
  const valid = reason.trim().length >= MIN;

  useEffect(() => {
    if (open) {
      setReason("");
      setTouched(false);
      setTimeout(() => ref.current?.focus(), 80);
    }
  }, [open]);

  const submit = () => {
    setTouched(true);
    if (!valid) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 32px 64px -12px rgba(0,0,0,.24),0 0 0 1px rgba(0,0,0,.05)",
        }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-red-50 border border-red-100">
              <span className="text-red-500">
                <Ic.Alert />
              </span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                Reject Application
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
                You're about to reject{" "}
                <span className="font-semibold text-slate-700">
                  {companyName}
                </span>
                . They'll be notified by email.
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <Ic.X />
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <div className={shake ? "hf-shake" : ""}>
              <textarea
                ref={ref}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                maxLength={MAX}
                rows={4}
                placeholder="Describe why this application is being rejected. Be clear and professional — this will be sent to the company recruiter."
                className={`hf-ta w-full resize-none rounded-xl border text-[13px] text-slate-800 placeholder-slate-400 px-4 py-3 transition-all leading-relaxed ${
                  error
                    ? "hf-ta-err border-red-200 bg-red-50/40"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 focus:bg-white"
                }`}
                style={{ fontFamily: "'DM Sans',sans-serif" }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex-1">
                {error ? (
                  <p className="text-[11.5px] text-red-500 font-medium flex items-center gap-1">
                    <Ic.Info />
                    {error}
                  </p>
                ) : valid && touched ? (
                  <p className="text-[11.5px] text-emerald-600 font-medium flex items-center gap-1">
                    <Ic.Check /> Looks good
                  </p>
                ) : (
                  <p className="text-[11.5px] text-slate-400">
                    Minimum {MIN} characters
                  </p>
                )}
              </div>
              <p
                className={`text-[11.5px] tabular-nums shrink-0 ${reason.length > MAX * 0.9 ? "text-amber-500" : "text-slate-400"}`}
              >
                {reason.length}/{MAX}
              </p>
            </div>
          </div>

          {/* note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-amber-400 shrink-0 mt-0.5">
              <Ic.Info />
            </span>
            <p className="text-[12px] text-amber-700 leading-relaxed">
              This reason will be visible to the company recruiter. Keep it
              professional and actionable.
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[.98]"
          >
            Cancel Rejection
          </button>
          <button
            onClick={submit}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[.98] ${
              valid
                ? "bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Reject with Reason
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APPROVE MODAL  (reusable — drop in anywhere)
// Props: open, onClose, onConfirm, companyName?
// ══════════════════════════════════════════════════════════════════════════════
interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  companyName?: string;
}
function ApproveModal({
  open,
  onClose,
  onConfirm,
  companyName = "this company",
}: ApproveModalProps) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open) setLoading(false);
  }, [open]);

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 950);
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      persistent={loading}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 32px 64px -12px rgba(0,0,0,.24),0 0 0 1px rgba(0,0,0,.05)",
        }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-500">
                <Ic.Check />
              </span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                Confirm Approval
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
                You're about to approve{" "}
                <span className="font-semibold text-slate-700">
                  {companyName}
                </span>{" "}
                as a verified recruiter.
              </p>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <Ic.X />
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-3">
          {[
            "Recruiter account will be activated immediately",
            "Company profile will be publicly visible",
            "Recruiter can start posting job listings",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <span className="text-emerald-500">
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              </div>
              <p className="text-[13px] text-slate-600">{item}</p>
            </div>
          ))}

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mt-1">
            <span className="text-emerald-500 shrink-0 mt-0.5">
              <Ic.Info />
            </span>
            <p className="text-[12px] text-emerald-700 leading-relaxed">
              The company will receive a confirmation email and can immediately
              begin using their recruiter account.
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[13px] font-semibold text-white shadow-sm shadow-emerald-200 transition-all active:scale-[.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Ic.Spin />
                Approving…
              </>
            ) : (
              "Confirm Approval"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
// INFO FIELD
// ══════════════════════════════════════════════════════════════════════════════
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <p className="text-[10.5px] font-semibold tracking-[.08em] text-slate-400 uppercase mb-1">
        {label}
      </p>
      <p className="text-[13.5px] font-medium text-slate-800">{value}</p>
    </div>
  );
}

// actual company data
interface CompanyRequestData {
  _id: string;
  userId: string;
  companyName: string;
  regNumber: string;
  email: string;
  phone: string;
  description: string;
  website: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  document: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CompanyDetailsReview() {
  useEffect(() => {
    injectStyles();
  }, []);

  const [reqData, setReqData] = useState<CompanyRequestData | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { id } = useParams<{ id: string }>();

  const onApproveConfirm = async () => {
    if (!id) return;
    try {
      const result = await approveCompanyApi(id);
      console.log(result);
      setReqData((prev) => (prev ? { ...prev, status: "approved" } : prev));
      toast.success("Approval successfull.");
      setShowApprove(false);
    } catch (error: any) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const onRejectConfirm = async (reason: string) => {
    if (!id) return;
    try {
      console.log("reject reason : ", reason);
      const result = await rejectCompanyApi(id, { reason });
      console.log(result);
      setReqData((prev) => (prev ? { ...prev, status: "rejected" } : prev));
      toast.success("Rejection successfull.");
      setShowReject(false);
    } catch (error: any) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const onRejectModalClose = () => {
    setShowReject(false);
  };

  const getFileName = (url: string) => {
    return url.split("/").pop(); // gets last part
  };

  const handleDownload = async () => {
    if (!reqData?.document) return;

    try {
      const response = await fetch(reqData.document);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      // ✅ Detect correct file type
      const contentType = response.headers.get("content-type");

      let extension = "file";

      if (contentType?.includes("pdf")) extension = "pdf";
      else if (contentType?.includes("jpeg")) extension = "jpg";
      else if (contentType?.includes("png")) extension = "png";
      else if (contentType?.includes("webp")) extension = "webp";

      const link = document.createElement("a");
      link.href = url;
      link.download = `document.${extension}`; // ✅ correct extension

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  useEffect(() => {
    async function getReq() {
      if (!id) return;
      const result = await getCompanyReq(id);
      console.log(result);
      setReqData(result.data);
    }
    getReq();
  }, []);
  if (!reqData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>

          <div className="h-40 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Body ── */}
        <main className="flex-1 overflow-y-auto hf-scroll px-4 sm:px-6 lg:px-8 py-6">
          {/* Page heading */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-[21px] font-bold text-slate-900 tracking-tight">
                Company Details Review
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Review the submitted recruiter information before approval
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border`}
              >
                {reqData.status}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Verification Request
              </span>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* ── Left ── */}
            <div className="xl:col-span-2 space-y-5">
              {/* Company Info */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-[13.5px] font-semibold text-slate-800">
                    Company Info
                  </h2>
                  <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                    #{reqData?._id?.slice(-6)}
                  </span>
                </div>
                <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <InfoField label="Name" value={reqData.companyName} />
                  <InfoField label="Email" value={reqData.email} />
                  <InfoField label="Phone" value={reqData.phone} />
                  <InfoField
                    label="Website"
                    value={reqData.website ? reqData.website : "nil"}
                  />
                  <InfoField label="Industry" value={reqData.address} />
                  <InfoField label="Address" value={reqData.description} />
                </div>
              </div>

              {/* Verification */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-[13.5px] font-semibold text-slate-800">
                    Company Verification Details
                  </h2>
                </div>
                <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <InfoField
                    label="Registration Number"
                    value={reqData.regNumber}
                  />
                  <InfoField label="Comapnay ID" value={reqData.userId} />
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-[13.5px] font-semibold text-slate-800">
                    Documents
                  </h2>
                </div>
                <div className="px-5 pt-2 pb-1 grid grid-cols-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[.08em]">
                  <span>Document Name</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="divide-y divide-slate-50">
                  <div className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 shrink-0">
                        <Ic.File />
                      </div>
                      <span className="text-[13px] font-medium text-slate-700">
                        {getFileName(reqData?.document || "")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setPreviewOpen(true)}
                        className="flex items-center gap-1 text-[12px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Ic.Eye />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <span className="text-slate-200">|</span>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Ic.Download />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right ── */}
            <div className="space-y-5">
              {/* Quick summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-[13px] font-semibold text-slate-800">
                    Location
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[.08em] mb-0.5">
                        country
                      </p>
                      <p className="text-[12.5px] font-semibold text-slate-700 truncate">
                        {reqData.country}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[.08em] mb-0.5">
                        state
                      </p>
                      <p className="text-[12.5px] font-semibold text-slate-700 truncate">
                        {reqData.state}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[.08em] mb-0.5">
                        city
                      </p>
                      <p className="text-[12.5px] font-semibold text-slate-700 truncate">
                        {reqData.city}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[.08em] mb-0.5">
                        Zip
                      </p>
                      <p className="text-[12.5px] font-semibold text-slate-700 truncate">
                        {reqData.zip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Activity */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-[13px] font-semibold text-slate-800">
                    Activity
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    {
                      label: "Application submitted",
                      time: "2 hours ago",
                      dot: "bg-blue-500",
                    },
                    {
                      label: "Documents uploaded",
                      time: "2 hours ago",
                      dot: "bg-slate-400",
                    },
                    {
                      label: "Verification requested",
                      time: "1 hour ago",
                      dot: "bg-amber-500",
                    },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.dot}`}
                      />
                      <div>
                        <p className="text-[12px] font-medium text-slate-700">
                          {a.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          {reqData.status === "pending" && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 border-t border-slate-100">
              <button
                onClick={() => setShowApprove(true)}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold shadow-sm shadow-red-200 transition-all active:scale-[.98]"
              >
                Approve
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all active:scale-[.98]"
              >
                Reject
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ══ MODALS ══ */}
      <RejectModal
        open={showReject}
        onClose={onRejectModalClose}
        onConfirm={onRejectConfirm}
        companyName={reqData.companyName}
      />
      <ApproveModal
        open={showApprove}
        onClose={() => setShowApprove(false)}
        onConfirm={onApproveConfirm}
        companyName={reqData.companyName}
      />
      {previewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl w-[80%] max-w-3xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Document Preview</h3>
              <button onClick={() => setPreviewOpen(false)}>✕</button>
            </div>

            {/* Detect file type */}
            {reqData?.document?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              // ✅ Image Preview
              <img
                src={reqData.document}
                alt="Document"
                className="w-full max-h-[70vh] object-contain rounded"
              />
            ) : reqData?.document?.endsWith(".pdf") ? (
              // ✅ PDF Preview
              <iframe
                src={reqData.document}
                className="w-full h-[70vh] rounded"
              />
            ) : (
              // ❗ fallback
              <div className="text-center text-gray-500 py-10">
                Preview not supported
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
