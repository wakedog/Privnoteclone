import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  encryptedContent: text("encrypted_content").notNull(),
  iv: text("iv").notNull(), // Initialization vector for encryption
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration time
  readOnce: integer("read_once").default(0).notNull(),
  passwordHash: text("password_hash"), // Optional password protection
  fileName: text("file_name"), // Optional file name for attachments
  fileType: text("file_type"), // MIME type of the attached file
  encryptedFile: text("encrypted_file"), // Base64 encoded encrypted file data
  fileIv: text("file_iv"), // Separate IV for file encryption
});

// Custom schema with date transformation and file handling
export const insertNoteSchema = createInsertSchema(notes, {
  expiresAt: z.string().nullable().transform((val) => val ? new Date(val) : null),
  fileName: z.string().nullable(),
  fileType: z.string().nullable(),
  encryptedFile: z.string().nullable(),
  fileIv: z.string().nullable()
});
export const selectNoteSchema = createSelectSchema(notes);
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = z.infer<typeof selectNoteSchema>;
