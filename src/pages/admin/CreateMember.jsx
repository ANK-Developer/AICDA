import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MemberForm } from "@/components/admin/MemberForm";
import { useGoBack } from "@/hooks/use-go-back";

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const goBack = useGoBack("/admin/directory");
  const backToDirectory = () => navigate("/admin/directory");

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-lg font-bold">Member Form</h2>
      </div>

      <MemberForm onCancel={goBack} onSaved={backToDirectory} />
    </section>
  );
}
