import type { StageComponentProps } from "../StageRenderer";

export function DocumentVerificationStage({ stage }: StageComponentProps) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>
      <p className="mt-2 text-[13px] text-slate-500">
        Document verification details for this stage will appear here.
      </p>
    </div>
  );
}
