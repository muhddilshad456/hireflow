import { useNavigate } from "react-router-dom";
import type { JobApplication } from "../../../../types/applicaionTypes";

interface ApplicationCardProps {
  application: JobApplication;
}

// Maps application status -> label + color theme
function getStatusStyle(status?: string) {
  const normalized = (status || "").toUpperCase();

  switch (normalized) {
    case "HIRED":
    case "ACCEPTED":
      return { label: "Hired", color: "#16a34a" };
    case "REJECTED":
      return { label: "Rejected", color: "#dc2626" };
    case "IN_REVIEW":
    case "SHORTLISTED":
    case "INTERVIEW":
      return { label: "In Review", color: "#3b82f6" };
    case "PENDING":
    case "APPLIED":
    default:
      return {
        label: normalized ? normalized.replace(/_/g, " ") : "Applied",
        color: "#e8a13b",
      };
  }
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const navigate = useNavigate();
  const job = application.job;
  const status = getStatusStyle(application.status);

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
          {job?.company?.companyName?.charAt(0)}
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
            {job?.title}
          </div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
            {job?.company?.companyName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 10,
            }}
          >
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
            <span style={{ fontSize: 12, color: "#888" }}>{job?.location}</span>
          </div>

          {/* Status */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: status.color,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {status.label}
          </div>
        </div>
      </div>

      {/* View Details button */}
      <button
        onClick={() => navigate(`/application/${application._id}`)}
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
