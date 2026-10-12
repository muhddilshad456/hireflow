import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import SubscriptionConfirmModal from "../components/SubscriptionConfirmModal";

export const SUBSCRIPTION_ROUTES = {
  DASHBOARD: "/company/admin/dashboard",
  PROFILE: "/company/admin/profile",
} as const;

export function SubscriptionCancelPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    // Rendered inside AdminHeaderLayout (header + centered content)
    <>
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <XCircle size={36} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          You weren't charged and your plan hasn't changed. You can upgrade
          whenever you're ready.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <button
            onClick={() => navigate(SUBSCRIPTION_ROUTES.PROFILE)}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Back to profile
          </button>
        </div>
      </div>

      <SubscriptionConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
