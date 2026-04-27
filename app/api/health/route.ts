// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  
  // Test connection to Strapi
  let strapiStatus = "unknown";
  let strapiError = null;
  
  try {
    if (!strapiUrl) {
      throw new Error("NEXT_PUBLIC_STRAPI_URL is not defined");
    }
    
    const response = await fetch(`${strapiUrl}/api/products?pagination[pageSize]=1`, {
      cache: "no-store"
    });
    
    if (response.ok) {
      strapiStatus = "connected";
    } else {
      strapiStatus = "error";
      strapiError = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error: any) {
    strapiStatus = "error";
    strapiError = error.message;
  }
  
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_STRAPI_URL: strapiUrl || "NOT SET",
    },
    strapi: {
      status: strapiStatus,
      error: strapiError,
      url: strapiUrl,
    }
  });
}
