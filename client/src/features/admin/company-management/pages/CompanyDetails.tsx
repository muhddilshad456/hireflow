import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCompanyApi } from "../services/adminCompanyServices";

export interface ICompany {
  _id: string;
  adminId: string;
  companyName: string;
  regNumber: string;
  email: string;
  phone: string;
  website?: string;
  description: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  profilePicture?: string | null;
  document: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Mock data for preview ──────────────────────────────────────────────────
const mockCompany: ICompany = {
  _id: "64a1b2c3d4e5f6a7b8c9d0e1" as unknown as string,
  adminId: "64a1b2c3d4e5f6a7b8c9d0e2" as unknown as string,
  companyName: "Nexora Technologies",
  regNumber: "REG-2024-78542",
  email: "contact@nexora.io",
  phone: "+1 (555) 867-5309",
  website: "https://nexora.io",
  description:
    "Nexora Technologies is a forward-thinking software company specializing in AI-powered enterprise solutions. We help businesses automate workflows, unlock data insights, and scale operations with confidence.",
  address: "42 Innovation Drive, Suite 800",
  country: "United States",
  state: "California",
  city: "San Francisco",
  zip: "94107",
  profilePicture: null,
  document: "https://example.com/docs/nexora-registration.pdf",
  isActive: true,
  createdAt: new Date("2024-03-15"),
  updatedAt: new Date("2026-06-04"),
};

// ── Helper components ──────────────────────────────────────────────────────
interface InfoFieldProps {
  label: string;
  value: string;
  href?: string;
}

function InfoField({ label, value, href }: InfoFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-800 hover:text-teal-600 underline underline-offset-2 transition-colors"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm text-slate-800">{value}</span>
      )}
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
      <span className="text-white text-2xl font-bold tracking-tight">
        {initials}
      </span>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
interface CompanyDetailsPageProps {
  company?: ICompany;
}

export function CompanyDetailsPage({
  company = mockCompany,
}: CompanyDetailsPageProps) {
  const fullAddress = `${company.address}, ${company.city}, ${company.state} ${company.zip}, ${company.country}`;
  const postedDate = company.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = company.updatedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { id } = useParams();

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const result = await getCompanyApi(id);
      console.log(result);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5">
        <p className="text-sm text-slate-500">Company Management</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
          Company Details
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View the full details of this company profile.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* ── Identity card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar name={company.companyName} src={company.profilePicture} />
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {company.companyName}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Reg No: {company.regNumber}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {/* Location tag */}
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    <svg
                      className="w-3.5 h-3.5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"
                      />
                      <circle cx={12} cy={8} r={2} />
                    </svg>
                    {company.city}, {company.country}
                  </span>
                  {/* Website tag */}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 hover:bg-teal-100 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle cx={12} cy={12} r={10} />
                        <path
                          strokeLinecap="round"
                          d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
                        />
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
            <StatusBadge active={company.isActive} />
          </div>

          {/* Description */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">
              About
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {company.description}
            </p>
          </div>
        </div>

        {/* ── Contact & Registration ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Contact & Registration
          </h3>
          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoField
              label="Email"
              value={company.email}
              href={`mailto:${company.email}`}
            />
            <InfoField
              label="Phone"
              value={company.phone}
              href={`tel:${company.phone}`}
            />
            <InfoField label="Registration No." value={company.regNumber} />
            {company.website && (
              <InfoField
                label="Website"
                value={company.website.replace(/^https?:\/\//, "")}
                href={company.website}
              />
            )}
          </div>
        </div>

        {/* ── Address ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Address
          </h3>
          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoField label="Street Address" value={company.address} />
            <InfoField label="City" value={company.city} />
            <InfoField label="State" value={company.state} />
            <InfoField label="ZIP / Postal Code" value={company.zip} />
            <InfoField label="Country" value={company.country} />
            <div className="sm:col-span-2 lg:col-span-3">
              <InfoField label="Full Address" value={fullAddress} />
            </div>
          </div>
        </div>

        {/* ── Documents & Meta ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Documents & Record
          </h3>
          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Document download */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">
                Registration Document
              </span>
              <a
                href={company.document}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-800 hover:text-teal-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                View Document
              </a>
            </div>
            <InfoField label="Registered On" value={postedDate} />
            <InfoField label="Last Updated" value={updatedDate} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">
                Status
              </span>
              <StatusBadge active={company.isActive} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
