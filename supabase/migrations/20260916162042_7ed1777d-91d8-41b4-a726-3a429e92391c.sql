CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  attendance NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (attendance >= 0 AND attendance <= 100),
  marks NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (marks >= 0 AND marks <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public can add students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update students" ON public.students FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete students" ON public.students FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.students (student_id, name, department, year, email, phone, attendance, marks) VALUES
('AI2201', 'Aarav Sharma', 'Artificial Intelligence and Data Science', 3, 'aarav.sharma@college.edu', '9876543210', 92.50, 88.00),
('AI2202', 'Diya Nair', 'Artificial Intelligence and Data Science', 2, 'diya.nair@college.edu', '9812345678', 87.00, 91.50),
('CS2203', 'Rohan Verma', 'Computer Science', 4, 'rohan.verma@college.edu', '9900112233', 78.25, 74.00),
('EC2204', 'Meera Iyer', 'Electronics and Communication', 1, 'meera.iyer@college.edu', '9765432180', 95.00, 82.75),
('AI2205', 'Karthik Reddy', 'Artificial Intelligence and Data Science', 3, 'karthik.reddy@college.edu', '9123456780', 68.50, 59.00);