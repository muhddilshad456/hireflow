import React, { useState } from "react";
import { Header } from "../../shared/components/Header";
import { SlidersHorizontal } from "lucide-react";
import { MapPin, Bookmark } from "lucide-react";

interface ProfileBannerProps {
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({
  message = "Complete your profile to get better job recommendations",
  ctaLabel = "Complete Profile",
  onCta,
}) => {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p className="text-sm text-gray-700 font-medium leading-snug">
        {message}
      </p>
      <button
        onClick={onCta}
        className="flex-shrink-0 bg-[#F4522A] hover:bg-[#e04420] active:bg-[#c93b1a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
      >
        {ctaLabel}
      </button>
    </div>
  );
};

export interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  type?: string;
  salary?: string;
  logo?: string;
  isNew?: boolean;
  isSaved?: boolean;
}

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
  onSave?: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails, onSave }) => {
  const initials = job.company
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-200 p-5 flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-3">
        {/* Company Logo / Initials */}
        <div className="flex items-center gap-3">
          {job.logo ? (
            <img
              src={job.logo}
              alt={job.company}
              className="w-11 h-11 rounded-xl object-contain border border-gray-100 bg-gray-50"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F4522A] font-bold text-sm flex-shrink-0">
              {initials}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#F4522A] transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave?.(job)}
          className={`p-1.5 rounded-lg hover:bg-orange-50 transition-colors flex-shrink-0 ${
            job.isSaved
              ? "text-[#F4522A]"
              : "text-gray-300 hover:text-[#F4522A]"
          }`}
          title="Save job"
        >
          <Bookmark size={16} fill={job.isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <MapPin size={12} className="text-gray-400" />
          {job.location}
        </span>
        {job.type && (
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
            {job.type}
          </span>
        )}
        {job.salary && (
          <span className="bg-orange-50 text-[#F4522A] px-2 py-0.5 rounded-full font-semibold">
            {job.salary}
          </span>
        )}
        {job.isNew && (
          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">
            New
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-1">
        <button
          onClick={() => onViewDetails?.(job)}
          className="bg-[#F4522A] hover:bg-[#e04420] active:bg-[#c93b1a] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    title: "Java Developer",
    company: "Wipro",
    location: "Chennai, India",
    type: "Full-time",
    salary: "₹8–14 LPA",
    isNew: true,
  },
  {
    id: 2,
    title: "Java Developer",
    company: "Wipro",
    location: "Chennai, India",
    type: "Remote",
    salary: "₹10–16 LPA",
  },
  {
    id: 3,
    title: "Java Developer",
    company: "Wipro",
    location: "Chennai, India",
    type: "Hybrid",
    salary: "₹9–15 LPA",
    isNew: true,
  },
];

const FILTERS = ["All", "Full-time", "Remote", "Hybrid", "Part-time"];

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showBanner, setShowBanner] = useState(true);

  const handleSave = (job: Job) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, isSaved: !j.isSaved } : j)),
    );
  };

  const handleViewDetails = (job: Job) => {
    alert(`Viewing details for: ${job.title} at ${job.company}`);
  };

  const filteredJobs =
    activeFilter === "All" ? jobs : jobs.filter((j) => j.type === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Profile Banner */}
        {showBanner && <ProfileBanner onCta={() => setShowBanner(false)} />}

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recommended Jobs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredJobs.length} jobs found
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#F4522A] border border-gray-200 hover:border-orange-200 bg-white px-3 py-1.5 rounded-lg transition-colors">
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeFilter === f
                  ? "bg-[#F4522A] text-white border-[#F4522A] shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#F4522A] hover:text-[#F4522A]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        <div className="flex flex-col gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleViewDetails}
                onSave={handleSave}
              />
            ))
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-500">No jobs found</p>
              <p className="text-sm mt-1">Try a different filter</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
