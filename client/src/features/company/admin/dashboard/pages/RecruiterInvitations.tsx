import { useState } from "react";
import SearchInput from "../../../shared/components/SearchBar";
import { inviteApi } from "../services/comapanyServices";
import toast from "react-hot-toast";

/* ═══════════════════════════ TYPES ═══════════════════════════ */
type Status = "Accepted" | "Pending" | "Rejected";

interface Recruiter {
  id: number;
  name: string;
  email: string;
  status: Status;
}

/* ═══════════════════════════ DATA ═══════════════════════════ */
const MOCK_RECRUITERS: Recruiter[] = [
  { id: 1, name: "Dilshad", email: "dilshad@gmail.com", status: "Accepted" },
  { id: 2, name: "Rishad", email: "rishad@gmail.com", status: "Pending" },
  { id: 3, name: "Amina", email: "amina@gmail.com", status: "Accepted" },
  { id: 4, name: "Faiz", email: "faiz@gmail.com", status: "Pending" },
  { id: 5, name: "Sneha", email: "sneha@gmail.com", status: "Rejected" },
  { id: 6, name: "Arjun", email: "arjun@gmail.com", status: "Accepted" },
  { id: 7, name: "Meera", email: "meera@gmail.com", status: "Pending" },
  { id: 8, name: "Ravi", email: "ravi@gmail.com", status: "Accepted" },
  { id: 9, name: "Lena", email: "lena@gmail.com", status: "Rejected" },
  { id: 10, name: "Omar", email: "omar@gmail.com", status: "Pending" },
  { id: 11, name: "Priya", email: "priya@gmail.com", status: "Accepted" },
  { id: 12, name: "Tariq", email: "tariq@gmail.com", status: "Pending" },
  { id: 13, name: "Hana", email: "hana@gmail.com", status: "Accepted" },
  { id: 14, name: "Vikram", email: "vikram@gmail.com", status: "Rejected" },
  { id: 15, name: "Zara", email: "zara@gmail.com", status: "Pending" },
  { id: 16, name: "Jay", email: "jay@gmail.com", status: "Accepted" },
  { id: 17, name: "Nina", email: "nina@gmail.com", status: "Pending" },
  { id: 18, name: "Rahul", email: "rahul@gmail.com", status: "Accepted" },
  { id: 19, name: "Sofia", email: "sofia@gmail.com", status: "Rejected" },
  { id: 20, name: "Aarav", email: "aarav@gmail.com", status: "Pending" },
];

const ITEMS_PER_PAGE = 2;

/* ═══════════════════════════ STATUS CONFIG ═══════════════════════════ */
const STATUS_STYLES: Record<Status, string> = {
  Accepted: "text-emerald-600",
  Pending: "text-amber-500",
  Rejected: "text-rose-500",
};

/* ═══════════════════════════ ADD RECRUITER MODAL ═══════════════════════════ */

function AddRecruiterModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, email: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // ✅ Email regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onAdd(name.trim(), email.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-800">Add Recruiter</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" })); // clear error
              }}
              placeholder="Enter recruiter name"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm ${
                errors.name
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-400"
              } focus:outline-none focus:ring-2`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="Enter email address"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm ${
                errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-400"
              } focus:outline-none focus:ring-2`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-sm font-bold py-2.5 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 bg-emerald-500 text-white text-sm font-bold py-2.5 rounded-xl"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ VIEW DETAILS MODAL ═══════════════════════════ */
function ViewDetailsModal({
  recruiter,
  onClose,
}: {
  recruiter: Recruiter;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-800">
            Recruiter Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
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

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-sm">
            {recruiter.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-base">
              {recruiter.name}
            </p>
            <p className="text-sm text-slate-400">{recruiter.email}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              recruiter.status === "Accepted"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : recruiter.status === "Pending"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                recruiter.status === "Accepted"
                  ? "bg-emerald-500"
                  : recruiter.status === "Pending"
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
            />
            {recruiter.status}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 border border-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ PAGINATION ═══════════════════════════ */
function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];

  if (total <= 6) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (current > 4) pages.push("...");
    if (current > 3 && current < total - 1) pages.push(current);
    pages.push("...", total);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dot-${i}`}
            className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
              current === p
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */
export function RecruiterInvitations() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>(MOCK_RECRUITERS);
  const [filterStatus, setFilterStatus] = useState<"Active" | "All">("Active");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingRecruiter, setViewingRecruiter] = useState<Recruiter | null>(
    null,
  );
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  /* ── filter ── */
  const filtered =
    filterStatus === "Active"
      ? recruiters.filter((r) => r.status !== "Rejected")
      : recruiters;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* ── actions ── */
  const handleCancel = (id: number) => {
    setRecruiters((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)),
    );
    setCancellingId(null);
  };

  const handleAdd = async (name: string, email: string) => {
    try {
      const result = await inviteApi({
        name,
        email,
        role: "company_recruiter",
      });
      console.log("result from invite recruiter : ", result);
      toast.success("invite send successfully.");
    } catch (error: any) {
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleFilterChange = (val: "Active" | "All") => {
    setFilterStatus(val);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  return (
    <>
      {/* ── Modals ── */}
      {showAddModal && (
        <AddRecruiterModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {viewingRecruiter && (
        <ViewDetailsModal
          recruiter={viewingRecruiter}
          onClose={() => setViewingRecruiter(null)}
        />
      )}

      {/* ── Confirm Cancel ── */}
      {cancellingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setCancellingId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-black text-slate-800 mb-2">
              Cancel Invitation?
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              This will revoke the invitation for{" "}
              <span className="font-semibold text-slate-700">
                {recruiters.find((r) => r.id === cancellingId)?.name}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingId(null)}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Keep
              </button>
              <button
                onClick={() => handleCancel(cancellingId)}
                className="flex-1 bg-rose-500 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-rose-600 transition-colors"
              >
                Cancel Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Recruiter Management
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage and track recruiter invitations.
            </p>
          </div>
          <SearchInput />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition-colors hover:from-emerald-600 hover:to-teal-600 flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Recruiter
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="font-bold text-slate-700">Invitations</h2>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                {filterStatus}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden min-w-[100px]">
                  {(["Active", "All"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleFilterChange(opt)}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                        filterStatus === opt
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {[
                    "Recruiter Name",
                    "Email",
                    "Status",
                    "Actions",
                    "View Details",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider first:pl-6 last:pr-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      No recruiters found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-5 pl-6 py-4 font-semibold text-slate-700">
                        {r.name}
                      </td>
                      {/* Email */}
                      <td className="px-5 py-4 text-slate-500">{r.email}</td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold ${STATUS_STYLES[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        {r.status === "Pending" && (
                          <button
                            onClick={() => setCancellingId(r.id)}
                            className="bg-rose-400 hover:bg-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                      {/* View */}
                      <td className="px-5 pr-6 py-4">
                        <button
                          onClick={() => setViewingRecruiter(r)}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 pb-4">
              <Pagination
                current={currentPage}
                total={totalPages}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
