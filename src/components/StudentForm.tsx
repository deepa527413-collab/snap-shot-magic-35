import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEPARTMENTS,
  YEARS,
  studentSchema,
  type Student,
  type StudentFormValues,
} from "@/lib/students";

type FieldName = keyof StudentFormValues;

type Draft = Record<FieldName, string>;

const emptyDraft: Draft = {
  student_id: "",
  name: "",
  department: DEPARTMENTS[0],
  year: "1",
  email: "",
  phone: "",
  attendance: "",
  marks: "",
};

function draftFrom(student?: Student): Draft {
  if (!student) return emptyDraft;
  return {
    student_id: student.student_id,
    name: student.name,
    department: student.department,
    year: String(student.year),
    email: student.email,
    phone: student.phone,
    attendance: String(student.attendance),
    marks: String(student.marks),
  };
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function StudentForm({
  student,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  student?: Student;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: StudentFormValues) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(student));
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const set = (field: FieldName) => (value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = studentSchema.safeParse(draft);

    if (!parsed.success) {
      const nextErrors: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  }

  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p className="text-xs font-medium text-destructive">{errors[field]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="surface-panel p-5 sm:p-7" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="student_id">Student ID</Label>
          <Input
            id="student_id"
            value={draft.student_id}
            onChange={(e) => set("student_id")(e.target.value)}
            placeholder="AI2206"
            maxLength={20}
            aria-invalid={Boolean(errors.student_id)}
          />
          {fieldError("student_id")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Student Name</Label>
          <Input
            id="name"
            value={draft.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Ananya Krishnan"
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
          />
          {fieldError("name")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <select
            id="department"
            className={selectClass}
            value={draft.department}
            onChange={(e) => set("department")(e.target.value)}
          >
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          {fieldError("department")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <select
            id="year"
            className={selectClass}
            value={draft.year}
            onChange={(e) => set("year")(e.target.value)}
          >
            {YEARS.map((year) => (
              <option key={year} value={String(year)}>
                Year {year}
              </option>
            ))}
          </select>
          {fieldError("year")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={draft.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="student@college.edu"
            maxLength={255}
            aria-invalid={Boolean(errors.email)}
          />
          {fieldError("email")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            inputMode="numeric"
            value={draft.phone}
            onChange={(e) => set("phone")(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="9876543210"
            aria-invalid={Boolean(errors.phone)}
          />
          {fieldError("phone")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendance">Attendance Percentage</Label>
          <Input
            id="attendance"
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={draft.attendance}
            onChange={(e) => set("attendance")(e.target.value)}
            placeholder="85"
            aria-invalid={Boolean(errors.attendance)}
          />
          {fieldError("attendance")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="marks">Marks</Label>
          <Input
            id="marks"
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={draft.marks}
            onChange={(e) => set("marks")(e.target.value)}
            placeholder="78"
            aria-invalid={Boolean(errors.marks)}
          />
          {fieldError("marks")}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
