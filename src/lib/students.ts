import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

export type Student = {
  id: string;
  student_id: string;
  name: string;
  department: string;
  year: number;
  email: string;
  phone: string;
  attendance: number;
  marks: number;
  created_at: string;
  updated_at: string;
};

export const DEPARTMENTS = [
  "Artificial Intelligence and Data Science",
  "Computer Science",
  "Information Technology",
  "Electronics and Communication",
  "Electrical and Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
] as const;

export const YEARS = [1, 2, 3, 4] as const;

export const studentSchema = z.object({
  student_id: z
    .string()
    .trim()
    .min(1, { message: "Student ID is required" })
    .max(20, { message: "Student ID must be 20 characters or fewer" })
    .regex(/^[A-Za-z0-9-]+$/, { message: "Use letters, numbers and hyphens only" }),
  name: z
    .string()
    .trim()
    .min(2, { message: "Student name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  department: z.string().trim().min(1, { message: "Department is required" }),
  year: z.coerce
    .number({ invalid_type_error: "Year is required" })
    .int()
    .min(1, { message: "Year must be between 1 and 4" })
    .max(4, { message: "Year must be between 1 and 4" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be exactly 10 digits" }),
  attendance: z.coerce
    .number({ invalid_type_error: "Attendance is required" })
    .min(0, { message: "Attendance must be between 0 and 100" })
    .max(100, { message: "Attendance must be between 0 and 100" }),
  marks: z.coerce
    .number({ invalid_type_error: "Marks are required" })
    .min(0, { message: "Marks must be between 0 and 100" })
    .max(100, { message: "Marks must be between 0 and 100" }),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

function toStudent(row: Record<string, unknown>): Student {
  return {
    id: String(row["id"]),
    student_id: String(row["student_id"]),
    name: String(row["name"]),
    department: String(row["department"]),
    year: Number(row["year"]),
    email: String(row["email"]),
    phone: String(row["phone"]),
    attendance: Number(row["attendance"]),
    marks: Number(row["marks"]),
    created_at: String(row["created_at"]),
    updated_at: String(row["updated_at"]),
  };
}

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("student_id", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toStudent);
}

export async function fetchStudent(id: string): Promise<Student> {
  const { data, error } = await supabase.from("students").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Student not found");
  return toStudent(data);
}

function friendlyError(message: string) {
  if (message.includes("students_student_id_key") || message.includes("duplicate key")) {
    return "This Student ID already exists. Please use a unique Student ID.";
  }
  return message;
}

export async function createStudent(values: StudentFormValues): Promise<Student> {
  const { data, error } = await supabase.from("students").insert(values).select("*").single();

  if (error) throw new Error(friendlyError(error.message));
  return toStudent(data);
}

export async function updateStudent(id: string, values: StudentFormValues): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(friendlyError(error.message));
  return toStudent(data);
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export const studentsQueryOptions = queryOptions({
  queryKey: ["students"],
  queryFn: fetchStudents,
});

export const studentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["students", id],
    queryFn: () => fetchStudent(id),
  });

export function averageOf(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function gradeFor(marks: number) {
  if (marks >= 90) return "O";
  if (marks >= 80) return "A+";
  if (marks >= 70) return "A";
  if (marks >= 60) return "B";
  if (marks >= 50) return "C";
  return "F";
}
