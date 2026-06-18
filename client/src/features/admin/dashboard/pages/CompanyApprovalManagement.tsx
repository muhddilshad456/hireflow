import { useEffect, useState } from "react";
import { FilterDropdown } from "../../shared/components/Filter";
import { getAllCompanyRequests } from "../../services/adminServices";
import { Ico } from "../../../../assets/icons/CompanyIcons";
import { Pagination } from "../../shared/components/Pagination";
import { useNavigate } from "react-router-dom";

type CompanyFilterType = "All" | "Pending" | "Approved" | "Rejected";

interface CompanyRequestData {
  id: string;
  name: string;
  email: string;
  status: string;
}

export function CompanyApprovalManagement() {
  const [requests, setRequests] = useState<CompanyRequestData[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CompanyFilterType>("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 2;

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const result = await getAllCompanyRequests(
          page,
          limit,
          search,
          filter,
          "NEW",
        );
        setRequests(result.data.verificationRequests);
        setTotalPages(result.data.totalPages);
        console.log(result);
      } catch (error: any) {
        console.log(error.response?.data);
      }
    }
    fetchCompanies();
  }, [page, search, filter]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    setSearch(value);
  }

  function handleDetailsPage(id: string) {
    navigate(`/admin/companies-verify-request/${id}`);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl md:text-2xl font-bold text-violet-600 tracking-tight">
        Company Verify Requests
      </h1>

      {/* Tab bar + filter */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Ico.Search />
          </span>
          <input
            type="text"
            placeholder="Search for jobs"
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-[7px] text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-400"
          />
        </div>
        <FilterDropdown<CompanyFilterType>
          value={filter}
          options={["All", "Pending", "Approved", "Rejected"]}
          onChange={setFilter}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                  Company Name
                </th>
                <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                  Email
                </th>
                <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                  Status
                </th>
                <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr
                  key={r.id}
                  className={`hover:bg-violet-50/20 transition-colors ${i < requests.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <td className="px-4 md:px-5 py-4 font-semibold text-gray-800 leading-tight">
                    {r.name}
                  </td>
                  <td className="px-4 md:px-5 py-4 text-violet-500 font-medium whitespace-nowrap">
                    {r.email}
                  </td>
                  <td className="px-4 md:px-5 py-4 text-violet-400 text-[12px]">
                    {r.status}
                  </td>
                  <td className="px-4 md:px-5 py-4">
                    <button
                      onClick={() => handleDetailsPage(r.id)}
                      className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white text-[12px] font-semibold px-5 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
