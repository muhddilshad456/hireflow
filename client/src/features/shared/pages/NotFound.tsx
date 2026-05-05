import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg px-8 py-10 text-center w-full max-w-md">
        {/* 404 */}
        <h1 className="text-6xl font-bold text-violet-600">404</h1>

        {/* Title */}
        <h2 className="mt-2 text-lg font-semibold text-gray-800">
          Page not found
        </h2>

        {/* Description */}
        <p className="mt-1 text-sm text-gray-500">
          The page you're looking for doesn't exist.
        </p>

        {/* Buttons */}
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Back
          </button>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};
