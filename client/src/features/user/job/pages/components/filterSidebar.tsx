import type { JobFilters } from "../../../../../types/jobTypes";
import { CATEGORIES } from "../../../../../types/jobTypes";
import { ALL_SKILLS } from "../../../../../types/jobTypes";

interface FilterSidebarProps {
  filters: JobFilters;
  onChange: (key: keyof JobFilters, value: string) => void;
  onToggleSkill?: (skill: string) => void;
  onReset: () => void;
}

export function FilterSidebar({
  filters,
  onChange,
  onToggleSkill,
  onReset,
}: FilterSidebarProps) {
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 8,
    display: "block",
  };

  const checkRow = (label: string, value: string, field: keyof JobFilters) => {
    const checked = filters[field] === value;
    return (
      <label
        key={value}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          marginBottom: 6,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onChange(field, checked ? "" : value)}
          style={{ accentColor: "#e84b30", width: 13, height: 13 }}
        />
        <span
          style={{
            fontSize: 12,
            color: checked ? "#e84b30" : "#555",
            fontWeight: checked ? 600 : 400,
          }}
        >
          {label}
        </span>
      </label>
    );
  };

  return (
    <aside
      style={{
        background: "#fdecea",
        borderRadius: 16,
        padding: "20px 18px",
        width: 168,
        minWidth: 168,
        flexShrink: 0,
        alignSelf: "flex-start",
        position: "sticky",
        top: 78,
      }}
    >
      {/* Heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
          All Filters
        </span>
        <button
          onClick={onReset}
          style={{
            fontSize: 10,
            color: "#e84b30",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Reset
        </button>
      </div>

      {/* Job Type */}
      <div style={{ marginBottom: 18 }}>
        <span style={labelStyle}>Job-Type</span>
        {checkRow("Full Time", "FULL_TIME", "jobType")}
        {checkRow("Part Time", "PART_TIME", "jobType")}
        {checkRow("Internship", "INTERNSHIP", "jobType")}
        {checkRow("Contract", "CONTRACT", "jobType")}
      </div>

      <div style={{ height: 1, background: "#f0c8c3", marginBottom: 18 }} />

      {/* Category */}
      <div style={{ marginBottom: 18 }}>
        <span style={labelStyle}>Category</span>
        {CATEGORIES.map((cat) => {
          const checked = filters.category === cat;
          return (
            <label
              key={cat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                marginBottom: 6,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange("category", checked ? "" : cat)}
                style={{ accentColor: "#e84b30", width: 13, height: 13 }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: checked ? "#e84b30" : "#555",
                  fontWeight: checked ? 600 : 400,
                  textTransform: "capitalize",
                }}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </span>
            </label>
          );
        })}
      </div>

      <div style={{ height: 1, background: "#f0c8c3", marginBottom: 18 }} />

      {/* Experience Level — Min / Max inputs */}
      <div style={{ marginBottom: 18 }}>
        <span style={labelStyle}>Experience Level</span>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="number"
            placeholder="Min yrs"
            min={0}
            value={filters.experienceMin}
            onChange={(e) => onChange("experienceMin", e.target.value)}
            style={{
              width: "50%",
              fontSize: 11,
              border: "1px solid #f0c8c3",
              borderRadius: 6,
              padding: "4px 7px",
              background: "#fff8f7",
              color: "#555",
              outline: "none",
            }}
          />
          <input
            type="number"
            placeholder="Max yrs"
            min={0}
            value={filters.experienceMax}
            onChange={(e) => onChange("experienceMax", e.target.value)}
            style={{
              width: "50%",
              fontSize: 11,
              border: "1px solid #f0c8c3",
              borderRadius: 6,
              padding: "4px 7px",
              background: "#fff8f7",
              color: "#555",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ height: 1, background: "#f0c8c3", marginBottom: 18 }} />

      {/* Salary Range */}
      <div style={{ marginBottom: 18 }}>
        <span style={labelStyle}>Salary Range</span>
        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.salaryMin}
            onChange={(e) => onChange("salaryMin", e.target.value)}
            style={{
              width: "50%",
              fontSize: 11,
              border: "1px solid #f0c8c3",
              borderRadius: 6,
              padding: "4px 7px",
              background: "#fff8f7",
              color: "#555",
              outline: "none",
            }}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.salaryMax}
            onChange={(e) => onChange("salaryMax", e.target.value)}
            style={{
              width: "50%",
              fontSize: 11,
              border: "1px solid #f0c8c3",
              borderRadius: 6,
              padding: "4px 7px",
              background: "#fff8f7",
              color: "#555",
              outline: "none",
            }}
          />
        </div>
      </div>
    </aside>
  );
}
