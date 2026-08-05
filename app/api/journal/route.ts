import { addDays, plantSchedule } from "@/app/lib/plants";
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
    const payload = (await request.json()) as { body?: string; plantKey?: string | null };
    const body = payload.body?.trim() ?? "";
    if (!body) return Response.json({ error: "A journal note is required" }, { status: 400 });

    const db = getDb();
    const [entry] = await db.insert(journalEntries).values({ body, plantKey: payload.plantKey ?? null }).returning();
    const schedule = plantSchedule[payload.plantKey ?? ""];
    if (schedule) {
      await db.insert(reminders).values([
        { journalEntryId: entry.id, title: `Check soil around ${schedule.name.toLowerCase()}`, dueAt: addDays(1), kind: "water" },
        { journalEntryId: entry.id, title: `Check ${schedule.name.toLowerCase()} progress`, dueAt: addDays(7), kind: "care" },
        { journalEntryId: entry.id, title: `${schedule.name} may be ready to harvest`, dueAt: addDays(schedule.harvestDays), kind: "harvest" },
      ]);
    }
    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save the journal note" }, { status: 500 });
  }
}
