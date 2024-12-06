import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generateKey, exportKey, encryptMessage, hashPassword } from "../lib/crypto";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Loader2, Share2, Copy, Twitter, Facebook, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      try {
        const key = await generateKey();
        const keyString = await exportKey(key);
        const { encrypted, iv } = await encryptMessage(data.content, key);
        
        const passwordHash = data.password ? await hashPassword(data.password) : null;
        let expiresAt = null;
        if (data.expiresIn) {
          const hours = parseInt(data.expiresIn);
          expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        }

        const requestBody = { 
          encryptedContent: encrypted, 
          iv,
          passwordHash,
          expiresAt,
        };
        
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create note");
        }

        const { id } = await response.json();
        const noteUrl = `${window.location.origin}/note/${id}#${keyString}`;
        setUrl(noteUrl);
        return noteUrl;
      } catch (error: any) {
        console.error("Error creating note:", error);
        throw error;
      }
    },
    onError: (error: any) => {
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

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-10">
      <header className="relative flex flex-col items-center justify-center mb-16 px-6 py-12 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none"></div>
        <div className="relative text-center space-y-6 max-w-2xl mx-auto">
          <h1 className="text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent transition-all duration-500 hover:to-primary/80 animate-gradient">
            Secure Notes
          </h1>
          <p className="text-muted-foreground text-xl font-light leading-relaxed max-w-lg mx-auto">
            Create encrypted notes that self-destruct after being read
          </p>
        </div>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </header>

      <Card className="p-8 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95 transition-all duration-300 hover:shadow-lg hover:border-opacity-50">
        {!url ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your secret message..."
                className="min-h-[200px] transition-all duration-300 shadow-sm focus:shadow-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/30 bg-background/50 hover:bg-background/80 backdrop-blur-sm resize-none rounded-lg border-opacity-50 hover:border-opacity-70 placeholder:text-muted-foreground/70"
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
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300 hover:bg-background/80 hover:border-primary/30 backdrop-blur-sm"
                    {...register("password")}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave blank for no password protection
                  </p>
                </div>
                <div className="space-y-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300 hover:bg-background/80 hover:border-primary/30 backdrop-blur-sm"
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
              className="w-full transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-primary/90 via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary backdrop-blur-sm"
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
            <div className="flex items-center gap-2 mt-4">
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast({
                    title: "Copied!",
                    description: "The secure link has been copied to your clipboard",
                  });
                }} 
                className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
              >
                <Copy className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                Copy Secure Link
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-background/80 hover:bg-accent/80 transition-all duration-300 hover:shadow-md backdrop-blur-sm group"
                  >
                    <Share2 className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 backdrop-blur-sm bg-background/95 border-opacity-50 shadow-lg animate-in fade-in-0 zoom-in-95"
                >
                  <DropdownMenuItem 
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this secure note!')}`, '_blank');
                    }}
                    className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/80 focus:bg-accent/80"
                  >
                    <Twitter className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/80 focus:bg-accent/80"
                  >
                    <Facebook className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/80 focus:bg-accent/80"
                  >
                    <Linkedin className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    Share on LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              This note will self-destruct after being read
            </p>
          </div>
        )}
      </Card>
      <footer className="text-center text-sm text-muted-foreground space-y-3">
        <div>
          <a 
            href="https://github.com/wakedog/Privnoteclone" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
        <div className="px-4 py-2 rounded-lg bg-accent/10">Version 1.0.0</div>
      </footer>
    </div>
  );
}