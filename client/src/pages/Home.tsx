import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generateKey, exportKey, encryptMessage, hashPassword } from "../lib/crypto";
import { Loader2 } from "lucide-react";

interface FormData {
  content: string;
  password?: string;
  expiresIn?: string;
}

export function Home() {
  const { toast } = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const createNote = useMutation({
    mutationFn: async (data: FormData) => {
      const key = await generateKey();
      const keyString = await exportKey(key);
      const { encrypted, iv } = await encryptMessage(data.content, key);

      const passwordHash = data.password ? await hashPassword(data.password) : null;
      let expiresAt = null;
      if (data.expiresIn) {
        const hours = parseInt(data.expiresIn);
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          encryptedContent: encrypted, 
          iv,
          passwordHash,
          expiresAt
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const { id } = await response.json();
      const noteUrl = `${window.location.origin}/note/${id}#${keyString}`;
      setUrl(noteUrl);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create encrypted note",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createNote.mutate(data);
  };

  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "The secure link has been copied to your clipboard",
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Secure Notes</h1>
        <p className="text-muted-foreground">
          Create encrypted notes that self-destruct after being read
        </p>
      </div>

      <Card className="p-6">
        {!url ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your secret message..."
                className="min-h-[200px]"
                {...register("content", { required: "Content is required" })}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Optional password protection"
                    className="w-full px-3 py-2 border rounded-md"
                    {...register("password")}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave blank for no password protection
                  </p>
                </div>
                <div className="space-y-2">
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    {...register("expiresIn")}
                  >
                    <option value="">Never expire</option>
                    <option value="1">1 hour</option>
                    <option value="24">24 hours</option>
                    <option value="72">3 days</option>
                    <option value="168">1 week</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Choose when the note should expire
                  </p>
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={createNote.isPending}
            >
              {createNote.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Secure Note
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all">
              <p className="text-sm font-mono">{url}</p>
            </div>
            <Button onClick={copyToClipboard} className="w-full">
              Copy Secure Link
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              This note will self-destruct after being read
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
