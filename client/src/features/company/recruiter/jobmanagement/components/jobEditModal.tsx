import { useState, useCallback, useRef } from "react";
import type { KeyboardEvent, ChangeEvent, DragEvent } from "react";
import {
  OPTIONAL_STAGE_NAMES,
  STAGE_LABELS,
  type JobStageName,
} from "../../../../../constents/jobStages";
import toast from "react-hot-toast";
import type { JobFormData } from "../../../../../types/job/job/jobForm";

// ─── Types ────────────────────────────────────────────────────────────────────

type JobCategory = "IT" | "MARKETING" | "FINANCE" | "HR" | "SALES" | "OTHER";
type JobType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";

export interface EditableJob {
  _id: string;
  title: string;
  category: string;
  jobType: JobType;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  experienceMin?: number;
  experienceMax?: number;
  positions: number;
  applicationDeadline?: string | Date;
  applicantsCount: number;
}

// Mirrors the backend IJobStage shape
export interface EditableJobStage {
  _id?: string;
  name: string;
  order: number;
  isMandatory: boolean;
  isActive: boolean;
}

interface FormErrors {
  title?: string;
  category?: string;
  jobType?: string;
  location?: string;
  description?: string;
  minSalary?: string;
  maxSalary?: string;
  skills?: string;
  minExperience?: string;
  maxExperience?: string;
  positions?: string;
}

type EditJobModalProps = {
  job: EditableJob;
  stages: EditableJobStage[]; // full pipeline as currently stored, including the mandatory RESUME_REVIEW
  onClose?: () => void;
  onSubmit: (data: JobFormData) => Promise<void>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validate = (form: JobFormData): FormErrors => {
  const e: FormErrors = {};

  if (!form.title.trim()) e.title = "Job title is required.";
  if (!form.category) e.category = "Please select a category.";
  if (!form.jobType) e.jobType = "Please select a job type.";
  if (!form.location.trim()) e.location = "Location is required.";
  if (!form.description.trim()) e.description = "Description is required.";
  if (form.skills.length === 0) e.skills = "Add at least one skill.";
  if (!form.positions.trim() || Number(form.positions) < 1)
    e.positions = "Enter at least 1 position.";

  // ─── Salary Validation ─────────────────────────────
  if (!form.salaryNotDisclosed) {
    if (!form.minSalary.trim() && !form.maxSalary.trim()) {
      e.minSalary = "Salary range is required.";
    } else if (!form.minSalary.trim()) {
      e.minSalary = "Minimum salary is required.";
    } else if (!form.maxSalary.trim()) {
      e.maxSalary = "Maximum salary is required.";
    } else if (Number(form.minSalary) > Number(form.maxSalary)) {
      e.minSalary = "Min salary cannot be greater than max salary.";
    }
  }

  // ─── Experience Validation ─────────────────────────
  if (!form.fresherOk) {
    if (!form.minExperience.trim() && !form.maxExperience.trim()) {
      e.minExperience = "Experience range is required.";
    } else if (!form.minExperience.trim()) {
      e.minExperience = "Minimum experience is required.";
    } else if (!form.maxExperience.trim()) {
      e.maxExperience = "Maximum experience is required.";
    } else if (Number(form.minExperience) > Number(form.maxExperience)) {
      e.minExperience = "Min experience cannot be greater than max experience.";
    }
  }

  return e;
};

const toDateInputValue = (d?: string | Date): string => {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const buildFormFromJob = (
  job: EditableJob,
  stages: EditableJobStage[],
): JobFormData => ({
  title: job.title ?? "",
  category: (job.category as JobCategory) ?? "",
  jobType: job.jobType ?? "",
  location: job.location ?? "",
  description: job.description ?? "",
  minSalary:
    job.salaryMin !== undefined && job.salaryMin !== null
      ? String(job.salaryMin)
      : "",
  maxSalary:
    job.salaryMax !== undefined && job.salaryMax !== null
      ? String(job.salaryMax)
      : "",
  salaryNotDisclosed:
    (job.salaryMin === undefined || job.salaryMin === null) &&
    (job.salaryMax === undefined || job.salaryMax === null),
  skills: job.skills ?? [],
  minExperience:
    job.experienceMin !== undefined && job.experienceMin !== null
      ? String(job.experienceMin)
      : "",
  maxExperience:
    job.experienceMax !== undefined && job.experienceMax !== null
      ? String(job.experienceMax)
      : "",
  fresherOk:
    (job.experienceMin === undefined || job.experienceMin === null) &&
    (job.experienceMax === undefined || job.experienceMax === null),
  positions: job.positions !== undefined ? String(job.positions) : "1",
  applicationDeadline: toDateInputValue(job.applicationDeadline),
  pipelineStages: stages
    .filter((s) => !s.isMandatory && s.isActive)
    .sort((a, b) => a.order - b.order)
    .map((s) => s.name as JobStageName),
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorMsg = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V5Zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>
      {msg}
    </p>
  ) : null;

const inputCls = (err?: string) =>
  `w-full bg-white border ${
    err
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
      : "border-gray-300 focus:border-green-500 focus:ring-green-500/20"
  } rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2`;

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-900 leading-tight">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── Pipeline pill (shared visual for preview) ────────────────────────────────

const PipelinePill = ({
  label,
  variant,
}: {
  label: string;
  variant: "fixed" | "stage" | "outcome";
}) => {
  const styles =
    variant === "fixed"
      ? "bg-gray-100 text-gray-500 border-gray-200"
      : variant === "outcome"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-green-50 text-green-700 border-green-200";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-lg border text-xs font-semibold ${styles}`}
    >
      {label}
    </span>
  );
};

const Arrow = () => (
  <svg
    className="w-3.5 h-3.5 text-gray-300 shrink-0"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export function EditJobModal({
  job,
  stages,
  onClose,
  onSubmit,
}: EditJobModalProps) {
  const initialForm = buildFormFromJob(job, stages);
  const [form, setForm] = useState<JobFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Once a job has applicants, the hiring pipeline (mandatory stage + optional
  // stages + their order) is frozen so in-flight candidates aren't disrupted.
  // Every other field on the job remains editable.
  const stagesLocked = job.applicantsCount > 0;

  // Drag-and-drop state for pipeline reordering
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchDragIndex = useRef<number | null>(null);

  const set = useCallback(
    <K extends keyof JobFormData>(key: K, val: JobFormData[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
      if (touched) setErrors((prev) => validate({ ...form, [key]: val }));
    },
    [form, touched],
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    set(name as keyof JobFormData, value as never);
  };

  const handleCheck = (key: "salaryNotDisclosed" | "fresherOk") => {
    const next = !form[key];
    const patch: Partial<JobFormData> = { [key]: next };

    if (key === "fresherOk" && next) {
      patch.minExperience = "";
      patch.maxExperience = "";
    }
    if (key === "salaryNotDisclosed" && next) {
      patch.minSalary = "";
      patch.maxSalary = "";
    }

    const merged = { ...form, ...patch };
    setForm(merged);
    if (touched) setErrors(validate(merged));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      set("skills", [...form.skills, s]);
    }
    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    set(
      "skills",
      form.skills.filter((x) => x !== s),
    );
  };

  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // ─── Hiring Pipeline handlers (no-ops enforced by stagesLocked upstream too) ──

  const toggleStage = (stage: JobStageName) => {
    if (stagesLocked) return;
    const isSelected = form.pipelineStages.includes(stage);
    const next = isSelected
      ? form.pipelineStages.filter((s) => s !== stage)
      : [...form.pipelineStages, stage];
    set("pipelineStages", next);
  };

  const moveStage = (from: number, to: number) => {
    if (stagesLocked) return;
    if (from === to || from < 0 || to < 0) return;
    const next = [...form.pipelineStages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set("pipelineStages", next);
  };

  const handleDragStart = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    if (stagesLocked) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    if (stagesLocked) return;
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    if (stagesLocked) return;
    e.preventDefault();
    if (dragIndex !== null) moveStage(dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleTouchStart = (index: number) => () => {
    if (stagesLocked) return;
    touchDragIndex.current = index;
  };

  const stepStage = (index: number, direction: -1 | 1) => {
    moveStage(index, index + direction);
  };

  const handleSubmit = async () => {
    setTouched(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    const payload: JobFormData = {
      ...form,
      pipelineStages: stagesLocked
        ? initialForm.pipelineStages
        : form.pipelineStages,
    };

    try {
      await onSubmit(payload); // real API call, awaited — parent throws on failure
      setLoading(false);
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900)); // let the checkmark be visible briefly
      setSuccess(false);
      onClose?.(); // only close after confirmed success
    } catch (err: any) {
      setLoading(false);
      console.log(err?.response);
      toast.error(err?.response?.data?.message);
    }
  };

  const charCount = form.description.length;
  const isValid = touched ? Object.keys(errors).length === 0 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 shrink-0 bg-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #22c55e 0%, transparent 60%)",
            }}
          />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-green-600">
                  Editing Listing
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Edit Job Listing
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin">
          {/* SECTION 1: Basic Info */}
          <section>
            <SectionHeader
              title="Basic Information"
              subtitle="Core details about the role"
              icon={
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              }
            />
            <div className="space-y-4">
              <div>
                <Label required>Job Title</Label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                  className={inputCls(errors.title)}
                />
                <ErrorMsg msg={errors.title} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Category</Label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputCls(errors.category)}
                  >
                    <option value="">Select category</option>
                    {(
                      [
                        "IT",
                        "MARKETING",
                        "FINANCE",
                        "HR",
                        "SALES",
                        "OTHER",
                      ] as const
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <ErrorMsg msg={errors.category} />
                </div>
                <div>
                  <Label required>Job Type</Label>
                  <select
                    name="jobType"
                    value={form.jobType}
                    onChange={handleChange}
                    className={inputCls(errors.jobType)}
                  >
                    <option value="">Select type</option>
                    {(
                      [
                        "FULL_TIME",
                        "PART_TIME",
                        "INTERNSHIP",
                        "CONTRACT",
                      ] as const
                    ).map((t) => (
                      <option key={t} value={t}>
                        {t.replace("_", " ").charAt(0) +
                          t.replace("_", " ").slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <ErrorMsg msg={errors.jobType} />
                </div>
              </div>

              <div>
                <Label required>Location</Label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore, India · Remote"
                  className={inputCls(errors.location)}
                />
                <ErrorMsg msg={errors.location} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label required>Description</Label>
                  <span
                    className={`text-[10px] font-mono ${charCount > 1900 ? "text-red-500" : "text-gray-400"}`}
                  >
                    {charCount}/2000
                  </span>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the role responsibilities..."
                  className={`${inputCls(errors.description)} resize-none leading-relaxed`}
                />
                <ErrorMsg msg={errors.description} />
              </div>
            </div>
          </section>

          <Divider />

          {/* SECTION 2: Compensation */}
          <section>
            <SectionHeader
              title="Compensation"
              subtitle="Salary scale configurations"
              icon={
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z" />
                </svg>
              }
            />
            <div className="space-y-4">
              <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                <CheckBox
                  checked={form.salaryNotDisclosed}
                  onChange={() => handleCheck("salaryNotDisclosed")}
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  Salary not disclosed
                </span>
              </label>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${form.salaryNotDisclosed ? "opacity-50 pointer-events-none grayscale" : ""}`}
              >
                <div>
                  <Label required={!form.salaryNotDisclosed}>
                    Minimum Salary
                  </Label>
                  <input
                    type="number"
                    name="minSalary"
                    value={form.minSalary}
                    onChange={handleChange}
                    placeholder="e.g. 8 LPA or $70k"
                    className={inputCls(errors.minSalary)}
                    disabled={form.salaryNotDisclosed}
                  />
                  <ErrorMsg msg={errors.minSalary} />
                </div>
                <div>
                  <Label required={!form.salaryNotDisclosed}>
                    Maximum Salary
                  </Label>
                  <input
                    type="number"
                    name="maxSalary"
                    value={form.maxSalary}
                    onChange={handleChange}
                    placeholder="e.g. 15 LPA or $100k"
                    className={inputCls(errors.maxSalary)}
                    disabled={form.salaryNotDisclosed}
                  />
                  <ErrorMsg msg={errors.maxSalary} />
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* SECTION 3: Requirements */}
          <section>
            <SectionHeader
              title="Requirements"
              subtitle="Skills and experience metrics"
              icon={
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
            <div className="space-y-4">
              {/* Skills Area */}
              <div>
                <Label required>Skills Required</Label>
                <div
                  className={`flex flex-wrap gap-2 min-h-[44px] bg-white border ${errors.skills ? "border-red-300" : "border-gray-300"} rounded-xl px-3 py-2 transition-all focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20`}
                >
                  {form.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-green-200"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-green-500 hover:text-green-800 transition-colors ml-0.5"
                      >
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 1l10 10M11 1L1 11" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKey}
                    onBlur={addSkill}
                    placeholder={
                      form.skills.length === 0
                        ? "Type a skill & press Enter…"
                        : "Add more…"
                    }
                    className="flex-1 min-w-[140px] bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                </div>
                <ErrorMsg msg={errors.skills} />
              </div>

              {/* Experience Setup */}
              <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                <CheckBox
                  checked={form.fresherOk}
                  onChange={() => handleCheck("fresherOk")}
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  Fresher / No experience required
                </span>
              </label>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${form.fresherOk ? "opacity-50 pointer-events-none grayscale" : ""}`}
              >
                <div>
                  <Label required={!form.fresherOk}>Minimum Experience</Label>
                  <input
                    type="number"
                    name="minExperience"
                    value={form.minExperience}
                    onChange={handleChange}
                    placeholder="e.g. 1 Year"
                    className={inputCls(errors.minExperience)}
                    disabled={form.fresherOk}
                  />
                  <ErrorMsg msg={errors.minExperience} />
                </div>
                <div>
                  <Label required={!form.fresherOk}>Maximum Experience</Label>
                  <input
                    type="number"
                    name="maxExperience"
                    value={form.maxExperience}
                    onChange={handleChange}
                    placeholder="e.g. 4 Years"
                    className={inputCls(errors.maxExperience)}
                    disabled={form.fresherOk}
                  />
                  <ErrorMsg msg={errors.maxExperience} />
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* SECTION 4: Hiring Pipeline */}
          <section>
            <SectionHeader
              title="Hiring Pipeline"
              subtitle={
                stagesLocked
                  ? "Locked once candidates have applied"
                  : "Define the interview stages candidates go through"
              }
              icon={
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 .8 1.6L13 10l3.8 5.4A1 1 0 0 1 16 17H4a1 1 0 0 1-1-1V4Z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />

            <div className="space-y-5">
              {/* Locked notice — shown once the job has applicants */}
              {stagesLocked && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M8 1.5a2.5 2.5 0 0 1 2.5 2.5v2H13a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 13 15H3a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 3 6h2.5V4A2.5 2.5 0 0 1 8 1.5Zm0 1.5A1 1 0 0 0 7 4v2h2V4a1 1 0 0 0-1-1Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Hiring pipeline is locked
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      This job already has {job.applicantsCount}{" "}
                      {job.applicantsCount === 1 ? "applicant" : "applicants"},
                      so the stages and their order can't be changed anymore —
                      this keeps things consistent for candidates already in the
                      process. You can still update all the other job details
                      below.
                    </p>
                  </div>
                </div>
              )}

              {/* Mandatory first stage */}
              <div>
                <Label>Mandatory First Stage</Label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M8 1.5a2.5 2.5 0 0 1 2.5 2.5v2H13a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 13 15H3a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 3 6h2.5V4A2.5 2.5 0 0 1 8 1.5Zm0 1.5A1 1 0 0 0 7 4v2h2V4a1 1 0 0 0-1-1Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Resume Review
                    </p>
                    <p className="text-xs text-gray-400">
                      Always runs first for every applicant — can't be removed
                      or reordered
                    </p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-1 shrink-0">
                    Locked
                  </span>
                </div>
              </div>

              {/* Optional stage selection */}
              <div>
                <Label>Optional Stages</Label>
                <p className="text-xs text-gray-500 mb-2.5 -mt-1">
                  {stagesLocked
                    ? "These stages are frozen for this job"
                    : "Select any additional stages, then drag to set their order"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OPTIONAL_STAGE_NAMES.map((stage) => {
                    const checked = form.pipelineStages.includes(stage);
                    return (
                      <label
                        key={stage}
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-150 ${
                          stagesLocked
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        } ${
                          checked
                            ? "border-green-300 bg-green-50/60"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <CheckBox
                          checked={checked}
                          onChange={() => toggleStage(stage)}
                          disabled={stagesLocked}
                        />
                        <span
                          className={`text-sm font-medium ${checked ? "text-green-700" : "text-gray-600"}`}
                        >
                          {STAGE_LABELS[stage]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Drag-and-drop ordering list */}
              {form.pipelineStages.length > 0 && (
                <div>
                  <Label>Stage Order</Label>
                  <div className="space-y-2">
                    {form.pipelineStages.map((stage, index) => (
                      <div
                        key={stage}
                        draggable={!stagesLocked}
                        onDragStart={handleDragStart(index)}
                        onDragOver={handleDragOver(index)}
                        onDrop={handleDrop(index)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={handleTouchStart(index)}
                        className={`flex items-center gap-3 bg-white border rounded-xl px-3.5 py-2.5 transition-all duration-150 ${
                          dragOverIndex === index
                            ? "border-green-400 ring-2 ring-green-500/20"
                            : "border-gray-200"
                        } ${dragIndex === index ? "opacity-40" : "opacity-100"} ${
                          stagesLocked ? "opacity-70" : ""
                        }`}
                      >
                        <span
                          className={`shrink-0 text-gray-300 transition-colors ${
                            stagesLocked
                              ? "cursor-not-allowed"
                              : "cursor-grab active:cursor-grabbing hover:text-gray-500"
                          }`}
                          aria-hidden="true"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <circle cx="5" cy="3.5" r="1.25" />
                            <circle cx="11" cy="3.5" r="1.25" />
                            <circle cx="5" cy="8" r="1.25" />
                            <circle cx="11" cy="8" r="1.25" />
                            <circle cx="5" cy="12.5" r="1.25" />
                            <circle cx="11" cy="12.5" r="1.25" />
                          </svg>
                        </span>

                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        <span className="flex-1 text-sm font-medium text-gray-800">
                          {STAGE_LABELS[stage]}
                        </span>

                        {stagesLocked ? (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 shrink-0">
                            Locked
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => stepStage(index, -1)}
                              disabled={index === 0}
                              aria-label={`Move ${STAGE_LABELS[stage]} up`}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  d="M4 10l4-4 4 4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => stepStage(index, 1)}
                              disabled={
                                index === form.pipelineStages.length - 1
                              }
                              aria-label={`Move ${STAGE_LABELS[stage]} down`}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  d="M4 6l4 4 4-4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStage(stage)}
                              aria-label={`Remove ${STAGE_LABELS[stage]}`}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 1l10 10M11 1L1 11" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live pipeline preview */}
              <div>
                <Label>Pipeline Preview</Label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 overflow-x-auto">
                  <div className="flex items-center gap-2 min-w-fit">
                    <PipelinePill label="Applied" variant="fixed" />
                    <Arrow />
                    <PipelinePill label="Resume Review" variant="fixed" />
                    {form.pipelineStages.map((stage) => (
                      <span key={stage} className="flex items-center gap-2">
                        <Arrow />
                        <PipelinePill
                          label={STAGE_LABELS[stage]}
                          variant="stage"
                        />
                      </span>
                    ))}
                    <Arrow />
                    <PipelinePill label="Offer" variant="fixed" />
                    <Arrow />
                    <PipelinePill label="Hired / Rejected" variant="outcome" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* SECTION 5: Additional details */}
          <section>
            <SectionHeader
              title="Additional Details"
              subtitle="Openings and deadlines"
              icon={
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Number of Positions</Label>
                <input
                  type="number"
                  name="positions"
                  value={form.positions}
                  onChange={handleChange}
                  min={1}
                  className={inputCls(errors.positions)}
                />
                <ErrorMsg msg={errors.positions} />
              </div>
              <div>
                <Label>Application Deadline</Label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={form.applicationDeadline}
                  onChange={handleChange}
                  className={`${inputCls()} [color-scheme:light]`}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-200/50 transition-all duration-200 border border-gray-300 hover:border-gray-400 bg-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || (touched && !isValid)}
            className={`
              relative px-7 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 overflow-hidden
              ${
                loading || (touched && !isValid)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border-transparent"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-[0.98]"
              }
            `}
          >
            <span
              className={`flex items-center gap-2 transition-opacity justify-center ${loading ? "opacity-0" : "opacity-100"}`}
            >
              {success ? (
                <>
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Changes Saved!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M13.7 3.3a2.4 2.4 0 0 1 3.4 3.4L7.5 16.3l-4.2.9.9-4.2L13.7 3.3Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </span>

            {loading && (
              <span className="absolute inset-0 flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-gray-500 font-semibold">Saving…</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Micro-components ─────────────────────────────────────────────────────────

const Divider = () => (
  <div className="relative flex items-center">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
  </div>
);

const CheckBox = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={disabled ? undefined : onChange}
    disabled={disabled}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
      disabled ? "cursor-not-allowed" : ""
    } ${
      checked
        ? "bg-green-600 border-green-600"
        : "border-gray-300 hover:border-green-500 bg-white"
    } ${disabled && !checked ? "opacity-60" : ""}`}
  >
    {checked && (
      <svg
        className="w-3 h-3 text-white"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          d="M1.5 6l3 3L10.5 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);
