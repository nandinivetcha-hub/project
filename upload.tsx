import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateFile } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BRANCHES = ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];
const FILE_TYPES = ["Notes", "PYQs", "Lab Manual"];
const SUBJECTS_BY_BRANCH: Record<string, string[]> = {
  "Computer Science": ["Data Structures and Algorithms", "Operating Systems", "DBMS", "Computer Networks", "Software Engineering", "Computer Organization and Architecture", "Theory of Computation", "Machine Learning", "Web Technologies", "Computer Graphics", "Engineering Mathematics"],
  "Electronics": ["Digital Electronics", "Analog Circuits", "Signal Processing", "Microprocessors", "VLSI Design", "Electromagnetic Theory"],
  "Mechanical": ["Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Machine Design", "Manufacturing Processes"],
  "Civil": ["Structural Analysis", "Geotechnical Engineering", "Transportation Engineering", "Fluid Mechanics", "Surveying"],
  "Chemical": ["Chemical Reaction Engineering", "Mass Transfer", "Heat Transfer", "Thermodynamics", "Process Control"],
};

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subject: z.string().min(1, "Subject is required"),
  unit: z.coerce.number().int().min(1).max(10).optional(),
  fileType: z.string().min(1, "File type is required"),
  keywords: z.string().optional(),
  branch: z.string().min(1, "Branch is required"),
  year: z.string().min(1, "Year is required"),
  semester: z.string().min(1, "Semester is required"),
  driveLink: z.string().url("Must be a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const { toast } = useToast();
  const createFile = useCreateFile();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      unit: undefined,
      fileType: "",
      keywords: "",
      branch: "",
      year: "",
      semester: "",
      driveLink: "",
    },
  });

  const selectedBranch = form.watch("branch");
  const subjects = SUBJECTS_BY_BRANCH[selectedBranch] || [];

  const onSubmit = (values: FormValues) => {
    createFile.mutate(
      { data: { ...values, unit: values.unit ?? null, keywords: values.keywords || null } },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset();
          setTimeout(() => setSubmitted(false), 3000);
        },
        onError: (err: any) => {
          toast({
            title: "Upload failed",
            description: err?.data?.error || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Upload Resource</h1>
          <p className="text-muted-foreground mt-1">Add a new academic resource to the library.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Resource Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Data Structures Complete Notes - Unit 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={(v) => { field.onChange(v); form.setValue("subject", ""); }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedBranch}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fileType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Number (optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={10} placeholder="e.g. 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="driveLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Drive Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://drive.google.com/file/d/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. sorting, arrays, binary trees" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 text-secondary font-medium p-4 bg-secondary/10 rounded-lg border border-secondary/20"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Resource uploaded successfully!
                    </motion.div>
                  ) : (
                    <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Button type="submit" className="w-full" disabled={createFile.isPending}>
                        <Upload className="h-4 w-4 mr-2" />
                        {createFile.isPending ? "Uploading..." : "Upload Resource"}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
