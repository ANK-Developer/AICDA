import { createFileRoute } from "@tanstack/react-router";
import { PublicProfileView } from "@/components/site/PublicProfileView";

export const Route = createFileRoute("/profile/partner/$id")({
  head: () => ({
    meta: [
      { title: "Partner Profile · AICDA" },
      { name: "description", content: "Public AICDA partner profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicPartnerRoute,
});

function PublicPartnerRoute() {
  const { id } = Route.useParams();
  return <PublicProfileView type="partner" id={id} />;
}
