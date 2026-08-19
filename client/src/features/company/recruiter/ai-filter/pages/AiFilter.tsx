import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { callAiForRanking } from "../services/aiServices";
import { moveToNextStageBulk } from "../../shared/services/stageService";

// ── Types ──────────────────────────────────────────────────────────

type Verdict = "STRONG_MATCH" | "GOOD_MATCH" | "PARTIAL_MATCH" | "NOT_SUITABLE";

interface Breakdown {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  roleRelevanceScore: number;
}

interface Candidate {
  applicationId: string;
  userId: string;
  name: string;
  overallScore: number;
  verdict: Verdict;
  breakdown: Breakdown;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

type Status = "loading" | "success" | "error";

const VERDICT_STYLES: Record<
  Verdict,
  { label: string; bg: string; text: string; dot: string }
> = {
  STRONG_MATCH: {
    label: "Strong Match",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  GOOD_MATCH: {
    label: "Good Match",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
  PARTIAL_MATCH: {
    label: "Partial Match",
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  NOT_SUITABLE: {
    label: "Not Suitable",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

const LOADING_MESSAGES = [
  "Reading resume review candidates…",
  "Comparing profiles against job requirements…",
  "Scoring skills, experience, and education…",
  "Ranking candidates…",
];

// ── Small components ─────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor =
    score >= 80
      ? "#10B981"
      : score >= 60
        ? "#3B82F6"
        : score >= 40
          ? "#F59E0B"
          : "#EF4444";

  return (
    <div className="relative w-11 h-11  shrink-0">
      <svg width="100%" height="100%" viewBox="0 0 52 52">
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="5"
        />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[12px] sm:text-[13px] font-bold text-slate-900">
        {score}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  checked,
  onToggle,
  expanded,
  onExpandToggle,
}: {
  candidate: Candidate;
  checked: boolean;
  onToggle: (id: string) => void;
  expanded: boolean;
  onExpandToggle: (id: string) => void;
}) {
  const verdict = VERDICT_STYLES[candidate.verdict];

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        checked ? "border-blue-600 bg-blue-50/40" : "border-slate-200 bg-white"
      } p-4 sm:p-5`}
    >
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(candidate.applicationId)}
          aria-label={`Select ${candidate.name}`}
          className="mt-1 sm:mt-0 w-[18px] h-[18px] accent-blue-600 cursor-pointer shrink-0"
        />

        <ScoreRing score={candidate.overallScore} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px] text-slate-900 truncate">
              {candidate.name}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 ${verdict.bg} ${verdict.text} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${verdict.dot} inline-block`}
              />
              {verdict.label}
            </span>
          </div>

          <div className="mt-1.5 flex gap-1.5 flex-wrap">
            {candidate.matchedSkills.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                {s}
              </span>
            ))}
            {candidate.missingSkills.slice(0, 2).map((s) => (
              <span
                key={s}
                className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md line-through"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => onExpandToggle(candidate.applicationId)}
          className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-slate-700 text-[13px] font-medium px-2 py-1.5 shrink-0"
        >
          Why this score
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* mobile "why this score" toggle, full width below the row */}
      <button
        onClick={() => onExpandToggle(candidate.applicationId)}
        className="sm:hidden mt-3 flex items-center justify-center gap-1 w-full text-slate-500 text-[13px] font-medium py-1.5 border-t border-slate-100 pt-3"
      >
        Why this score
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {(
            [
              ["Skills", candidate.breakdown.skillsScore],
              ["Experience", candidate.breakdown.experienceScore],
              ["Education", candidate.breakdown.educationScore],
              ["Role fit", candidate.breakdown.roleRelevanceScore],
            ] as [string, number][]
          ).map(([label, val]) => (
            <div key={label}>
              <div className="text-[11px] text-slate-400 mb-1">{label}</div>
              <div className="h-[5px] rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${val}%` }}
                />
              </div>
              <div className="text-xs text-slate-600 mt-1 font-semibold">
                {val}
              </div>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4 mt-1">
            <p className="text-[13px] text-slate-600 leading-relaxed m-0">
              {candidate.reasoning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[380px] shadow-2xl"
      >
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-[17px] font-bold text-slate-900 m-0">
            Move {count} candidate{count !== 1 ? "s" : ""} to HR Interview?
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
          Selected candidates will move to the next stage of the hiring
          pipeline.
        </p>
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl border-none bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700"
          >
            Confirm move
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────

export function AiFilterResultsPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [moved, setMoved] = useState(false);

  const { jobId } = useParams<{ jobId: string }>();

  useEffect(() => {
    if (!jobId) {
      console.log("job id missing.");
      return;
    }
    const msgInterval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);

    const fetchCandidates = async () => {
      try {
        const res = await callAiForRanking(jobId);

        console.log("ai response : ", res);

        setCandidates(res.data);
        setStatus("success");

        clearInterval(msgInterval);
      } catch (error) {
        console.error(error);
        setStatus("error");
        clearInterval(msgInterval);
      }
    };

    fetchCandidates();

    return () => {
      clearInterval(msgInterval);
    };
  }, []);

  const toggleOne = (applicationId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(applicationId)
        ? next.delete(applicationId)
        : next.add(applicationId);
      return next;
    });
  };

  const toggleExpand = (applicationId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(applicationId)
        ? next.delete(applicationId)
        : next.add(applicationId);
      return next;
    });
  };

  const allSelected =
    candidates.length > 0 && selected.size === candidates.length;
  const toggleAll = () => {
    setSelected(
      allSelected ? new Set() : new Set(candidates.map((c) => c.applicationId)),
    );
  };

  const handleConfirmMove = async () => {
    try {
      const result = await moveToNextStageBulk([...selected]);

      const succeededIds = new Set(
        result.succeeded.map((s: any) => s.applicationId),
      );

      setShowConfirm(false);
      setMoved(true);
      setCandidates((prev) =>
        prev.filter((c) => !succeededIds.has(c.applicationId)),
      );
      setSelected(new Set());
      setTimeout(() => setMoved(false), 3000);

      if (result.failed.length > 0) {
        console.warn("Some candidates couldn't be moved:", result.failed);
      }
    } catch (err) {
      console.error("Bulk move failed:", err);
    }
  };

  return (
    <>
      <div className="flex relative">
        {/* Main content */}
        <div className="flex-1 px-4 sm:px-8 py-6 sm:py-7 max-w-[980px] w-full">
          <h1 className="text-xl sm:text-[24px] font-extrabold text-slate-900 m-0">
            AI Candidate Ranking
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-6 sm:mb-[26px]">
            eng · Resume Review
          </p>

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-[90px] px-5 bg-white rounded-2xl border border-slate-100">
              <Loader2 size={30} className="text-blue-600 animate-spin" />
              <p className="mt-4 sm:mt-[18px] text-[15px] font-semibold text-slate-900 text-center px-4">
                {LOADING_MESSAGES[loadingMsgIndex]}
              </p>
              <p className="mt-1.5 text-[13px] text-slate-400 text-center px-4">
                This can take a moment for larger candidate pools.
              </p>
            </div>
          )}

          {status === "success" && (
            <>
              {moved && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold mb-4">
                  <CheckCircle2 size={16} />
                  Candidates moved to HR Interview
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <label
                  className={`flex items-center gap-2 text-[13px] text-slate-700 font-semibold ${
                    candidates.length ? "cursor-pointer" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={candidates.length === 0}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  Select all ({candidates.length})
                </label>

                <button
                  onClick={() => selected.size > 0 && setShowConfirm(true)}
                  disabled={selected.size === 0}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-[18px] py-2.5 rounded-[10px] font-bold text-sm transition-colors ${
                    selected.size > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Move {selected.size > 0 ? `Selected (${selected.size})` : ""}{" "}
                  to Next Round
                  <ArrowRight size={16} />
                </button>
              </div>

              {candidates.length === 0 ? (
                <div className="text-center py-16 sm:py-[70px] px-5 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
                  No candidates remaining in Resume Review.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {candidates.map((c) => (
                    <CandidateCard
                      key={c.applicationId}
                      candidate={c}
                      checked={selected.has(c.applicationId)}
                      onToggle={toggleOne}
                      expanded={expanded.has(c.applicationId)}
                      onExpandToggle={toggleExpand}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          count={selected.size}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmMove}
        />
      )}
    </>
  );
}
