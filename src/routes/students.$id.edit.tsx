import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { StudentForm } from "@/components/StudentForm";
import { Button } from "@/components/ui/button";
import { studentQueryOptions, updateStudent } from "@/lib/students";

export const Route = createFileRoute("/students/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Student | Student Management System" },
      {
        name: "description",
        content: "Update an existing student record with validation before saving to the database.",
      },
      { property: "og:title", content: "Edit Student | Student Management System" },
      {
        property: "og:description",
        content: "Edit student details, attendance and marks and save the changes.",
      },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(studentQueryOptions(params.id));
  },
  component: EditStudent,
  errorComponent: ({ error }) => (
    <div className="page-shell" role="alert">
      <p className="text-sm text-destructive">{error.message}</p>
      <Button asChild className="mt-4">
        <Link to="/students">Back to students</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => <div className="page-shell">Student not found.</div>,
});

function EditStudent() {
  const { id } = Route.useParams();
  const { data: student } = useSuspenseQuery(studentQueryOptions(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const saveStudent = useMutation({
    mutationFn: (values: Parameters<typeof updateStudent>[1]) => updateStudent(id, values),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", id] });
      toast.success(`${updated.name} updated successfully`);
      navigate({ to: "/students/$id", params: { id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="page-shell max-w-4xl">
      <h1 className="text-3xl font-semibold text-foreground">Edit Student</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Updating record {student.student_id} &mdash; {student.name}
      </p>

      <div className="mt-6">
        <StudentForm
          student={student}
          submitLabel="Update Student"
          pending={saveStudent.isPending}
          onSubmit={(values) => saveStudent.mutate(values)}
          onCancel={() => navigate({ to: "/students/$id", params: { id } })}
        />
      </div>
    </div>
  );
}
