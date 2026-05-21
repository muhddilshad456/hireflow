import { useState, useCallback } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JobCategory = "IT" | "MARKETING" | "FINANCE" | "HR" | "SALES" | "OTHER";
type JobType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";

type CreateJobModalProps = {
  onClose?: () => void;
  onSubmit: (data: FormData) => void; // 👈 ADD THIS
};

export interface FormData {
  title: string;
  category: JobCategory | "";
  jobType: JobType | "";
  location: string;
  description: string;
  minSalary: string; // Split into Min/Max
  maxSalary: string;
  salaryNotDisclosed: boolean;
  skills: string[];
  minExperience: string; // Split into Min/Max
  maxExperience: string;
  fresherOk: boolean;
  positions: string;
  applicationDeadline: string;
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

const INITIAL_FORM: FormData = {
  title: "",
  category: "",
  jobType: "",
  location: "",
  description: "",
  minSalary: "",
  maxSalary: "",
  salaryNotDisclosed: false,
  skills: [],
  minExperience: "",
  maxExperience: "",
  fresherOk: false,
  positions: "1",
  applicationDeadline: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validate = (form: FormData): FormErrors => {
  const e: FormErrors = {};

  // Existing validations...

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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CreateJobModal({
  onClose,
  onSubmit,
}: CreateJobModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = useCallback(
    <K extends keyof FormData>(key: K, val: FormData[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
      if (touched) setErrors((prev) => validate({ ...form, [key]: val }));
    },
    [form, touched],
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    set(name as keyof FormData, value as never);
  };

  const handleCheck = (key: "salaryNotDisclosed" | "fresherOk") => {
    const next = !form[key];
    const patch: Partial<FormData> = { [key]: next };

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

  const handleSubmit = async () => {
    setTouched(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    onSubmit(form);
    console.log("✅ Job Created:", form);
    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched(false);
    setSuccess(false);
    onClose?.();
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
                  New Opportunity
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Create Job Listing
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

              {/* Experiece Setup */}
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

          {/* SECTION 4: Additional details */}
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
                  Job Created!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                  Create Job
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
                <span className="text-gray-500 font-semibold">Publishing…</span>
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
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
      checked
        ? "bg-green-600 border-green-600"
        : "border-gray-300 hover:border-green-500 bg-white"
    }`}
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
