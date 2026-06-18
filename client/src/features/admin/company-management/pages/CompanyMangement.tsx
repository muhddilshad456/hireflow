import { useEffect, useState } from "react";
import { FilterDropdown } from "../../shared/components/Filter";
import { Ico } from "../../../../assets/icons/CompanyIcons";
import { Pagination } from "../../shared/components/Pagination";
import { updateStatusApi } from "../../services/adminServices";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAllCompaniesApi } from "../services/adminCompanyServices";

type CompanyFilterType = "All" | "Active" | "Blocked";

interface CompanyItem {
  _id: string;
  name: string;
  recruiterName: string;
  email: string;
  company: string;
  isBlocked: boolean;
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<CompanyFilterType>("All");

  const navigate = useNavigate();

  const limit = 2;

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    setSearch(value);
  }

  const showDetails = (id: string) => {
    navigate(`/admin/company/${id}`);
  };

  const fetchCompanies = async () => {
    try {
      const result = await getAllCompaniesApi(page, limit, search, filter);
      console.log("result of company fetch : ", result);
      setCompanies(result?.data?.result?.companies);
      setTotalPages(result?.data?.result?.totalPages);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  const toggle = async (id: string, status: string) => {
    try {
      const result = await updateStatusApi(id, status);
      fetchCompanies();
      toast.success("status updated successfully.");
      console.log(result);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, filter, search]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl md:text-2xl font-bold text-violet-600 tracking-tight">
        Company Management
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
          options={["All", "Active", "Blocked"]}
          onChange={setFilter}
        />
      </div>

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
                    Email Address
                  </th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                    Verification Status
                  </th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500">
                    Account Status
                  </th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-violet-500">
                    Details
                  </th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] md:text-[12px] font-semibold text-violet-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies?.map((c, i) => (
                  <tr
                    key={c._id}
                    className={`hover:bg-violet-50/20 transition-colors ${i < companies.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <td className="px-4 md:px-5 py-4 font-semibold text-gray-800 leading-tight">
                      {c.name}
                    </td>
                    <td className="px-4 md:px-5 py-4 text-gray-500 text-[12px]">
                      {c.email}
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-semibold min-w-[100px]
                            ${
                              c.company
                                ? "bg-violet-500 text-white"
                                : "bg-violet-100 text-violet-700 border border-violet-200"
                            }`}
                      >
                        {c.company ? "Verified" : "Not Verified"}
                      </span>
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-semibold min-w-[70px]
                            ${c.isBlocked != true ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                      >
                        {c.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      {c.company ? (
                        <button
                          onClick={() => showDetails(c._id)}
                          className="text-violet-500 font-semibold hover:text-violet-700 text-[13px] whitespace-nowrap hover:underline underline-offset-2 transition-colors"
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          disabled
                          className="text-violet-300 font-semibold text-[13px] whitespace-nowrap "
                        >
                          View Details
                        </button>
                      )}
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <button
                        onClick={() =>
                          toggle(c._id, c.isBlocked ? "ACTIVE" : "BLOCKED")
                        }
                        className={`font-semibold text-[13px] hover:underline underline-offset-2 transition-colors ${c.isBlocked != true ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}
                      >
                        {c.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
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
          Showing <strong className="text-gray-500">{companies.length}</strong>{" "}
          of <strong className="text-gray-500">{companies.length}</strong>{" "}
          companies
        </p>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </>
    </div>
  );
}
