// components/stage-shared/InterviewerPickerModal.tsx
import React, { useEffect, useState } from "react";

import { getCompanyInterviewers } from "../services/interviewServices";
import type { InterviewerInfo } from "../../../../../types/company/interviewer/interviewerTypes";

const PAGE_LIMIT = 6;
const DEBOUNCE_MS = 400;

interface InterviewerPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (interviewer: InterviewerInfo) => void;
}

export const InterviewerPickerModal: React.FC<InterviewerPickerModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [nameSearch, setNameSearch] = useState("");
  const [capabilitySearch, setCapabilitySearch] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedCapability, setDebouncedCapability] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [interviewers, setInterviewers] = useState<InterviewerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Debounce the name search field
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(nameSearch), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nameSearch]);

  // Debounce the capability search field
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedCapability(capabilitySearch),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [capabilitySearch]);

  // Reset to page 1 whenever a search term changes
  useEffect(() => {
    setPage(1);
  }, [debouncedName, debouncedCapability]);

  // Reset all local state whenever the modal is opened fresh
  useEffect(() => {
    if (!open) return;
    setNameSearch("");
    setCapabilitySearch("");
    setDebouncedName("");
    setDebouncedCapability("");
    setPage(1);
    setSelectedId(null);
  }, [open]);

  const fetchInterviewers = async () => {
    if (!open) return;

    setLoading(true);
    setError(null);
    try {
      const res = await getCompanyInterviewers({
        search: debouncedName || undefined,
        capability: debouncedCapability || undefined,
        page,
        limit: PAGE_LIMIT,
      });
      console.log("response of interviewer fetch : ", res);
      setInterviewers(res.interviewers);
      setTotalPages(res.totalPages);
    } catch (error: any) {
      console.log(error?.response);
      setError("Failed to load interviewers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever the modal is open and search/page state changes
  useEffect(() => {
    fetchInterviewers();
  }, [open, debouncedName, debouncedCapability, page]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
        <h4 className="text-sm font-semibold text-gray-900">
          Select interviewer
        </h4>

        {/* Search bars */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-1/2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <input
            type="text"
            value={capabilitySearch}
            onChange={(e) => setCapabilitySearch(e.target.value)}
            placeholder="Search by capability..."
            className="w-1/2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        {/* List */}
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
          {loading && (
            <p className="py-4 text-center text-xs text-gray-400">
              Loading interviewers…
            </p>
          )}

          {!loading && error && (
            <p className="py-4 text-center text-xs text-red-500">{error}</p>
          )}

          {!loading && !error && interviewers.length === 0 && (
            <p className="py-4 text-center text-xs text-gray-400">
              No interviewers found.
            </p>
          )}

          {!loading &&
            !error &&
            interviewers.map((iv) => (
              <button
                key={iv._id}
                onClick={() => setSelectedId(iv._id)}
                className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left text-xs transition ${
                  selectedId === iv._id
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {iv.profilePicture ? (
                    <img
                      src={iv.profilePicture}
                      alt={iv.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600">
                      {iv.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="block font-medium text-gray-900">
                      {iv.name}
                    </span>
                    <span className="block text-gray-500">{iv.email}</span>
                  </div>
                </div>

                {iv.capabilities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {iv.capabilities.map((cap: any) => (
                      <span
                        key={cap}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}

                {iv.bio && (
                  <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                    {iv.bio}
                  </p>
                )}
              </button>
            ))}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-full text-xs font-medium transition ${
                  p === page
                    ? "bg-emerald-500 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!selectedId}
            onClick={() => {
              const iv = interviewers.find((i) => i._id === selectedId);
              if (iv) onSelect(iv);
            }}
            className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Send request
          </button>
        </div>
      </div>
    </div>
  );
};
