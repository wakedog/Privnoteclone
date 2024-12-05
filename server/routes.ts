import type { Express } from "express";
import { db } from "../db";
import { notes } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Create a new note
  app.post("/api/notes", async (req, res) => {
    try {
      const { encryptedContent, iv } = req.body;
      
      if (!encryptedContent || !iv) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [note] = await db.insert(notes)
        .values({
          encryptedContent,
          iv,
        })
        .returning({ id: notes.id });

      res.json({ id: note.id });
    } catch (error) {
      console.error("Failed to create note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  // Fetch and delete a note
  app.get("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // First fetch the note
      const [note] = await db.select()
        .from(notes)
        .where(eq(notes.id, parseInt(id, 10)));

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (note.readOnce === 1) {
        return res.status(404).json({ error: "Note has already been read" });
      }

      // Mark as read
      await db.update(notes)
        .set({ readOnce: 1 })
        .where(eq(notes.id, note.id));

      // Return the encrypted content
      res.json({
        encryptedContent: note.encryptedContent,
        iv: note.iv,
      });

      // Delete the note after sending the response
      res.on('finish', async () => {
        try {
          // Give client some time to render the content
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds delay
          await db.delete(notes).where(eq(notes.id, note.id));
        } catch (error) {
          console.error("Failed to delete note:", error);
        }
      });

    } catch (error) {
      console.error("Failed to fetch note:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });
}
