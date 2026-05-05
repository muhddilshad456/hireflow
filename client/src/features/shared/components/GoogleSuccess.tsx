import { useEffect } from "react";
import { setCredentials } from "../../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAppDispatch } from "../../../hooks/reduxHooks";

const GoogleSuccess = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      dispatch(
        setCredentials({
          user: "null",
          token,
        }),
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="bg-gray-950/60 backdrop-blur-lg border border-gray-800 shadow-2xl rounded-2xl p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Login Successful</h1>
        <p className="text-gray-400 mb-6">
          You have successfully signed in with Google.
        </p>

        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className="bg-green-500 h-2 animate-[loading_2s_linear_forwards]" />
        </div>

        <p className="text-sm text-gray-500 mt-4">Redirecting to home...</p>
      </div>

      <style>
        {`
          @keyframes loading {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}
      </style>
    </div>
  );
};

export default GoogleSuccess;
