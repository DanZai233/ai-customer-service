import { openApiDocument } from "@/lib/public-api/openapi";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return Response.json({
    ...openApiDocument,
    servers: [{ url: origin, description: "当前部署" }],
  });
}
