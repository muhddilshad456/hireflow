import { useNavigate } from "react-router-dom";
import type { Job } from "../../../../../types/jobTypes";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        border: "1px solid #f0eeee",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 20px rgba(232,75,48,0.10)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.04)")
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          minWidth: 0,
        }}
      >
        {/* Company logo placeholder */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "#fff3f1",
            border: "1px solid #fcddd9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
            color: "#e84b30",
            flexShrink: 0,
          }}
        >
          {job.company.charAt(0)}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#111",
              fontFamily: "'Poppins', sans-serif",
              marginBottom: 3,
            }}
          >
            {job.title}
          </div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
            {job.company}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="#e84b30"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ fontSize: 12, color: "#888" }}>{job.location}</span>
            <span style={{ color: "#ddd", margin: "0 4px" }}>·</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>{job.salary}</span>
            <span style={{ color: "#ddd", margin: "0 4px" }}>·</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 20,
                background: job.jobType === "FULL_TIME" ? "#fff0ee" : "#f0f7ff",
                color: job.jobType === "FULL_TIME" ? "#e84b30" : "#3b82f6",
              }}
            >
              {job.jobType}
            </span>
          </div>
        </div>
      </div>

      {/* View Details button */}
      <button
        onClick={() => navigate("/job", { state: { jobId: job._id } })}
        style={{
          background: "#e84b30",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "10px 20px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(232,75,48,0.25)",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#d03e25")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#e84b30")
        }
      >
        View Details
      </button>
    </div>
  );
}
