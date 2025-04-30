/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    displayName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingR, setIsLoadingR] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  // const [loginError, setLoginError] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  // const [isGithubLoading, setIsGithubLoading] = useState(false);
  // const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        console.log(result.error);
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return;
      }

      // Get the user's role from the session
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      console.log("Session: ", session?.user);

      // Redirect based on role
      if (session?.user?.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push(callbackUrl);
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGithubLogin = async () => {
  //   setIsGithubLoading(true);
  //   try {
  //     await signIn("github", { callbackUrl });
  //   } catch (error) {
  //     console.error("GitHub login error:", error);
  //     toast({
  //       title: "Login failed",
  //       description: "Could not sign in with GitHub",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsGithubLoading(false);
  //   }
  // };

  // const handleGoogleLogin = async () => {
  //   setIsGoogleLoading(true);
  //   try {
  //     await signIn("google", { callbackUrl });
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     toast({
  //       title: "Login failed",
  //       description: "Could not sign in with Google",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsGoogleLoading(false);
  //   }
  // };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoadingR(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          email: data.email,
          username: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error || "Registration failed");
      }

      toast({
        title: "Account created!",
        description: "You can now log in with your credentials",
      });

      await signIn("credentials", {
        username: data.username,
        password: data.password,
        callbackUrl: "/dashboard",
      });
      router.refresh();
    } catch (error: any) {
      // console.error("Registration error:", error.response);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoadingR(false);
    }
    // registerMutation.mutate(data);
    // router.push("/dashboard");
    // Sign in the user after successful registration
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row overflow-hidden bg-white rounded-lg shadow-xl max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="relative lg:w-1/2 bg-primary-600 px-8 py-12 lg:py-24 ">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold">Welcome to Convertly</h2>
                <p className="mt-4 text-lg text-primary-50">
                  Your all-in-one platform for file conversions and QR code
                  generation.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-primary-300 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Convert between PDF, DOCX, and images</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-primary-300 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Create custom QR codes in seconds</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-primary-300 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Access API for automated workflows</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-primary-300 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Store your conversion history</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 opacity-10">
                <svg className="w-64 h-64" viewBox="0 0 256 256" fill="none">
                  <path
                    d="M108 60H40V148H108V60Z"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <path
                    d="M108 188H40V228H108V188Z"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <path
                    d="M148 40H216V108H148V40Z"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <path
                    d="M148 148H216V228H148V148Z"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                </svg>
              </div>
            </div>

            {/* Auth Forms */}
            <div className="lg:w-1/2 p-6 sm:p-8 md:p-12">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Log In to Your Account</CardTitle>
                      <CardDescription>
                        Enter your credentials to access your dashboard.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form
                          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* {loginMutation.isError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {loginMutation.error?.message ||
                                  "Login failed. Please check your credentials."}
                              </AlertDescription>
                            </Alert>
                          )} */}

                          <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                              </>
                            ) : (
                              "Log In"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <div className="text-sm text-center text-gray-500">
                        {`Don't have an account? `}
                        <button
                          onClick={() => setActiveTab("register")}
                          className="text-primary hover:underline"
                        >
                          Sign up
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an Account</CardTitle>
                      <CardDescription>
                        {`Register to start using Convertly's features.`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form
                          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="displayName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Name (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="••••••••"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="••••••••"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* {registerMutation.isError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {registerMutation.error?.message ||
                                  "Registration failed. Please try again."}
                              </AlertDescription>
                            </Alert>
                          )} */}

                          <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={isLoadingR}
                          >
                            {isLoadingR ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              "Sign Up"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <div className="text-sm text-center text-gray-500">
                        Already have an account?{" "}
                        <button
                          onClick={() => setActiveTab("login")}
                          className="text-primary hover:underline"
                        >
                          Log in
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
