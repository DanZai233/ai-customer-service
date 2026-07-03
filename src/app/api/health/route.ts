export async function GET() {
  return Response.json({
    status: "ok",
    aiMode:
      process.env.AI_BASE_URL && process.env.AI_API_KEY && process.env.AI_MODEL
        ? "provider"
        : "demo",
    timestamp: new Date().toISOString(),
  });
}
