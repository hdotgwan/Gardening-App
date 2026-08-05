import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  body: text("body").notNull(),
  plantKey: text("plant_key"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id),
  title: text("title").notNull(),
  dueAt: text("due_at").notNull(),
  kind: text("kind").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const gardenPlans = sqliteTable("garden_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().default("My garden"),
  elements: text("elements").notNull().default("[]"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
