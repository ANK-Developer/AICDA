import { forwardRef } from "react";
import { Link } from "react-router-dom";

// Fills `:param`-style placeholders written as `$param` (e.g. "/profile/member/$id").
export function resolvePath(to, params = {}) {
  return to.replace(/\$(\w+)/g, (_, key) => encodeURIComponent(String(params[key] ?? "")));
}

// react-router Link that also accepts `params` for `$param` placeholders and a
// `search` object, so call sites can build URLs from one route template.
export const AppLink = forwardRef(function AppLink({ to, params, search, ...props }, ref) {
  const query = search ? new URLSearchParams(search).toString() : "";
  return (
    <Link
      ref={ref}
      to={{ pathname: resolvePath(to, params), search: query ? `?${query}` : "" }}
      {...props}
    />
  );
});
