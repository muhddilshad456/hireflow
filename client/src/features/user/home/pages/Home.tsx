import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Briefcase, FileText, Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
// ⚠️ Adjust these import paths to your project (copied from your Jobs and Profile pages)
import { Header } from "../../shared/components/Header";
import { getJobsApi } from "../../../shared/services/jobService";
import { fetchProfile } from "../../../shared/services/profileService";
import type { Job, JobFilters } from "../../../../types/jobTypes";
import { JobCard } from "../../job/components/jobCard";
import { HomeJobCard } from "../components/HomeJobCard";

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

const HOME_JOBS_LIMIT = 5; // how many jobs to show on the home page
const JOBS_ROUTE = "/jobs"; // ⚠️ your jobs listing page
const PROFILE_ROUTE = "/profile"; // ⚠️ your profile page

// Same shape as the Jobs page's INITIAL_FILTERS, with no filters applied
const HOME_JOB_FILTERS: JobFilters = {
  search: "",
  location: "",
  jobType: [],
  category: [],
  salaryMin: "",
  salaryMax: "",
  experienceMin: "",
  experienceMax: "",
  page: 1,
  limit: HOME_JOBS_LIMIT,
};

/* ------------------------------------------------------------------ */
/*  Types (only the profile fields this page uses)                     */
/* ------------------------------------------------------------------ */

interface HomeUser {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface HomeProfile {
  profileCompleted?: boolean;
  skills?: string[];
  experience?: unknown[];
  resumes?: unknown[];
  coverLetters?: unknown[];
  jobPreference?: {
    role: string;
    type: string;
    location: string;
    workMode: string;
  };
}

// "FULL_TIME" -> "Full time"
const formatEnum = (value?: string) =>
  value
    ? value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : "";

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

interface ProfileBannerProps {
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({
  message = "Complete your profile to get better job recommendations",
  ctaLabel = "Complete Profile",
  onCta,
}) => (
  <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <p className="text-sm text-gray-700 font-medium leading-snug">{message}</p>
    <button
      onClick={onCta}
      className="flex-shrink-0 bg-[#F4522A] hover:bg-[#e04420] active:bg-[#c93b1a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
    >
      {ctaLabel}
    </button>
  </div>
);

const WelcomeCard: React.FC<{ user: HomeUser | null; loading: boolean }> = ({
  user,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-40 rounded bg-gray-200 mb-2" />
          <div className="h-3 w-56 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-xl font-bold text-[#F4522A]">
          {(user?.name?.charAt(0) ?? "?").toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-gray-900 truncate">
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Find your next opportunity below.
        </p>
      </div>
    </div>
  );
};

const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
}> = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F4522A] flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  </div>
);

const JobCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 w-1/2 rounded bg-gray-200 mb-2" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
    <div className="h-3 w-2/3 rounded bg-gray-200 mt-4" />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const Home: React.FC = () => {
  const navigate = useNavigate();

  /* ---------- profile ---------- */
  const [user, setUser] = useState<HomeUser | null>(null);
  const [profile, setProfile] = useState<HomeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileFailed, setProfileFailed] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await fetchProfile();
        const u = result?.data?.user;
        setUser(
          u
            ? {
                id: u.id,
                name: u.name,
                email: u.email,
                profilePicture: u.profilePicture,
              }
            : null,
        );
        // profile is null when the user has no profile document yet
        setProfile(result?.data?.profile ?? null);
      } catch (error: any) {
        console.log(error?.response);
        setProfileFailed(true);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Show the banner only once we know the profile isn't completed.
  // If the profile request failed we don't know, so we hide it.
  const showBanner =
    !profileLoading && !profileFailed && !profile?.profileCompleted;

  /* ---------- jobs ---------- */
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsFailed, setJobsFailed] = useState(false);

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsFailed(false);
    try {
      const res = await getJobsApi(HOME_JOB_FILTERS);
      setJobs(res?.data?.data ?? []);
    } catch (error: any) {
      setJobsFailed(true);
      toast.error(error?.response?.data?.message ?? "Failed to load jobs.");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const pref = profile?.jobPreference;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Profile completion banner */}
        {showBanner && <ProfileBanner onCta={() => navigate(PROFILE_ROUTE)} />}

        {/* Welcome */}
        <WelcomeCard user={user} loading={profileLoading} />

        {/* Preferred role (only if the user set job preferences) */}
        {pref?.role && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              You're looking for
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {pref.role}
              </span>
              {[formatEnum(pref.type), formatEnum(pref.workMode), pref.location]
                .filter(Boolean)
                .map((chip) => (
                  <span
                    key={chip}
                    className="bg-orange-50 text-[#F4522A] px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  >
                    {chip}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Profile summary */}
        {!profileLoading && !profileFailed && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">
                Your profile
              </h2>
              <button
                onClick={() => navigate(PROFILE_ROUTE)}
                className="text-xs font-semibold text-[#F4522A] hover:underline"
              >
                Edit profile
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile
                icon={<Sparkles size={18} />}
                label="Skills"
                value={profile?.skills?.length ?? 0}
              />
              <StatTile
                icon={<Briefcase size={18} />}
                label="Experience"
                value={profile?.experience?.length ?? 0}
              />
              <StatTile
                icon={<FileText size={18} />}
                label="Resumes"
                value={profile?.resumes?.length ?? 0}
              />
              <StatTile
                icon={<Mail size={18} />}
                label="Cover letters"
                value={profile?.coverLetters?.length ?? 0}
              />
            </div>
          </section>
        )}

        {/* Jobs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Explore Jobs</h2>
            <button
              onClick={() => navigate(JOBS_ROUTE)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#F4522A] hover:underline"
            >
              View all jobs
              <ArrowRight size={14} />
            </button>
          </div>

          {jobsLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: HOME_JOBS_LIMIT }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : jobsFailed ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500">We couldn't load jobs.</p>
              <button
                onClick={fetchJobs}
                className="mt-3 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="font-medium text-gray-500">
                No jobs available right now
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Check back again soon.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {jobs.map((job) => (
                <HomeJobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
