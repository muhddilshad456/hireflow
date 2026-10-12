import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import {
  getSubscriptionStatus,
  type SubscriptionStatusData,
} from "../../../shared/servicces/SubscriptionServices";
import { SUBSCRIPTION_ROUTES } from "./SubscriptionCancel";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15; // ~30 seconds

type ViewState = "confirming" | "active" | "delayed";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [view, setView] = useState<ViewState>("confirming");
  const [subscription, setSubscription] =
    useState<SubscriptionStatusData | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // The webhook (not this page) activates the subscription. We just wait for
  // it by polling the status endpoint.
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const res = await getSubscriptionStatus();
        if (cancelled) return;
        if (res.data.isActive) {
          setSubscription(res.data);
          setView("active");
          return;
        }
      } catch {
        // A failed poll shouldn't end the wait; try again on the next tick
      }

      attempts += 1;
      if (cancelled) return;
      if (attempts >= POLL_MAX_ATTEMPTS) {
        setView("delayed");
        return;
      }
      timer = setTimeout(check, POLL_INTERVAL_MS);
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId, retryKey]);

  // Not coming from Stripe: nothing to confirm here
  if (!sessionId) {
    return <Navigate to={SUBSCRIPTION_ROUTES.PROFILE} replace />;
  }

  const checkAgain = () => {
    setView("confirming");
    setRetryKey((k) => k + 1);
  };

  return (
    // Rendered inside AdminHeaderLayout (header + centered content)
    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 sm:p-10">
      {view === "confirming" && (
        <div role="status" aria-live="polite">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-500" />
          <h1 className="mt-6 text-xl font-bold text-slate-900">
            Confirming your payment…
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This usually takes a few seconds. Please keep this page open.
          </p>
        </div>
      )}

      {view === "active" && (
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            You're subscribed!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Premium is now active for your company
            {subscription?.endDate && (
              <>
                {" "}
                until{" "}
                <span className="font-semibold text-slate-700">
                  {formatDate(subscription.endDate)}
                </span>
              </>
            )}
            .
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => navigate(SUBSCRIPTION_ROUTES.DASHBOARD)}
              className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              Go to dashboard
            </button>
            <button
              onClick={() => navigate(SUBSCRIPTION_ROUTES.PROFILE)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              View profile
            </button>
          </div>
        </div>
      )}

      {view === "delayed" && (
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock size={34} />
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">
            Activation is taking longer than usual
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your payment went through, but we're still setting up your
            subscription. It should appear shortly. If it doesn't within a few
            minutes, please contact support.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={checkAgain}
              className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              Check again
            </button>
            <button
              onClick={() => navigate(SUBSCRIPTION_ROUTES.PROFILE)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Back to profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
