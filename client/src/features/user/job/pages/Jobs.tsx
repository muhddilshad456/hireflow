import { useEffect, useState } from "react";
import { Header } from "../../shared/components/Header";
import { getJobsApi } from "../../../shared/services/jobService";
import toast from "react-hot-toast";
import type { JobFilters } from "../../../../types/jobTypes";
import { JobCard } from "./components/jobCard";
import type { Job } from "../../../../types/jobTypes";
import { FilterSidebar } from "./components/filterSidebar";

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  filters: JobFilters;
  onChange: (key: keyof JobFilters, value: string) => void;
  onSearch?: () => void;
  loading: boolean;
}

function SearchBar({ filters, onChange }: SearchBarProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #eee",
        padding: "10px 12px",
        display: "flex",
        gap: 10,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        marginBottom: 24,
      }}
    >
      {/* Job search */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f8f8f8",
          borderRadius: 10,
          padding: "9px 14px",
        }}
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="#bbb"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Job title, keywords…"
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#333",
            width: "100%",
          }}
        />
      </div>
      {/* Location */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f8f8f8",
          borderRadius: 10,
          padding: "9px 14px",
        }}
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="#bbb"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <input
          type="text"
          placeholder="City, country…"
          value={filters.location}
          onChange={(e) => onChange("location", e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#333",
            width: "100%",
          }}
        />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #f5f5f5",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
      <div style={{ display: "flex", gap: 14, flex: 1 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "#f5f5f5",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 14,
              background: "#f5f5f5",
              borderRadius: 6,
              width: "45%",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              height: 12,
              background: "#f5f5f5",
              borderRadius: 6,
              width: "25%",
              marginBottom: 10,
            }}
          />
          <div
            style={{
              height: 11,
              background: "#f5f5f5",
              borderRadius: 6,
              width: "60%",
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: 100,
          height: 36,
          background: "#f5f5f5",
          borderRadius: 10,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "#fff0ee",
          border: "1px solid #fcddd9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="#e84b30"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          opacity={0.5}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#555",
          marginBottom: 4,
        }}
      >
        No jobs found
      </div>
      <div style={{ fontSize: 12, color: "#aaa" }}>
        Try adjusting your search or filters.
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

function Pagination({ current, total, onChange }: PaginationProps) {
  const btnBase: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid #e8e8e8",
    background: "#fff",
    fontSize: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
    fontWeight: 500,
  };

  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {/* Prev */}
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={{ ...btnBase, opacity: current === 1 ? 0.4 : 1 }}
      >
        ‹
      </button>

      {/* Pages */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            ...btnBase,
            background: current === p ? "#e84b30" : "#fff",
            color: current === p ? "#fff" : "#555",
          }}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={{ ...btnBase, opacity: current === total ? 0.4 : 1 }}
      >
        ›
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const INITIAL_FILTERS: JobFilters = {
  search: "",
  location: "",
  jobType: [],
  category: [],
  salaryMin: "",
  salaryMax: "",
  experienceMin: "",
  experienceMax: "",
  page: 1,
  limit: 2,
};

export function Jobs() {
  const [filters, setFilters] = useState<JobFilters>(INITIAL_FILTERS);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleChange = (key: keyof JobFilters, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await getJobsApi(filters);
        console.log("filter for get jobs : ", filters);
        console.log("result of job fetch : ", res);
        setJobs(res.data.data.data);
        setTotalPages(res.data.data.totalPages);
      } catch (error: any) {
        console.error(error?.response?.data);
        toast.error(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px" }}>
        {/* Search bar always on top */}
        <SearchBar
          filters={filters}
          onChange={handleChange}
          loading={loading}
        />

        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          style={{
            display: "none",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#e84b30",
            background: "#fff0ee",
            border: "1px solid #fcddd9",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: "pointer",
            marginBottom: 16,
          }}
          className="mobile-filter-btn"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="#e84b30"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <style>{`
          @media (max-width: 640px) {
            .mobile-filter-btn { display: flex !important; }
            .sidebar-wrapper { display: ${mobileFiltersOpen ? "block" : "none"} !important; }
          }
          @media (max-width: 640px) {
            .main-layout { flex-direction: column !important; }
          }
        `}</style>

        {/* Layout */}
        <div
          className="main-layout"
          style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
        >
          {/* Sidebar */}
          <div className="sidebar-wrapper">
            <FilterSidebar
              filters={filters}
              onChange={handleChange}
              //   onToggleSkill={handleToggleSkill}
              onReset={handleReset}
            />
          </div>

          {/* Job list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Results count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 12, color: "#999" }}>
                Showing <strong style={{ color: "#333" }}>{jobs.length}</strong>{" "}
                jobs
              </span>
            </div>

            {loading ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[...Array(4)].map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  onChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
