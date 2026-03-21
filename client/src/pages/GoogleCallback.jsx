import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../api/api";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Use fragment (#token=...) for security (kept out of server logs)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const token = params.get("token");

    if (token) {
      // In AuthContext, we normally have a login(user, token) function.
      // But we need to fetch the profile first to get the user object.
      // Or we can rely on silent auth / getProfile to populate state.
      
      setToken(token);
      // Trigger a refresh of the auth state
      window.location.href = "/dashboard";
    } else {
      navigate("/auth?error=oauth_failed");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
};

export default GoogleCallback;
