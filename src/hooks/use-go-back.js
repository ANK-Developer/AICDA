import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Returns the page the user actually came from. `location.key` is "default" only
// when this is the first entry in the session (page opened directly or refreshed),
// so there is no in-app page to go back to and the fallback route is used instead.
export function useGoBack(fallback) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key !== "default") navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, location.key, fallback]);
}
