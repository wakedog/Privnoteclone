import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  encryptedContent: text("encrypted_content").notNull(),
  iv: text("iv").notNull(), // Initialization vector for encryption
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readOnce: integer("read_once").default(0).notNull(),
});

export const insertNoteSchema = createInsertSchema(notes);
export const selectNoteSchema = createSelectSchema(notes);
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = z.infer<typeof selectNoteSchema>;
