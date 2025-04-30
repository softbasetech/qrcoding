/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Navbar } from "@/components/layout/navbar";
import React from "react";
import { useQRCode } from "@/hooks/use-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { IIQRCodeData } from "@/hooks/interface";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useSession } from "next-auth/react";

export default function QRCodePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const { downloadQRCode } = useQRCode();
  const { data: qrCodes, isLoading: isLoadingQRCodes } = useQuery({
    queryKey: ["/api/qr-code"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  function downloadFile(url: string, filename?: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || ""; // if filename is not provided, use default from URL
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openInNewTab(url?: string) {
    if (url) {
      window.open(url, "_blank");
    }
  }
  console.log("qrCodes:::", qrCodes);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-6 lg:pl-72">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Your QR Codes</h1>

            {isLoadingQRCodes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : qrCodes && (qrCodes as any).data.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No QR Codes Yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven&apos;t generated any QR codes yet. Create your
                    first QR code to get started.
                  </p>
                  <Button asChild>
                    <a href="/qr-code">Generate QR Code</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrCodes &&
                  (qrCodes as any).data.map((qrCode: IIQRCodeData) => (
                    <Card key={qrCode._id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <QrCode className="h-5 w-5" />
                          {qrCode.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Scans: {qrCode.scans}</span>
                            <span>
                              Created{" "}
                              {qrCode.createdAt &&
                                formatDistanceToNow(
                                  new Date(qrCode.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => openInNewTab(qrCode.url)}
                              size="sm"
                              asChild
                            >
                              <a
                                className="cursor-pointer"
                                href={qrCode.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`/api/qr-code/${qrCode.shortId}/download`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
