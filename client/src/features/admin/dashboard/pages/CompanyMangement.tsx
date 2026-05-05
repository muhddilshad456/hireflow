import { useState } from "react";
import { FilterDropdown } from "../../shared/components/Filter";

type CompanyFilterType = "All" | "Active" | "Blocked";
type CompanyTab = "all" | "approval";
type AccountStatus = "Active" | "Blocked";
type VerificationStatus = "Verified" | "Not Verified";

interface CompanyItem {
  id: string;
  companyName: string;
  recruiterName: string;
  email: string;
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
}

const INIT_COMPANIES: CompanyItem[] = [
  {
    id: "1",
    companyName: "Tech Innovators Inc.",
    recruiterName: "Sophia Bennett",
    email: "sophia.bennett@example.com",
    verificationStatus: "Verified",
    accountStatus: "Active",
  },
  {
    id: "2",
    companyName: "Global Marketing Group",
    recruiterName: "Olivia Davis",
    email: "olivia.davis@example.com",
    verificationStatus: "Not Verified",
    accountStatus: "Active",
  },
  {
    id: "3",
    companyName: "Tech Solutions Ltd.",
    recruiterName: "Ethan Carter",
    email: "ethan.carter@example.com",
    verificationStatus: "Verified",
    accountStatus: "Blocked",
  },
  {
    id: "4",
    companyName: "Creative Designs Co.",
    recruiterName: "Ava Harper",
    email: "ava.harper@example.com",
    verificationStatus: "Verified",
    accountStatus: "Active",
  },
  {
    id: "5",
    companyName: "Financial Services Ltd.",
    recruiterName: "Liam Foster",
    email: "liam.foster@example.com",
    verificationStatus: "Not Verified",
    accountStatus: "Blocked",
  },
];

export function CompanyManagement() {
  const [companies, setCompanies] = useState<CompanyItem[]>(INIT_COMPANIES);
  const [tab, setTab] = useState<CompanyTab>("all");
  const [filter, setFilter] = useState<CompanyFilterType>("All");

  const toggleCompany = (id: string) =>
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              accountStatus:
                c.accountStatus === "Active" ? "Blocked" : "Active",
            }
          : c,
      ),
    );

  const visible =
    filter === "All"
      ? companies
      : companies.filter((c) => c.accountStatus === filter);

  return (
    <div className="space-y-5">
      <h1 className="text-xl md:text-2xl font-bold text-violet-600 tracking-tight">
        Company Management
      </h1>

      {/* Tab bar + filter */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6 border-b border-gray-200">
          {(["all", "approval"] as CompanyTab[]).map((t) => {
            const label = t === "all" ? "All Company" : "Approval requests";
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2.5 text-[14px] font-semibold border-b-2 -mb-px transition-all ${active ? "border-violet-500 text-violet-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {tab === "all" && (
          <FilterDropdown<CompanyFilterType>
            value={filter}
            options={["All", "Active", "Blocked"]}
            onChange={setFilter}
          />
        )}
      </div>

      {/* All Company tab */}
      {tab === "all" && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[680px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                      Company Name
                    </th>
                    <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                      Recruiter Name
                    </th>
                    <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                      Email Address
                    </th>
                    <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                      Verification Status
                    </th>
                    <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                      Account Status
                    </th>
                    <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-violet-500">
                      Profile
                    </th>
                    <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-violet-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-violet-50/20 transition-colors ${i < visible.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <td className="px-4 md:px-5 py-4 font-semibold text-gray-800 leading-tight">
                        {c.companyName}
                      </td>
                      <td className="px-4 md:px-5 py-4 text-violet-500 font-medium whitespace-nowrap">
                        {c.recruiterName}
                      </td>
                      <td className="px-4 md:px-5 py-4 text-gray-500 text-[12px]">
                        {c.email}
                      </td>
                      <td className="px-4 md:px-5 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-semibold min-w-[100px]
                          ${
                            c.verificationStatus === "Verified"
                              ? "bg-violet-500 text-white"
                              : "bg-violet-100 text-violet-700 border border-violet-200"
                          }`}
                        >
                          {c.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-semibold min-w-[70px]
                          ${c.accountStatus === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                        >
                          {c.accountStatus}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 py-4">
                        <button className="text-violet-500 font-semibold hover:text-violet-700 text-[13px] whitespace-nowrap hover:underline underline-offset-2 transition-colors">
                          View Details
                        </button>
                      </td>
                      <td className="px-4 md:px-5 py-4">
                        <button
                          onClick={() => toggleCompany(c.id)}
                          className={`font-semibold text-[13px] hover:underline underline-offset-2 transition-colors ${c.accountStatus === "Active" ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}
                        >
                          {c.accountStatus === "Active" ? "Block" : "Unblock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-14 text-center text-gray-400 text-[13px]"
                      >
                        No companies match the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[12px] text-gray-400 text-right">
            Showing <strong className="text-gray-500">{visible.length}</strong>{" "}
            of <strong className="text-gray-500">{companies.length}</strong>{" "}
            companies
          </p>
        </>
      )}

      {/* Approval requests tab */}
      {tab === "approval" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                    Company Name
                  </th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                    Recruiter Name
                  </th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                    Email Address
                  </th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-violet-50/20 transition-colors ${i < companies.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <td className="px-4 md:px-5 py-4 font-semibold text-gray-800 leading-tight">
                      {c.companyName}
                    </td>
                    <td className="px-4 md:px-5 py-4 text-violet-500 font-medium whitespace-nowrap">
                      {c.recruiterName}
                    </td>
                    <td className="px-4 md:px-5 py-4 text-violet-400 text-[12px]">
                      {c.email}
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <button className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white text-[12px] font-semibold px-5 py-1.5 rounded-lg transition-colors shadow-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
