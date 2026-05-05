import { useState, useEffect } from "react";
import { getUsersApi, updateStatusApi } from "../services/adminServices";
import toast from "react-hot-toast";
import { FilterDropdown } from "../../shared/components/Filter";
import { Pagination } from "../../shared/components/Pagination";

type CompanyFilterType = "All" | "Active" | "Blocked";
type UserFilterType = "All" | "Active" | "Blocked";
type AccountStatus = "Active" | "Blocked";

interface UserItem {
  id: string;
  name: string;
  email: string;
  status: AccountStatus;
}

const IcoSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<UserFilterType>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 2;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsersApi(page, limit, search, filter);
      console.log(res);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: string, status: string) => {
    try {
      const newStatus = status == "Active" ? "BLOCKED" : "ACTIVE";
      const result = await updateStatusApi(id, newStatus);
      fetchUsers();
      toast.success("User status updated");
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page, filter]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    setSearch(value);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-violet-600 tracking-tight">
          User Management
        </h1>
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <IcoSearch />
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["User", "Email Address", "Account Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 md:px-6 py-3.5 text-[11px] md:text-[12px] font-semibold text-gray-500"
                  >
                    {h}
                  </th>
                ))}
                <th className="text-left px-4 md:px-6 py-3.5 text-[11px] md:text-[12px] font-semibold text-violet-500">
                  Profile
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`hover:bg-violet-50/20 transition-colors ${
                      i < users.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                      {u.name}
                    </td>

                    <td className="px-4 md:px-6 py-4 text-gray-500 text-[12px] md:text-[13px]">
                      {u.email}
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[11px] font-semibold min-w-[80px] shadow-sm ${
                          u.status === "Active"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <button className="text-violet-500 font-semibold hover:text-violet-700 text-[13px] whitespace-nowrap hover:underline underline-offset-2 transition-colors">
                        View Details
                      </button>
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <button
                        onClick={() => toggle(u.id, u.status)}
                        className={`font-semibold text-[13px] hover:underline underline-offset-2 transition-colors ${
                          u.status === "Active"
                            ? "text-red-500 hover:text-red-700"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {u.status === "Active" ? "Block" : "Unblock"}
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
