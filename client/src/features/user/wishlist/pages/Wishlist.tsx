import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import {
  WishlistJobCard,
  type WishlistJob,
} from "../components/Wishlistjobcard";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { ConfirmModal } from "../../shared/components/ConfirmModal";

const JOBS_ROUTE = "/jobs";
const SKELETON_COUNT = 3;

const JobCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 w-1/2 rounded bg-gray-200 mb-2" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
    <div className="h-3 w-2/3 rounded bg-gray-200 mt-4" />
  </div>
);

const Wishlist: React.FC = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<WishlistJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // job currently selected for removal (null = modal closed)
  const [jobToRemove, setJobToRemove] = useState<WishlistJob | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await getWishlist();
      setJobs(res?.data ?? []);
    } catch (error: any) {
      setFailed(true);
      toast.error(
        error?.response?.data?.message ?? "Failed to load your wishlist.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleConfirmRemove = async () => {
    if (!jobToRemove) return;
    setRemoving(true);
    try {
      const res = await removeFromWishlist(jobToRemove._id);
      setJobs((prev) => prev.filter((j) => j._id !== jobToRemove._id));
      toast.success(res?.message ?? "Job removed from wishlist.");
      setJobToRemove(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Failed to remove the job.",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Page heading */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-[#F4522A] flex-shrink-0">
            <Heart size={24} fill="currentColor" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500">
              {loading || failed
                ? "Jobs you've saved for later."
                : `${jobs.length} saved ${jobs.length === 1 ? "job" : "jobs"}`}
            </p>
          </div>
        </div>

        {/* Content */}
        <section>
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : failed ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500">
                We couldn't load your wishlist.
              </p>
              <button
                onClick={fetchWishlist}
                className="mt-3 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="font-medium text-gray-500">
                Your wishlist is empty
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Save jobs you like and they'll show up here.
              </p>
              <button
                onClick={() => navigate(JOBS_ROUTE)}
                className="mt-4 bg-[#F4522A] hover:bg-[#e04420] active:bg-[#c93b1a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Browse jobs
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {jobs.map((job) => (
                <WishlistJobCard
                  key={job._id}
                  job={job}
                  onRemove={setJobToRemove}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <ConfirmModal
        isOpen={!!jobToRemove}
        title="Remove from wishlist?"
        message={`"${jobToRemove?.title ?? "This job"}" will be removed from your wishlist. You can save it again later from the jobs page.`}
        confirmText="Remove"
        isLoading={removing}
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          if (!removing) setJobToRemove(null);
        }}
      />
    </div>
  );
};

export default Wishlist;
