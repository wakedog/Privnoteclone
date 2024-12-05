import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { notes, insertNoteSchema } from "@db/schema";
import { z } from "zod";

export const router = Router();

// Create a new note
router.post("/api/notes", async (req, res) => {
  try {
    const noteData = insertNoteSchema.parse(req.body);
    const [note] = await db.insert(notes).values(noteData).returning({ id: notes.id });
    res.json({ id: note.id });
  } catch (error) {
    console.error("Failed to create note:", error);
    res.status(400).json({ error: "Invalid note data" });
  }
});

// Get a note by ID
router.get("/api/notes/:id", async (req, res) => {
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

    // Return the encrypted content
    res.json({
      encryptedContent: note.encryptedContent,
      iv: note.iv,
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