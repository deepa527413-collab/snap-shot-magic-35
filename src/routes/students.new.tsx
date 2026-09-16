import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { StudentForm } from "@/components/StudentForm";
import { createStudent } from "@/lib/students";

export const Route = createFileRoute("/students/new")({
  head: () => ({
    meta: [
      { title: "Add Student | Student Management System" },
      {
        name: "description",
        content: "Add a new student record with validated ID, contact details, attendance and marks.",
      },
      { property: "og:title", content: "Add Student | Student Management System" },
      {
        property: "og:description",
        content: "Create a new validated student record in the database.",
      },
    ],
  }),
  component: AddStudent,
});

function AddStudent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addStudent = useMutation({
    mutationFn: createStudent,
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(`${student.name} added successfully`);
      navigate({ to: "/students/$id", params: { id: student.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="page-shell max-w-4xl">
      <h1 className="text-3xl font-semibold text-foreground">Add Student</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        All fields are required. Student ID must be unique.
      </p>

      <div className="mt-6">
        <StudentForm
          submitLabel="Save Student"
          pending={addStudent.isPending}
          onSubmit={(values) => addStudent.mutate(values)}
          onCancel={() => navigate({ to: "/students" })}
        />
      </div>
    </div>
  );
}
