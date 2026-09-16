import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteStudent, gradeFor, studentsQueryOptions, type Student } from "@/lib/students";

export const Route = createFileRoute("/students/")({
  head: () => ({
    meta: [
      { title: "View Students | Student Management System" },
      {
        name: "description",
        content: "Search, view, edit and delete all student records stored in the database.",
      },
      { property: "og:title", content: "View Students | Student Management System" },
      {
        property: "og:description",
        content: "Complete student record table with search, edit and delete actions.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(studentsQueryOptions);
  },
  component: ViewStudents,
  errorComponent: ({ error }) => (
    <div className="page-shell" role="alert">
      <p className="text-sm text-destructive">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="page-shell">No students found.</div>,
});

function ViewStudents() {
  const { data: students } = useSuspenseQuery(studentsQueryOptions);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  const removeStudent = useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully");
      setPendingDelete(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const term = search.trim().toLowerCase();
  const filtered = term
    ? students.filter((student) =>
        [student.student_id, student.name, student.department, student.email, student.phone]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
    : students;

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Student Records</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {students.length} record(s) in the database.
          </p>
        </div>
        <Button asChild>
          <Link to="/students/new">
            <UserPlus className="size-4" />
            Add Student
          </Link>
        </Button>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by ID, name, department, email or phone"
          className="pl-9"
          aria-label="Search students"
        />
      </div>

      <div className="surface-panel mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
              <TableHead className="text-right">Marks</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  {students.length === 0
                    ? "No students yet. Add the first student record."
                    : "No students match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {student.department}
                  </TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell className="text-right">
                    <span className={student.attendance < 75 ? "text-destructive" : undefined}>
                      {student.attendance.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{student.marks.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={student.marks < 50 ? "destructive" : "secondary"}>
                      {gradeFor(student.marks)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="View details">
                        <Link to="/students/$id" params={{ id: student.id }}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" aria-label="Edit student">
                        <Link to="/students/$id/edit" params={{ id: student.id }}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete student"
                        onClick={() => setPendingDelete(student)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this student?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.name} (${pendingDelete.student_id}) will be permanently removed from the database. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeStudent.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removeStudent.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (pendingDelete) removeStudent.mutate(pendingDelete.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
