import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Header } from "../../shared/components/Header";
import { useLocation } from "react-router-dom";
import { getJobApi } from "../../../shared/services/jobService";

export interface JobDetailData {
  _id: string;
  company: string;
  createdBy: string;

  title: string;
  category: string;
  description: string;
  location: string;
  jobType: string;

  salaryMin: number;
  salaryMax: number;

  skills: string[];

  experienceMin: number;
  experienceMax: number;

  status: string;

  applicationDeadline: string;

  positions: number;
  applicantsCount: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

interface JobDetailCardProps {
  job: JobDetailData | null;
  onSave?: () => void;
  onApply?: () => void;
}

export const JobDetailCard: React.FC<JobDetailCardProps> = ({
  job,
  onSave,
  onApply,
}) => {
  const metaItems = [
    { label: "Type", value: job?.jobType ?? "" },
    {
      label: "Experience",
      value: `${job?.experienceMin ?? ""} - ${job?.experienceMax ?? ""}`,
    },
    {
      label: "Salary",
      value: `${job?.salaryMin ?? ""} - ${job?.salaryMax ?? ""}`,
    },
    { label: "Openings", value: String(job?.positions ?? "") },
    // { label: "Qualification", value: job.qualification },
    { label: "Application Deadline", value: job?.applicationDeadline ?? "" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-[26px] text-gray-900 leading-tight mb-1">
              {job?.title}
            </h1>
            {/* <p className="text-[14px] font-semibold text-gray-700 mb-1">
              {job.company}
            </p> */}
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[13px]">{job?.location}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-4" />

        {/* Meta + Actions */}
        <div className="flex items-start justify-between gap-8">
          <JobMeta items={metaItems} />
          <div className="flex flex-col gap-2.5 shrink-0 min-w-[120px]">
            <Button
              className="bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
              variant="save"
              size="md"
              fullWidth
              onClick={onSave}
            >
              Save
            </Button>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
              variant="apply"
              size="md"
              fullWidth
              onClick={onApply}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Posted */}
        {/* <p className="text-right text-[12px] text-gray-400 mt-3">
          Posted : {job.postedAgo}
        </p> */}
      </div>

      {/* Body */}
      <div className="px-8 py-6 flex gap-8 items-start">
        {/* Left: content */}
        <div className="flex-1 min-w-0">
          <Section title="Description">
            <p>{job?.description}</p>
          </Section>

          {/* <Section title="Responsibilities">
            <BulletList items={job.responsibilities} />
          </Section> */}

          {/* <Section title="Requirements">
            <BulletList items={job.requirements} />
          </Section> */}

          <Section title="Skills Required">
            <p className="text-[13px] text-gray-600">
              {job?.skills.join(", ")}
            </p>
          </Section>
        </div>

        {/* Right: Hiring Process */}
        {/* <div className="w-52 shrink-0">
          <HiringProcess
            steps={job.hiringSteps}
            activeStep={job.activeHiringStep}
          />
        </div> */}
      </div>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "save" | "apply";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-brand-orange text-white hover:bg-orange-600 focus:ring-orange-400",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300",
    save: "bg-brand-green text-white hover:bg-green-600 focus:ring-green-400",
    apply:
      "bg-brand-orange text-white hover:bg-orange-600 focus:ring-orange-400",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface HiringProcessProps {
  steps: string[];
  activeStep?: number;
}

export const HiringProcess: React.FC<HiringProcessProps> = ({
  steps,
  activeStep,
}) => {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
      <h3 className="text-[14px] font-display font-semibold text-gray-800 mb-4 text-center">
        Hiring Process
      </h3>
      <div className="flex flex-col gap-2.5">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`rounded-lg px-4 py-2.5 text-center text-[13px] font-medium transition-colors ${
              activeStep === index
                ? "bg-brand-orange text-white shadow-sm"
                : "bg-white text-gray-700 border border-orange-100"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

interface MetaItem {
  label: string;
  value: string;
}

interface JobMetaProps {
  items: MetaItem[];
}

export const JobMeta: React.FC<JobMetaProps> = ({ items }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1">
          <span className="text-[13px] text-gray-500 font-medium w-44 shrink-0">
            {item.label} :
          </span>
          <span className="text-[13px] text-gray-700">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      <h3 className="text-[15px] font-display font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <div className="text-[13px] text-gray-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

interface BulletListProps {
  items: string[];
}

export const BulletList: React.FC<BulletListProps> = ({ items }) => (
  <ul className="space-y-0.5">
    {items.map((item, i) => (
      <li key={i} className="text-[13px] text-gray-600">
        {item}
      </li>
    ))}
  </ul>
);

export default function Job() {
  const [job, setJob] = useState(null);
  const location = useLocation();
  const jobId = location.state?.jobId;
  const getJob = async () => {
    try {
      const result = await getJobApi(jobId);
      setJob(result.data.data);
      console.log("result of job fetch : ", result);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };
  useEffect(() => {
    getJob();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <JobDetailCard
          job={job}
          onSave={() => alert("Job saved!")}
          onApply={() => alert("Applied!")}
        />
      </main>
    </div>
  );
}
