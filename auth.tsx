import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Library, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "admin"]),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "admin"]),
  studentId: z.string().optional(),
  adminCode: z.string().optional(),
}).refine(data => {
  if (data.role === "student" && (!data.studentId || data.studentId.length < 3)) return false;
  return true;
}, { message: "Student ID is required for students", path: ["studentId"] })
  .refine(data => {
  if (data.role === "admin" && (!data.adminCode || data.adminCode !== "ADMIN2024")) return false;
  return true;
}, { message: "Invalid admin code", path: ["adminCode"] });

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", role: "student" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "student", studentId: "", adminCode: "" },
  });

  const onLogin = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        setAuth(data);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        setLocation(data.user.role === "admin" ? "/admin" : "/dashboard");
      },
      onError: (error: any) => {
        toast({ title: "Login failed", description: error?.data?.error || "Invalid credentials", variant: "destructive" });
      }
    });
  };

  const onRegister = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        setAuth(data);
        toast({ title: "Welcome!", description: "Account created successfully." });
        setLocation(data.user.role === "admin" ? "/admin" : "/dashboard");
      },
      onError: (error: any) => {
        toast({ title: "Registration failed", description: error?.data?.error || "An error occurred", variant: "destructive" });
      }
    });
  };

  const registerRole = registerForm.watch("role");

  return (
    <div className="min-h-[100dvh] flex bg-background w-full">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-3xl font-serif font-bold mb-8">
            <Library className="w-10 h-10" />
            Academic Hub
          </div>
          <h1 className="text-5xl font-bold font-serif leading-tight mt-24 max-w-xl">
            Your Digital Academic Library
          </h1>
          <p className="text-xl mt-6 text-primary-foreground/80 max-w-md">
            A refined space for students and faculty to discover, share, and manage academic resources.
          </p>
        </div>
        <div className="relative z-10 text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} University Academic Resource Management System.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="space-y-1 px-0 pb-6 text-center lg:text-left">
            <div className="flex lg:hidden justify-center items-center gap-2 text-2xl font-serif font-bold mb-4 text-primary">
              <Library className="w-8 h-8" />
              Academic Hub
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome</CardTitle>
            <CardDescription className="text-base">
              Sign in or create an account to access resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1">
                <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><LogIn className="w-4 h-4 mr-2"/> Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><UserPlus className="w-4 h-4 mr-2"/> Register</TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                {activeTab === "login" && (
                  <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <FormField control={loginForm.control} name="role" render={({ field }) => (
                          <FormItem>
                            <FormLabel>I am a...</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={loginForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="your@email.com" type="email" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={loginForm.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input placeholder="••••••••" type="password" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" className="w-full mt-6" disabled={loginMutation.isPending}>
                          {loginMutation.isPending ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}

                {activeTab === "register" && (
                  <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                        <FormField control={registerForm.control} name="role" render={({ field }) => (
                          <FormItem>
                            <FormLabel>I am a...</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="your@email.com" type="email" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input placeholder="••••••••" type="password" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        {registerRole === "student" && (
                          <FormField control={registerForm.control} name="studentId" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student ID</FormLabel>
                              <FormControl><Input placeholder="e.g. CS2021001" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        {registerRole === "admin" && (
                          <FormField control={registerForm.control} name="adminCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Admin Access Code</FormLabel>
                              <FormControl><Input placeholder="Enter code" type="password" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        <Button type="submit" className="w-full mt-6" disabled={registerMutation.isPending}>
                          {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
