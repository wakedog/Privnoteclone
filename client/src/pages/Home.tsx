import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generateKey, exportKey, encryptMessage, hashPassword, encryptFile } from "../lib/crypto";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Loader2 } from "lucide-react";

interface FormData {
  content: string;
  password?: string;
  expiresIn?: string;
  
}

interface CreateNoteData {
  encryptedContent: string;
  iv: string;
  passwordHash: string | null;
  expiresAt: string | null;
  fileName: string | null;
  fileType: string | null;
  encryptedFile: string | null;
  fileIv: string | null;
}

export function Home() {
  const { toast } = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const createNote = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        const key = await generateKey();
        const keyString = await exportKey(key);
        const { encrypted, iv } = await encryptMessage(data.content, key);
        
        let encryptedFile = null;
        let fileIv = null;
        let fileName = null;
        let fileType = null;

        

        const passwordHash = data.password ? await hashPassword(data.password) : null;
        let expiresAt = null;
        if (data.expiresIn) {
          const hours = parseInt(data.expiresIn);
          expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        }

        console.log("Preparing to send data to server");
        const requestBody = { 
          encryptedContent: encrypted, 
          iv,
          passwordHash,
          expiresAt,
          
        };
        console.log("Request payload size:", new Blob([JSON.stringify(requestBody)]).size);
        console.log("Request payload size:", new Blob([JSON.stringify(requestBody)]).size);
        
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server response:", errorData);
          throw new Error(errorData.error || "Failed to create note");
        }

        const { id } = await response.json();
        const noteUrl = `${window.location.origin}/note/${id}#${keyString}`;
        setUrl(noteUrl);
        return noteUrl;
      } catch (error) {
        console.error("Error creating note:", error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error("Detailed error:", error);
      const errorMessage = error?.message || "Failed to create encrypted note";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
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
    <div className="container max-w-2xl mx-auto p-6 space-y-10">
      <header className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Secure Notes</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Create encrypted notes that self-destruct after being read
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <Card className="p-8 shadow-lg border-opacity-50 backdrop-blur-sm">
        {!url ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your secret message..."
                className="min-h-[200px] transition-all duration-200 focus:shadow-lg"
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
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 hover:bg-background/80"
                    {...register("password")}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave blank for no password protection
                  </p>
                </div>
                <div className="space-y-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 hover:bg-background/80"
                    {...register("expiresIn")}
                    defaultValue=""
                  >
                    <option value="">Never expire</option>
                    <option value="1">1 hour</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                    <option value="72">3 days</option>
                    <option value="168">1 week</option>
                    <option value="720">30 days</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Choose when the note should expire
                  </p>
                </div>
              </div>
              
            </div>
            <Button 
              type="submit" 
              className="w-full transition-all duration-200 hover:shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
      <footer className="text-center text-sm text-muted-foreground space-y-2">
        <div>
          <a 
            href="https://github.com/wakedog/Privnoteclone" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View on GitHub
          </a>
        </div>
        <div>Version 1.0.0</div>
      </footer>
    </div>
  );
}
