import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";

export const Login = () => {
  const navigate = useNavigate();
  const { oauth } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center">Welcome</h1>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 items-center">
          <GoogleLogin
            theme="outline"
            size="large"
            onSuccess={async (credentialResponse) => {
              const id_token = credentialResponse.credential;
              await oauth("google", id_token!);
              navigate("/");
            }}
            onError={() => {
              console.log("Google login failed");
            }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-400">
          <span className="h-px w-10 bg-gray-300" />
          <span>or</span>
          <span className="h-px w-10 bg-gray-300" />
        </div>

        {/* Email / Register Buttons */}
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => navigate("/login/email")}
            className="w-1/2 bg-blue-100 text-blue-800 border border-blue-300 rounded-lg py-2 hover:bg-blue-200  cursor-pointer"
          >
            Login with Email
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-1/2 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg py-2 hover:bg-gray-200 cursor-pointer"
          >
            Register with Email
          </button>
        </div>
      </div>
    </div>
  );
};
