import { getDb } from "@/db";
import { journalEntries, reminders } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const entries = await db.select().from(journalEntries).orderBy(desc(journalEntries.id)).limit(30);
    return Response.json({ entries });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load the journal" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { body?: string; plantKey?: string | null; tasks?: Array<{ title?: string; due?: string; kind?: string }> };
    const body = payload.body?.trim() ?? "";
    if (!body) return Response.json({ error: "A journal note is required" }, { status: 400 });

    const db = getDb();
    const [entry] = await db.insert(journalEntries).values({ body, plantKey: payload.plantKey ?? null }).returning();
    const planned = (payload.tasks ?? []).filter((item) => item.title?.trim() && item.due?.trim()).slice(0, 8);
    if (planned.length) {
      await db.insert(reminders).values(planned.map((item) => ({
        journalEntryId: entry.id,
        title: item.title!.trim(),
        dueAt: item.due!.trim(),
        kind: item.kind?.trim() || "journal",
      })));
    }
    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save the journal note" }, { status: 500 });
  }
}
