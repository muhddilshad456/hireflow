import { useParams, useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type {
  ApiJobStage,
  StageDetail,
  JobLayoutOutletContext,
} from "../pages/JobDetailsLayout";
import {
  HRRoundStage,
  TechnicalRoundStage,
  FinalHRStage,
} from "./stages/interviewStages";
import { ResumeReviewStage } from "./stages/ResumeReviewStage";
import { AssessmentStage } from "./stages/AssessmentStage";
import { DocumentVerificationStage } from "./stages/DocumentVerificationStage";
import { getStageCandidates } from "../services/jobServices";

// Stage components now take the FULL stage shape (with candidates),
// which StageRenderer fetches per-stage. Update the prop type in each
// stage component file from `ApiJobStage` to `StageDetail` — the field
// names are unchanged, so no other logic in those files needs to move.
interface StageComponentProps {
  stage: StageDetail;
}

const toTitleCase = (raw: string) =>
  raw
    .replace(/[_-]/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const STAGE_REGISTRY: Record<
  string,
  React.ComponentType<StageComponentProps>
> = {
  resume_review: ResumeReviewStage,
  assessment: AssessmentStage,
  document_verification: DocumentVerificationStage,
  hr_round: HRRoundStage,
  technical_round: TechnicalRoundStage,
  final_hr: FinalHRStage,
};

/* -------------------------- application status -------------------------- */
// Matches IJobApplication.status
const APPLICATION_STATUSES = [
  "IN_PROGRESS",
  "REJECTED",
  "SELECTED",
  "OFFER_SENT",
  "WITHDRAWN",
] as const;

type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 350;

/* --------------------------- StageRenderer --------------------------- */
export function StageRenderer() {
  const { stageId } = useParams<{ stageId: string }>();
  const { stages, jobId } = useOutletContext<JobLayoutOutletContext>();

  const stageMeta = stages.find((s) => s._id === stageId);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);

  const [stageDetail, setStageDetail] = useState<StageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the raw text input before it drives a network request.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Reset to page 1 whenever the stage, search, or status filter changes.
  useEffect(() => {
    setPage(1);
  }, [stageId, debouncedSearch, statusFilter]);

  // Ignore stale responses if the user switches stage/filters quickly.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!jobId || !stageId) return;

    const requestId = ++requestIdRef.current;

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getStageCandidates(jobId, stageId, {
          search: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          page,
          limit: PAGE_SIZE,
        });

        if (requestId !== requestIdRef.current) return; // stale — a newer request has since fired

        const data = result?.data?.data ?? result?.data;

        setStageDetail({
          _id: stageId,
          name: stageMeta?.name ?? "",
          order: stageMeta?.order ?? 0,
          isMandatory: stageMeta?.isMandatory ?? false,
          isActive: stageMeta?.isActive ?? true,
          candidatesCount: data.total ?? 0,
          candidates: data.candidates ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          totalPages: data.totalPages ?? 1,
        });
      } catch (err) {
        console.log(err);
        if (requestId === requestIdRef.current) {
          setError("Couldn't load candidates for this stage.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchCandidates();
  }, [jobId, stageId, debouncedSearch, statusFilter, page]);

  if (!stageMeta) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
        Stage not found.
      </div>
    );
  }

  const Component = STAGE_REGISTRY[stageMeta.name];

  if (!Component) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
        No view configured yet for "{toTitleCase(stageMeta.name)}".
      </div>
    );
  }

  const hasActiveFilters =
    searchInput.trim().length > 0 || statusFilter !== "ALL";

  return (
    <div className="mt-5">
      {/* ------------------------- Search + Filter bar ------------------------- */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ApplicationStatus | "ALL")
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400"
          >
            <option value="ALL">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {toTitleCase(s)}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchInput("");
                setStatusFilter("ALL");
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------ Results ------------------------------ */}
      {loading && !stageDetail ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-100 p-8 text-[13px] text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading candidates...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-[13px] text-red-600">
          {error}
        </div>
      ) : !stageDetail || stageDetail.candidates.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
          {hasActiveFilters
            ? "No candidates match your search/filter."
            : "No applications in this stage yet."}
        </div>
      ) : (
        <div className={loading ? "pointer-events-none opacity-60" : undefined}>
          <Component stage={stageDetail} />
        </div>
      )}

      {/* ----------------------------- Pagination ----------------------------- */}
      {stageDetail && stageDetail.total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {(stageDetail.page - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(stageDetail.page * PAGE_SIZE, stageDetail.total)} of{" "}
            {stageDetail.total}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={stageDetail.page === 1 || loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2 text-xs font-medium text-gray-700">
              Page {stageDetail.page} of {stageDetail.totalPages}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(stageDetail.totalPages, p + 1))
              }
              disabled={stageDetail.page === stageDetail.totalPages || loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
