"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/file-utils";

interface AdminStats {
  totalUsers: number;
  totalConversions: number;
  totalProUsers: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    isPro: boolean;
    createdAt: string;
  }>;
  recentConversions: Array<{
    id: string;
    userId: string;
    userName: string;
    sourceFormat: string;
    targetFormat: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("Session22: ", session?.user);

  const fetchAdminStats = async () => {
    const response = await fetch("/api/admin/stats");
    if (!response.ok) {
      throw new Error("Failed to fetch admin stats");
    }
    return response.json();
  };

  const { data: adminStats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user && session.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex pt-16">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-6 lg:pl-72">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome to the admin dashboard
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pro Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats?.totalProUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Conversions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats?.totalConversions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All-time conversions
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminStats?.recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.isPro ? "Pro" : "Free"}</TableCell>
                          <TableCell>
                            {formatDate(new Date(user.createdAt))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversions</CardTitle>
                  <CardDescription>Latest file conversions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Conversion</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminStats?.recentConversions.map((conversion) => (
                        <TableRow key={conversion.id}>
                          <TableCell>{conversion.userName}</TableCell>
                          <TableCell>
                            {conversion.sourceFormat} →{" "}
                            {conversion.targetFormat}
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(conversion.createdAt))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
