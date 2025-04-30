/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArticleJsonLd, NextSeo } from "next-seo";
import Link from "next/link";
import { DocsKeywords } from "@/setup/keywords";
import { useSession } from "next-auth/react";

export default function DocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const user = session?.user;

  //   const structuredData = {
  //     "@context": "https://schema.org",
  //     "@type": "TechArticle",
  //     headline: "Convertly API Documentation",
  //     description:
  //       "Comprehensive documentation for Convertly's file conversion and QR code generation API",
  //     keywords:
  //       "API documentation, file conversion API, QR code API, Convertly API, developer resources, file conversion, online file converter, API reference, convert PDF, convert images, API integration, API tutorial, developer documentation, QR code generation API, REST API, API reference guide, file conversion API documentation, Convertly developer tools, developer support, API guides, online converter integration, API docs, file conversion integration, image conversion API, PDF conversion API, documentation examples, web API, file API, generate QR codes, file API examples, API examples, file conversion API implementation, QR code API integration, online tools API, developer tools for file conversion, API tutorials, developer platform, file conversion service, QR code service API, QR code generation documentation, API features, API use cases, online converter API, API for developers, API support, API guides for developers, online API reference, conversion API docs, QR code service, image to PDF API, image format conversion API, PDF to image API, QR code for websites, create QR codes API, generate PDFs, QR code creation API, dynamic QR code API, custom QR code API, simple API for developers, easy-to-use file conversion API, QR code creation tools, file upload API, file download API, integrate API with web app, Convertly API for developers, conversion tools for developers, PDF converter API, image file converter API, QR code tools for websites, API integration for file conversion, user-friendly API, PDF to JPG API, convert document files API, document to image API, online file conversion API docs, online QR code API, API setup tutorial, code snippets for API integration, integration with Convertly API, API authentication guide, easy API integration, API documentation with examples, API best practices, scalable API solutions, server-side API, Convertly file converter API, API for content management, URL to QR code API, online file converter API integration, API for file management, file handling API, QR code integration API",
  //     articleSection: "Technical Documentation",
  //     audience: "Developers",
  //   };

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NextSeo
        title="API Documentation - Convertly Developer Resources"
        description="Integrate Convertly's powerful file conversion and QR code generation APIs into your applications. Comprehensive documentation and examples."
        openGraph={{
          title: "Convertly API Documentation",
          description:
            "Integrate Convertly's powerful file conversion and QR code generation APIs into your applications.",
          url: "https://convertly.cosmente.com/docs",
          type: "article",
        }}
        twitter={{
          cardType: "summary_large_image",
        }}
        additionalMetaTags={[
          {
            property: "keywords",
            content: DocsKeywords.join(", "), // Use the large keyword set
          },
        ]}
      />

      <ArticleJsonLd
        headline="Convertly API Documentation"
        description="Comprehensive documentation for Convertly's file conversion and QR code generation API"
        authorName="Convertly"
        datePublished="2025-04-27"
        dateModified="2025-04-27"
        keywords={DocsKeywords.join(", ")} // Keywords as an array
        url={""}
        title={""}
        images={[]}
      />
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              API Documentation
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {` Integrate Convertly's conversion tools directly into your
              applications.`}
            </p>

            {!user?.isPro && (
              <Alert className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>API access is only available for Pro users.</span>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="overview">
              <TabsList className="mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="file-conversion">
                  File Conversion
                </TabsTrigger>
                <TabsTrigger value="qr-code">QR Code</TabsTrigger>
                <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="prose max-w-none">
                  <h2>API Overview</h2>
                  <p>
                    {`Convertly's API allows you to integrate our conversion tools
                    directly into your applications. The API provides endpoints
                    for file conversion and QR code generation.`}
                  </p>

                  <h3>Base URL</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md flex justify-between items-center">
                    <code>https://api.convertly.com/v1</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                      onClick={() =>
                        copyToClipboard(
                          "https://api.convertly.com/v1",
                          "base-url"
                        )
                      }
                    >
                      {copiedEndpoint === "base-url" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <h3>Response Format</h3>
                  <p>
                    All API responses are returned in JSON format. Successful
                    responses have a 200 OK status code and include the
                    requested data. Error responses include appropriate HTTP
                    status codes and an error message explaining what went
                    wrong.
                  </p>

                  <h3>Getting Started</h3>
                  <ol>
                    <li>Upgrade to a Pro account</li>
                    <li>Generate an API key in your dashboard</li>
                    <li>Include your API key in the request headers</li>
                    <li>Make API requests to our endpoints</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="authentication">
                <div className="prose max-w-none">
                  <h2>Authentication</h2>
                  <p>
                    All API requests require authentication using an API key.
                    Your API key should be included in the request headers as{" "}
                    <code>x-api-key</code>.
                  </p>

                  <h3>API Key Management</h3>
                  <p>
                    {`You can generate and manage your API keys in your dashboard
                    under the "API Keys" section. Keep your API keys secure and
                    never share them in public repositories or client-side code.`}
                  </p>

                  <h3>Example Request with Authentication</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre>
                      <code>
                        {`curl -X POST https://api.convertly.com/v1/convert \\
                        -H "x-api-key: your_api_key_here" \\
                        -F "file=@example.pdf" \\
                        -F "sourceFormat=pdf" \\
                        -F "targetFormat=docx"
                        `}
                      </code>
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="file-conversion">
                <div className="prose max-w-none">
                  <h2>File Conversion API</h2>
                  <p>
                    The file conversion API allows you to convert files between
                    different formats. Supported conversions include PDF to
                    DOCX, DOCX to PDF, and various image format conversions.
                  </p>

                  <h3>Convert a File</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md flex justify-between items-center mb-4">
                    <code>POST /convert</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                      onClick={() =>
                        copyToClipboard(
                          "POST https://api.convertly.com/v1/convert",
                          "convert-endpoint"
                        )
                      }
                    >
                      {copiedEndpoint === "convert-endpoint" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <h4>Request Parameters</h4>
                  <ul>
                    <li>
                      <code>file</code> - The file to convert
                      (multipart/form-data)
                    </li>
                    <li>
                      <code>sourceFormat</code> - The source format of the file
                      (e.g., pdf, docx, png)
                    </li>
                    <li>
                      <code>targetFormat</code> - The desired output format
                      (e.g., docx, pdf, jpg)
                    </li>
                  </ul>

                  <h4>Example Request</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre>
                      <code>
                        {`curl -X POST https://api.convertly.com/v1/convert \\
  -H "x-api-key: your_api_key_here" \\
  -F "file=@example.pdf" \\
  -F "sourceFormat=pdf" \\
  -F "targetFormat=docx"
`}
                      </code>
                    </pre>
                  </div>

                  <h4>Response</h4>
                  <p>
                    On successful conversion, the API returns the converted file
                    as a binary response with the appropriate content type and
                    content-disposition headers.
                  </p>

                  <h3>Supported Conversion Types</h3>
                  <ul>
                    <li>PDF ↔ DOCX</li>
                    <li>PDF ↔ Images (JPG, PNG)</li>
                    <li>PNG ↔ JPG ↔ WebP</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="qr-code">
                <div className="prose max-w-none">
                  <h2>QR Code API</h2>
                  <p>
                    The QR code API allows you to generate QR codes for various
                    types of content, including URLs, plain text, and email
                    addresses.
                  </p>

                  <h3>Generate a QR Code</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md flex justify-between items-center mb-4">
                    <code>POST /qr-code</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                      onClick={() =>
                        copyToClipboard(
                          "POST https://api.convertly.com/v1/qr-code",
                          "qr-endpoint"
                        )
                      }
                    >
                      {copiedEndpoint === "qr-endpoint" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <h4>Request Body</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre>
                      <code>
                        {`{
  "content": "https://example.com",
  "type": "url",
  "name": "Example QR",
  "options": {
    "color": "#000000",
    "backgroundColor": "#ffffff",
    "size": 300,
    "margin": 4
  }
}`}
                      </code>
                    </pre>
                  </div>

                  <h4>Request Parameters</h4>
                  <ul>
                    <li>
                      <code>content</code> (required) - The content to encode in
                      the QR code
                    </li>
                    <li>
                      <code>type</code>{" "}
                      {`(required) - The type of content: "url",
                      "text", or "email"`}
                    </li>
                    <li>
                      <code>name</code> (optional) - A name for the QR code
                    </li>
                    <li>
                      <code>options</code> (optional) - Customization options:
                      <ul>
                        <li>
                          <code>color</code> - The color of the QR code (hex)
                        </li>
                        <li>
                          <code>backgroundColor</code> - The background color
                          (hex)
                        </li>
                        <li>
                          <code>size</code> - The size in pixels
                        </li>
                        <li>
                          <code>margin</code> - The margin size
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <h4>Example Request</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre>
                      <code>
                        {`curl -X POST https://api.convertly.com/v1/qr-code \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "https://example.com",
    "type": "url",
    "name": "Example QR",
    "options": {
      "color": "#000000",
      "backgroundColor": "#ffffff",
      "size": 300,
      "margin": 4
    }
  }'
`}
                      </code>
                    </pre>
                  </div>

                  <h4>Response</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre>
                      <code>
                        {`{
  "qrCode": {
    "id": 123,
    "userId": 456,
    "content": "https://example.com",
    "type": "url",
    "name": "Example QR",
    "options": {
      "color": "#000000",
      "backgroundColor": "#ffffff",
      "size": 300,
      "margin": 4
    },
    "createdAt": "2023-06-15T14:30:00Z"
  },
  "qrSvg": "<svg>...</svg>"
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rate-limits">
                <div className="prose max-w-none">
                  <h2>Rate Limits</h2>
                  <p>
                    To ensure fair usage of our API, we implement rate limiting.
                    Rate limits are based on your subscription plan and are
                    applied per API key.
                  </p>

                  <h3>Pro Plan Limits</h3>
                  <ul>
                    <li>File Conversion: 1,000 requests per day</li>
                    <li>QR Code Generation: 5,000 requests per day</li>
                  </ul>

                  <h3>Rate Limit Headers</h3>
                  <p>
                    Each API response includes the following headers to help you
                    track your rate limit usage:
                  </p>
                  <ul>
                    <li>
                      <code>X-RateLimit-Limit</code> - The total number of
                      requests allowed per day
                    </li>
                    <li>
                      <code>X-RateLimit-Remaining</code> - The number of
                      requests remaining in the current period
                    </li>
                    <li>
                      <code>X-RateLimit-Reset</code> - The time at which the
                      rate limit resets (Unix timestamp)
                    </li>
                  </ul>

                  <h3>Exceeding Rate Limits</h3>
                  <p>
                    If you exceed your rate limit, the API will return a 429 Too
                    Many Requests response. The response will include a
                    Retry-After header indicating how many seconds to wait
                    before making another request.
                  </p>

                  <h3>Contact Us</h3>
                  <p>
                    If you need higher rate limits for your application, please
                    contact our support team to discuss custom plans that can
                    accommodate your needs.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-16 bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
                  <p className="text-gray-600">
                    Our support team is ready to help with any questions about
                    our API. You can also check out our API examples and SDKs.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline">Contact Support</Button>
                  <Button>View API Examples</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
