import { openApiDocument } from "@/lib/public-api/openapi";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    requestUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    requestUrl.protocol.slice(0, -1);
  const origin = `${protocol}://${host}`;
  return Response.json({
    ...openApiDocument,
    servers: [{ url: origin, description: "当前部署" }],
  });
}
