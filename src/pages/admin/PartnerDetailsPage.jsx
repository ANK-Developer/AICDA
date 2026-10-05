import { useParams } from "react-router-dom";
import { PartnerDetails } from "@/components/admin/PartnerDetails";

export default function PartnerDetailsPage() {
  const { slug } = useParams();
  return <PartnerDetails slug={slug} />;
}
