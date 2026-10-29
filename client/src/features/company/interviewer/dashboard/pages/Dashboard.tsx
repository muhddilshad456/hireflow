import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Video,
} from "lucide-react";
import {
  StatCard,
  StatCardSkeleton,
} from "../../../../shared/components/StatCard";
import { SimpleBarChart } from "../components/Simplebarchart";
import type { InterviewerDashboardData } from "../../../../../types/company/interviewer/interviewerTypes";
import { getInterviewerDashboard } from "../services/Interviewerdashboardservices";

// "technical_interview" -> "Technical Interview"
const toTitleCase = (raw: string) =>
  raw
    .replace(/[_-]/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

// "28 Oct, 10:30 am"
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export function InterviewerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<InterviewerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInterviewerDashboard();
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your interviews at a glance.
      </p>

      {/* ---------- stat cards ---------- */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {loading || !stats ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Upcoming interviews"
              value={stats.upcoming}
              icon={<CalendarClock size={18} />}
            />
            <StatCard
              label="Awaiting feedback"
              value={stats.awaitingFeedback}
              icon={<MessageSquare size={18} />}
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              icon={<CheckCircle2 size={18} />}
            />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* ---------- chart ---------- */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">
            Interviews by status
          </h2>
          <div className="mt-4">
            {loading || !stats ? (
              <div className="space-y-4 animate-pulse">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
                    <div className="h-2.5 w-full rounded-full bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <SimpleBarChart
                emptyText="No interviews assigned to you yet."
                items={[
                  {
                    label: "Upcoming",
                    count: stats.upcoming,
                    barClass: "bg-blue-500",
                  },
                  {
                    label: "Awaiting feedback",
                    count: stats.awaitingFeedback,
                    barClass: "bg-amber-500",
                  },
                  {
                    label: "Completed",
                    count: stats.completed,
                    barClass: "bg-emerald-500",
                  },
                  {
                    label: "Cancelled",
                    count: stats.cancelled,
                    barClass: "bg-slate-400",
                  },
                ]}
              />
            )}
          </div>
        </section>

        {/* ---------- upcoming interviews ---------- */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">
            Upcoming interviews
          </h2>
          <div className="mt-4">
            {loading || !data ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : data.upcomingInterviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No upcoming interviews.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.upcomingInterviews.map((interview) => (
                  <li
                    key={interview._id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-gray-900">
                        {interview.candidateName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {interview.jobTitle}
                        {interview.stageName &&
                          ` · ${toTitleCase(interview.stageName)}`}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatDateTime(interview.scheduledAt)}
                        {interview.duration
                          ? ` · ${interview.duration} min`
                          : ""}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        navigate(
                          `/company/interviewer/interview/${interview._id}`,
                        )
                      }
                      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
                    >
                      <Video size={14} />
                      Join
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
