import { useEffect, useState } from "react";
import { Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { createCheckoutSession } from "../../../shared/servicces/SubscriptionServices";

interface UpgradeConfirmModalProps {
  open: boolean;
  onClose: () => void;
}

export const PREMIUM_BENEFITS = [
  "Unlimited Jobs",
  "Unlimited Recruiters",
  "Advanced Analytics",
  "Priority Support",
] as const;

export default function SubscriptionConfirmModal({
  open,
  onClose,
}: UpgradeConfirmModalProps) {
  const [redirecting, setRedirecting] = useState(false);

  // Close on Escape (but not while we're redirecting)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !redirecting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, redirecting, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    setRedirecting(true);
    try {
      const res = await createCheckoutSession();
      // Keep the spinner on: the browser is leaving this page
      window.location.href = res.data.url;
    } catch (error: any) {
      setRedirecting(false);
      toast.error(
        error?.response?.data?.message ||
          "Unable to start checkout. Please try again.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={() => !redirecting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8"
      >
        {redirecting ? (
          <div
            className="flex flex-col items-center py-10 text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Redirecting to secure checkout…
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Please don't close or refresh this page.
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <Sparkles size={24} />
            </div>

            <h2
              id="upgrade-modal-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Upgrade to Premium
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Here's what your company gets with Premium:
            </p>

            <ul className="mt-5 space-y-3">
              {PREMIUM_BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-[15px] text-slate-700"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={14} className="shrink-0" />
              Billed yearly. You'll be taken to Stripe's secure checkout to pay.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Not now
              </button>
              <button
                onClick={handleConfirm}
                autoFocus
                className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                Continue to payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
