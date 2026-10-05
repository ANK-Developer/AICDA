import { withPageMeta } from "@/components/common/withPageMeta";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSubmitEnquiryMutation } from "@/features/enquiries/enquiriesApi";

const PAGE_META = [
  { title: "Become a Member · AICDA" },
  {
    name: "description",
    content: "Apply for AICDA membership or send us a request — we'll get back to you.",
  },
];

const emptyForm = {
  requestType: "MEMBERSHIP",
  fullName: "",
  mobile: "",
  email: "",
  companyName: "",
  city: "",
  state: "",
  message: "",
};

function Page() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitEnquiry] = useSubmitEnquiryMutation();
  const { hash } = useLocation();

  // Enquiry links use #enquiry-form: scroll the form into view.
  useEffect(() => {
    if (hash !== "#enquiry-form") return undefined;

    const timer = setTimeout(() => {
      document
        .getElementById("enquiry-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => clearTimeout(timer);
  }, [hash]);

  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.mobile.trim()) {
      setError("Name and mobile number are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitEnquiry(form).unwrap();
      setSubmitted(true);
      setForm(emptyForm);
      toast.success("Your request has been submitted. We'll be in touch soon.");
    } catch (requestError) {
      setError(requestError.message || "Unable to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Become a Member"
      subtitle="Apply for AICDA membership or send us a request — we'll get back to you."
    >
      <div
        id="enquiry-form"
        className="mx-auto max-w-4xl scroll-mt-24 rounded-xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8"
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Request submitted</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Thank you for reaching out. Our team will review your request and contact you shortly.
            </p>
            <Button type="button" onClick={() => setSubmitted(false)} className="mt-2">
              Submit another request
            </Button>
          </div>
        ) : (
          <>
            <Prose>
              <h2
                className="mb-6 text-center text-3xl font-black text-foreground"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Become Member
              </h2>
            </Prose>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName" className="mb-2 block">
                    Full Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile" className="mb-2 block">
                    Mobile <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName" className="mb-2 block">
                    Company / Dealership Name
                  </Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="mb-2 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="mb-2 block">
                    State
                  </Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="mb-2 block">
                  Message / Reason for Request
                </Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-center">
                <Button type="submit" disabled={submitting} className="h-11 w-full sm:w-auto">
                  {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
