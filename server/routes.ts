import { Router, json } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { notes, insertNoteSchema } from "@db/schema";
import { z } from "zod";

export const router = Router();

// Custom error handling middleware for payload size errors
router.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && err.status === 413) {
    return res.status(413).json({
      error: "Request payload too large",
      details: "The uploaded file exceeds the size limit"
    });
  }
  next(err);
});

// Increase JSON payload limit for file uploads
router.use(json({
  limit: '50mb',
  verify: (req: any, res: any, buf: Buffer) => {
    if (buf.length > 50 * 1024 * 1024) {
      throw new Error("Payload too large");
    }
  }
}));

// Add request size logging middleware
router.use((req, res, next) => {
  const contentLength = req.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength) / 1024 / 1024;
    console.log(`Request size: ${size.toFixed(2)} MB`);
    if (size > 50) {
      return res.status(413).json({
        error: "Request payload too large",
        details: `File size (${size.toFixed(2)}MB) exceeds the 50MB limit`
      });
    }
  }
  next();
});

// Create a new note
router.post("/api/notes", async (req, res) => {
  try {
    console.log("Received note data:", JSON.stringify(req.body, null, 2));
    const noteData = insertNoteSchema.parse(req.body);
    console.log("Parsed note data:", JSON.stringify(noteData, null, 2));
    const [note] = await db.insert(notes).values(noteData).returning({ id: notes.id });
    res.json({ id: note.id });
  } catch (error) {
    console.error("Failed to create note:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
      res.status(400).json({ error: "Invalid note data", details: error.errors });
    } else {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ error: errorMessage });
    }
  }
});

// Get a note by ID
router.post("/api/notes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const note = await db.query.notes.findFirst({
      where: eq(notes.id, id),
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.readOnce === 1) {
      return res.status(404).json({ error: "Note has already been read" });
    }

    // Check if note has expired
    if (note.expiresAt && new Date(note.expiresAt) < new Date()) {
      // Delete expired note
      await db.delete(notes).where(eq(notes.id, id));
      return res.status(404).json({ error: "This note has expired" });
    }

    // Check password if note is password protected
    if (note.passwordHash) {
      const providedHash = req.body.passwordHash;
      if (!providedHash || providedHash !== note.passwordHash) {
        return res.status(401).json({ error: "Password required or incorrect" });
      }
    }

    // Return the encrypted content
    res.json({
      encryptedContent: note.encryptedContent,
      iv: note.iv
    });

  } catch (error) {
    console.error("Failed to fetch note:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark note as read and schedule deletion
router.post("/api/notes/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const note = await db.query.notes.findFirst({
      where: eq(notes.id, id),
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.readOnce === 1) {
      return res.status(404).json({ error: "Note has already been read" });
    }

    // Mark as read
    await db.update(notes)
      .set({ readOnce: 1 })
      .where(eq(notes.id, id));

    // Schedule deletion after 1 minute
    setTimeout(async () => {
      try {
        await db.delete(notes).where(eq(notes.id, id));
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }, 60000);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to mark note as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export const registerRoutes = (app: Router) => {
  app.use(router);
};
