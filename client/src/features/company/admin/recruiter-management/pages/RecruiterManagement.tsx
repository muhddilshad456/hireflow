import { useEffect, useState } from "react";
import { getRecruitersApi } from "../../dashboard/services/comapanyServices";
import toast from "react-hot-toast";
import { updateStatusApi } from "../../../../admin/services/adminServices";

/* ═══════════════════════════ TYPES ═══════════════════════════ */
type FilterValue = "all" | "unblocked" | "blocked";

interface Member {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

/* ═══════════════════════════ CONFIG ═══════════════════════════ */
const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 500;

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Unblocked", value: "unblocked" },
  { label: "Blocked", value: "blocked" },
];

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
export function RecruiterManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<FilterValue>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [confirmMember, setConfirmMember] = useState<Member | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  /* ── Debounce search ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  /* ── Fetch members ── */
  useEffect(() => {
    let ignore = false;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await getRecruitersApi({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch,
          status: filterStatus === "all" ? "" : filterStatus,
        });

        if (ignore) return;

        setMembers(res?.data?.members ?? []);
        setTotalCount(res?.data?.totalCount ?? 0);
      } catch (error: any) {
        if (ignore) return;
        toast.error(
          error?.response?.data?.message || "Failed to fetch recruiters.",
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMembers();

    // Ignore stale responses when params change quickly
    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearch, filterStatus, refreshKey]);

  /* ── If the current page no longer exists, step back ── */
  useEffect(() => {
    if (!loading && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [loading, totalPages, currentPage]);

  const refetch = () => setRefreshKey((k) => k + 1);

  const handleToggleBlock = async () => {
    if (!confirmMember) return;

    const newStatus = confirmMember.isBlocked ? "ACTIVE" : "BLOCKED";

    setIsUpdating(true);
    try {
      await updateStatusApi(confirmMember._id, newStatus);
      toast.success(
        confirmMember.isBlocked
          ? "Recruiter unblocked successfully."
          : "Recruiter blocked successfully.",
      );
      setConfirmMember(null);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update recruiter status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFilterChange = (val: FilterValue) => {
    setFilterStatus(val);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const currentFilterLabel =
    FILTER_OPTIONS.find((o) => o.value === filterStatus)?.label ?? "All";

  return (
    <>
      {/* Block / Unblock confirm modal */}
      {confirmMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isUpdating && setConfirmMember(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-black text-slate-800 mb-2">
              {confirmMember.isBlocked
                ? "Unblock Recruiter?"
                : "Block Recruiter?"}
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              {confirmMember.isBlocked
                ? "This will restore access for "
                : "This will block access for "}
              <span className="font-semibold text-slate-700">
                {confirmMember.name}
              </span>
              .
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmMember(null)}
                disabled={isUpdating}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleBlock}
                disabled={isUpdating}
                className={`flex-1 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 ${
                  confirmMember.isBlocked
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-rose-500 hover:bg-rose-600"
                }`}
              >
                {isUpdating
                  ? "Please wait..."
                  : confirmMember.isBlocked
                    ? "Unblock"
                    : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <div className="space-y-5">
        {/* ── Title ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Recruiters
          </h1>
        </div>

        {/* ── Table section ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e8e8e4" }}
        >
          {/* Heading row + search + filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <h2 className="font-bold text-slate-800 text-[15px]">
              All Recruiters
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
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden min-w-[130px]">
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
                  {["Recruiter Name", "Email", "Status", "Actions"].map((h) => (
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
                      colSpan={4}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      No recruiters found.
                    </td>
                  </tr>
                ) : (
                  members.map((m, idx) => (
                    <tr
                      key={m._id}
                      style={{
                        borderBottom:
                          idx < members.length - 1
                            ? "1px solid #f0f0eb"
                            : "none",
                      }}
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {m.name}
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4 text-slate-500">{m.email}</td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold text-sm ${
                            m.isBlocked ? "text-rose-500" : "text-emerald-600"
                          }`}
                        >
                          {m.isBlocked ? "Blocked" : "Unblocked"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setConfirmMember(m)}
                          className={`text-white text-xs font-bold px-5 py-2 rounded-full transition-colors ${
                            m.isBlocked
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-rose-400 hover:bg-rose-500"
                          }`}
                        >
                          {m.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (always visible) */}
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
