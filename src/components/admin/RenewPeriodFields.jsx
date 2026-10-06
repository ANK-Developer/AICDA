import { inputClass } from "./directory-shared";

// Today in India as "YYYY-MM-DD" — only used as the default / limit of the
// Payment Date field. Whether a renewal is allowed is decided by the backend.
export const todayIST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// Starting value of Valid From. The backend sends `membership.nextValidFrom`:
// the last valid-to day, or the day the record was created when nothing has been
// paid yet. The payment date is not entered: the backend saves today's date.
export function renewDefaults(record) {
  return { from: record?.membership?.nextValidFrom || "" };
}

const daysBetween = (fromDay, toDay) => Math.round((Date.parse(toDay) - Date.parse(fromDay)) / 86400000);

const formatDay = (day) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

// "Valid From" input of a renewal form (shown before "New Validity To").
//
//  - While the current plan is still running, the new plan has to continue from
//    its last day, so Valid From is fixed.
//  - After a plan has lapsed, Valid From can be any day from the last valid-to
//    up to today; a later day leaves a gap, which stays Expired. The gap is
//    shown before saving.
export function ValidFromField({ record, value, onChange, disabled }) {
  const membership = record?.membership;
  const previousTo = membership && membership.status !== "PENDING" ? membership.nextValidFrom : null;
  const planRunning = membership?.status === "VALID";
  const gapDays = previousTo && value && value > previousTo ? daysBetween(previousTo, value) : 0;

  return (
    <label className="mt-4 block text-[13px] font-semibold text-slate-700">
      Valid From
      <input
        type="date"
        required
        value={value}
        min={previousTo || undefined}
        max={planRunning ? previousTo : todayIST()}
        readOnly={planRunning}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} mt-1 w-full ${planRunning ? "bg-slate-50" : ""}`}
      />
      {planRunning ? (
        <span className="mt-1 block text-[11px] font-normal text-slate-400">
          The current plan runs until {formatDay(previousTo)}; the new plan continues from it.
        </span>
      ) : previousTo ? (
        <span className="mt-1 block text-[11px] font-normal text-slate-400">
          Last valid-to was {formatDay(previousTo)}. Choose that day to continue without a gap.
        </span>
      ) : null}
      {gapDays > 0 && (
        <span className="mt-1 block text-[12px] font-medium text-amber-700">
          Gap of {gapDays} day{gapDays === 1 ? "" : "s"} ({formatDay(previousTo)} to {formatDay(value)}): the
          member stays Expired during this period.
        </span>
      )}
    </label>
  );
}
