interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "red" | "green" | "violet";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const colorStyles = {
    red: "bg-red-500 hover:bg-red-600",
    green: "bg-green-500 hover:bg-green-600",
    violet: "bg-violet-600 hover:bg-violet-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-lg w-[90%] max-w-sm p-6 z-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>

        <p className="text-sm text-gray-500 mb-5">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-sm rounded-md text-white ${colorStyles[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
