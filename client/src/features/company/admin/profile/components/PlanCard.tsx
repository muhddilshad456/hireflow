import { Check, CheckCircle2 } from "lucide-react";
import type { SubscriptionStatusData } from "../../../shared/servicces/SubscriptionServices";
import { PREMIUM_BENEFITS } from "../../subscription/components/SubscriptionConfirmModal";

const cardClass =
  "bg-white rounded-2xl shadow-sm border border-gray-100 p-5 self-start";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface CurrentPlanCardProps {
  subscription: SubscriptionStatusData | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onUpgrade: () => void;
}

export default function CurrentPlanCard({
  subscription,
  loading,
  error,
  onRetry,
  onUpgrade,
}: CurrentPlanCardProps) {
  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className={`${cardClass} animate-pulse`} aria-busy="true">
        <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
        <div className="mb-6 h-6 w-36 rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  /* ---------- couldn't load: don't guess the plan ---------- */
  if (error || !subscription) {
    return (
      <div className={cardClass}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Current Plan
        </p>
        <p className="text-sm text-gray-600 mb-4">
          We couldn't load your plan details.
        </p>
        <button
          onClick={onRetry}
          className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Try again
        </button>
      </div>
    );
  }

  /* ---------- subscribed: plan details, no button ---------- */
  if (subscription.isActive) {
    const days = subscription.daysRemaining;

    return (
      <div className={cardClass}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Current Plan
        </p>
        <div className="mb-5 flex items-center gap-2">
          <h3 className="text-xl font-bold text-gray-900">Premium Plan</h3>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            Active
          </span>
        </div>

        <dl className="divide-y divide-gray-100 text-sm">
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-gray-500">Started on</dt>
            <dd className="font-medium text-gray-900">
              {formatDate(subscription.startDate)}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-gray-500">Valid until</dt>
            <dd className="font-medium text-gray-900">
              {formatDate(subscription.endDate)}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-gray-500">Days remaining</dt>
            <dd className="font-medium text-gray-900">
              {days} day{days === 1 ? "" : "s"}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  /* ---------- not subscribed: feature + upgrade button ---------- */
  return (
    <div className={cardClass}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
        Current Plan
      </p>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Free Plan</h3>

      {subscription.status === "EXPIRED" && subscription.endDate && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Your Premium plan expired on {formatDate(subscription.endDate)}.
        </p>
      )}

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Premium Benefits
      </p>
      <ul className="flex flex-col gap-2.5 mb-5">
        {PREMIUM_BENEFITS.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      <button
        onClick={onUpgrade}
        className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        Upgrade to Premium
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">Billed yearly.</p>
    </div>
  );
}
