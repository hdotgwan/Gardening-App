import { getDb } from "@/db";
import { gardenPlans } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const [plan] = await db.select().from(gardenPlans).orderBy(desc(gardenPlans.id)).limit(1);
    return Response.json({ plan: plan ?? null });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load the garden plan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as { id?: number; elements?: unknown[] };
    const elements = JSON.stringify(payload.elements ?? []);
    const db = getDb();
    if (payload.id) {
      const [plan] = await db.update(gardenPlans).set({ elements, updatedAt: new Date().toISOString() }).where(eq(gardenPlans.id, payload.id)).returning();
      return Response.json({ plan });
    }
    const [plan] = await db.insert(gardenPlans).values({ elements }).returning();
    return Response.json({ plan }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save the garden plan" }, { status: 500 });
  }
}
