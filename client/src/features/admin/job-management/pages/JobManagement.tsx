import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FilterDropdown } from "../../shared/components/Filter";
import { Pagination } from "../../shared/components/Pagination";
import { Ico } from "../../../../assets/icons/CompanyIcons";
import {
  getJobsApi,
  updateJobActiveStatusApi,
} from "../../../shared/services/jobService";
import type { Job } from "../../../../types/jobTypes";
import { useNavigate } from "react-router-dom";

type CompanyFilterType = "All" | "Active" | "Blocked";
type UserFilterType = "All" | "Active" | "Blocked";

export function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<UserFilterType>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const limit = 2;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log("status in fetch jobs : ", status);
      const res = await getJobsApi({ page, limit, search, status });
      console.log("result of fetch jobs : ", res);
      setJobs(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error: any) {
      console.error(error?.response?.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: string, status: string) => {
    try {
      const newStatus = status == "Active" ? "BLOCKED" : "ACTIVE";
      const result = await updateJobActiveStatusApi(id, newStatus);
      fetchJobs();
      toast.success("Job status updated");
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, page, status]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    setSearch(value);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-violet-600 tracking-tight">
          Job Management
        </h1>
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
          value={status}
          options={["All", "Active", "Blocked"]}
          onChange={setStatus}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Job", "Company", "Job Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 md:px-6 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500"
                  >
                    {h}
                  </th>
                ))}
                <th className="text-left px-4 md:px-6 py-3.5 text-[11px] md:text-[12px] font-semibold text-violet-500">
                  Details
                </th>
                <th className="text-left px-4 md:px-6 py-3.5 text-[11px] md:text-[12px] font-semibold text-violet-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : jobs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs?.map((u, i) => (
                  <tr
                    key={u._id}
                    className={`hover:bg-violet-50/20 transition-colors ${
                      i < jobs.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                      {u.title}
                    </td>

                    <td className="px-4 md:px-6 py-4 text-gray-500 text-[12px] md:text-[13px]">
                      {u.company?.companyName}
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[11px] font-semibold min-w-[80px] shadow-sm ${
                          u.isActive
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {u.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/job/${u._id}`)}
                        className="text-violet-500 font-semibold hover:text-violet-700 text-[13px] whitespace-nowrap hover:underline underline-offset-2 transition-colors"
                      >
                        View Details
                      </button>
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <button
                        onClick={() =>
                          toggle(u._id, u.isActive ? "Active" : "Blocked")
                        }
                        className={`font-semibold text-[13px] hover:underline underline-offset-2 transition-colors ${
                          u.isActive
                            ? "text-red-500 hover:text-red-700"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {u.isActive ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
