import { useParams } from "react-router-dom";
import { MemberDetails } from "@/components/admin/MemberDetails";

export default function MemberDetailsPage() {
  const { slug } = useParams();
  return <MemberDetails slug={slug} />;
}
