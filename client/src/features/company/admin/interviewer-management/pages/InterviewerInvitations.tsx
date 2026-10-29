import { useEffect, useState } from "react";
import {
  inviteApi,
  getInvitationsApi,
  cancelInvitationApi,
} from "../../dashboard/services/comapanyServices";
import toast from "react-hot-toast";

/* ═══════════════════════════ TYPES ═══════════════════════════ */
type Status = "PENDING" | "ACCEPTED" | "CANCELLED";
type FilterValue = "all" | "pending" | "accepted" | "cancelled";

interface Invitation {
  _id: string;
  name: string;
  email: string;
  status: Status;
}

/* ═══════════════════════════ CONFIG ═══════════════════════════ */
const ITEMS_PER_PAGE = 10;
const INTERVIEWER_ROLE = "company_interviewer";
const SEARCH_DEBOUNCE_MS = 500;

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_CONFIG: Record<
  Status,
  { label: string; text: string; badge: string; dot: string }
> = {
  ACCEPTED: {
    label: "Accepted",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    text: "text-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  CANCELLED: {
    label: "Cancelled",
    text: "text-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

// Safe fallback so an unexpected status (e.g. EXPIRED) never crashes the UI
const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status as Status] ?? {
    label: status,
    text: "text-slate-500",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

/* ═══════════════════════════ ADD INTERVIEWER MODAL ═══════════════════════════ */

function AddInterviewerModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, email: string) => Promise<boolean>;
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

  // Only change in this modal: wait for the API result, close only on success
  const handleSubmit = async () => {
    if (!validate()) return;

    const success = await onAdd(name.trim(), email.trim());
    if (success) onClose();
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
  invitation,
  onClose,
  onCancelInvite,
}: {
  invitation: Invitation;
  onClose: () => void;
  onCancelInvite: (invitation: Invitation) => void;
}) {
  const cfg = getStatusConfig(invitation.status);

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
            Interviewer Details
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
            {invitation.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-base">
              {invitation.name}
            </p>
            <p className="text-sm text-slate-400">{invitation.email}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {invitation.status === "PENDING" && (
            <button
              onClick={() => onCancelInvite(invitation)}
              className="flex-1 bg-rose-500 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-rose-600 transition-colors"
            >
              Cancel Invite
            </button>
          )}
        </div>
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
export function InterviewerInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [totalInvitations, setTotalInvitations] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<FilterValue>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingInvitation, setViewingInvitation] = useState<Invitation | null>(
    null,
  );
  const [cancellingInvitation, setCancellingInvitation] =
    useState<Invitation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const totalPages = Math.ceil(totalInvitations / ITEMS_PER_PAGE);

  /* ── Debounce search ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  /* ── Fetch invitations ── */
  useEffect(() => {
    let ignore = false;

    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const res = await getInvitationsApi({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch,
          status: filterStatus === "all" ? "" : filterStatus,
          role: INTERVIEWER_ROLE,
        });

        if (ignore) return;

        setInvitations(res?.data?.invitations ?? []);
        setTotalInvitations(res?.data?.totalInvitations ?? 0);
      } catch (error: any) {
        if (ignore) return;
        toast.error(
          error?.response?.data?.message || "Failed to fetch invitations.",
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchInvitations();

    // Ignore stale responses when params change quickly
    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearch, filterStatus, refreshKey]);

  /* ── If the current page no longer exists (e.g. after cancel), step back ── */
  useEffect(() => {
    if (!loading && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [loading, totalPages, currentPage]);

  const refetch = () => setRefreshKey((k) => k + 1);

  const handleCancel = async () => {
    if (!cancellingInvitation) return;

    setIsCancelling(true);
    try {
      await cancelInvitationApi(cancellingInvitation._id);
      toast.success("Invitation cancelled successfully.");
      setCancellingInvitation(null);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to cancel invitation.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Returns true on success so the modal knows whether it can close
  const handleAdd = async (name: string, email: string): Promise<boolean> => {
    try {
      await inviteApi({
        name,
        email,
        role: INTERVIEWER_ROLE,
      });
      toast.success("Invite sent successfully.");
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send invite.");
      return false;
    }
  };

  const handleFilterChange = (val: FilterValue) => {
    setFilterStatus(val);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const handleCancelFromView = (invitation: Invitation) => {
    setViewingInvitation(null);
    setCancellingInvitation(invitation);
  };

  const currentFilterLabel =
    FILTER_OPTIONS.find((o) => o.value === filterStatus)?.label ?? "All";

  return (
    <>
      {/* Modals */}
      {showAddModal && (
        <AddInterviewerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {viewingInvitation && (
        <ViewDetailsModal
          invitation={viewingInvitation}
          onClose={() => setViewingInvitation(null)}
          onCancelInvite={handleCancelFromView}
        />
      )}
      {cancellingInvitation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isCancelling && setCancellingInvitation(null)}
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
                {cancellingInvitation.name}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingInvitation(null)}
                disabled={isCancelling}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Keep
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 bg-rose-500 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <div className="space-y-5">
        {/* ── Top row: Title + Add button ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Interviewer Invitations
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors flex-shrink-0"
            style={{ backgroundColor: "#6abf4b" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#58a83b")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#6abf4b")
            }
          >
            <span className="text-base leading-none">+</span>
            Add Interviewer
          </button>
        </div>

        {/* ── Table section ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e8e8e4" }}
        >
          {/* Invitations row + search + filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <h2 className="font-bold text-slate-800 text-[15px]">
              Invitations
            </h2>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email"
                  className="w-56 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Filter pill */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                  style={{ backgroundColor: "#e8e8e4", color: "#444" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ddddd8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e8e8e4")
                  }
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
                  {currentFilterLabel}
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden min-w-[120px]">
                    {FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleFilterChange(opt.value)}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                          filterStatus === opt.value
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr
                  style={{
                    borderTop: "1px solid #e8e8e4",
                    borderBottom: "1px solid #e8e8e4",
                  }}
                >
                  {[
                    "Interviewer Name",
                    "Email",
                    "Status",
                    "Actions",
                    "View Details",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold"
                      style={{ color: "#888884" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      No interviewers found.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv, idx) => {
                    const cfg = getStatusConfig(inv.status);
                    return (
                      <tr
                        key={inv._id}
                        style={{
                          borderBottom:
                            idx < invitations.length - 1
                              ? "1px solid #f0f0eb"
                              : "none",
                        }}
                      >
                        {/* Name */}
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {inv.name}
                        </td>
                        {/* Email */}
                        <td className="px-6 py-4 text-slate-500">
                          {inv.email}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`font-semibold text-sm ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          {inv.status === "PENDING" && (
                            <button
                              onClick={() => setCancellingInvitation(inv)}
                              className="text-white text-xs font-bold px-5 py-2 rounded-full transition-colors"
                              style={{ backgroundColor: "#f87171" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#ef4444")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f87171")
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                        {/* View Details */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setViewingInvitation(inv)}
                            className="text-sm font-semibold transition-colors"
                            style={{ color: "#6abf4b" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#58a83b")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "#6abf4b")
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4" style={{ borderTop: "1px solid #f0f0eb" }}>
            <Pagination
              current={currentPage}
              total={Math.max(totalPages, 1)}
              onChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
