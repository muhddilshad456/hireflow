import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../../hooks/reduxHooks";
import { getUsersApi } from "../../../shared/services/authService";
import toast from "react-hot-toast";
import { setCredentials } from "../../../../redux/slice/authSlice";

export function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Failed to continue with google");
      navigate("/login");
      return;
    }

    dispatch(
      setCredentials({
        token,
        user: null,
      }),
    );

    const fetchUser = async () => {
      try {
        const result = await getUsersApi();

        dispatch(
          setCredentials({
            token,
            user: result.data,
          }),
        );

        toast.success("Logged in");

        navigate("/");
      } catch (error: any) {
        console.log("google error : ", error.response?.data);
        toast.error("Failed to continue with google");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-md">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>

        {/* Text */}
        <h2 className="text-lg font-semibold text-gray-800">
          Logging you in with Google
        </h2>

        <p className="text-sm text-gray-500">
          Please wait while we securely authenticate your account...
        </p>
      </div>
    </div>
  );
}
