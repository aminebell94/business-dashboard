// app/api/strapi/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

// Which headers are safe to pass back to the client
const FORWARD_HEADERS = ["content-type", "cache-control", "etag", "location"];

async function buildTargetURL(req: NextRequest, params: Promise<{ path: string[] }>) {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!base) throw new Error("NEXT_PUBLIC_STRAPI_URL is not defined");
  const { path } = await params;
  const qs = req.nextUrl.search; // includes leading '?', or empty string
  const targetUrl = `${base.replace(/\/$/, "")}/api/${path.join("/")}${qs}`;
  console.log(`[Strapi Proxy] ${req.method} ${req.nextUrl.pathname} -> ${targetUrl}`);
  return targetUrl;
}

function pickHeaders(from: Headers) {
  const h = new Headers();
  FORWARD_HEADERS.forEach((k) => {
    const v = from.get(k);
    if (v) h.set(k, v);
  });
  return h;
}

async function proxy(req: NextRequest, method: string, ctx: { params: Promise<{ path: string[] }> }) {
  const url = await buildTargetURL(req, ctx.params);
  
  // Get JWT from cookie OR Authorization header (frontend uses header)
  const cookieJwt = req.cookies.get("strapi_jwt")?.value;
  const authHeader = req.headers.get("authorization");
  const headerJwt = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const jwt = headerJwt || cookieJwt;
  
  const init: RequestInit = {
    method,
    headers: {
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      // Forward JSON content-type only when sending a body
      ...(method === "POST" || method === "PUT" || method === "PATCH"
        ? { "Content-Type": req.headers.get("content-type") ?? "application/json" }
        : {}),
    },
    body:
      method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE"
        ? (await req.text()) || undefined // DELETE may have no body
        : undefined,
    // You can add keepalive or next: { revalidate: 0 } if needed
  };

  const r = await fetch(url, init);
  const headers = pickHeaders(r.headers);

  // No body allowed for 204/304 — return null body
  if (r.status === 204 || r.status === 304) {
    return new NextResponse(null, { status: r.status, headers });
  }

  // Stream through for everything else
  // If you prefer to buffer: const buf = await r.arrayBuffer();
  return new NextResponse(r.body, { status: r.status, headers });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, "GET", ctx);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, "POST", ctx);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, "PUT", ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, "PATCH", ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, "DELETE", ctx);
}
