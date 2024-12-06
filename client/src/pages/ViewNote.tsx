import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { importKey, decryptMessage, hashPassword, decryptFile } from "../lib/crypto";
import { Loader2, ShieldAlert, Copy, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ViewNote() {
  const [match, params] = useRoute("/note/:id");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const fetchAndDecryptNote = async () => {
    try {
      if (!params?.id) return;
      
      const key = window.location.hash.slice(1);
      if (!key) {
        setError("Invalid decryption key");
        return;
      }

      const passwordHash = password ? await hashPassword(password) : null;
      const response = await fetch(`/api/notes/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ passwordHash })
      });
      if (!response.ok) {
        if (response.status === 404) {
          setError("This note has been deleted or does not exist");
        } else if (response.status === 401) {
          setNeedsPassword(true);
          setLoading(false);
          return;
        } else {
          setError("Failed to fetch note");
        }
        return;
      }

      const { encryptedContent, iv } = await response.json();
      const cryptoKey = await importKey(key);
      const decrypted = await decryptMessage(encryptedContent, iv, cryptoKey);
      setContent(decrypted);
      setNeedsPassword(false);
      setError(null);

      await fetch(`/api/notes/${params.id}/read`, {
        method: 'POST'
      });
    } catch (err) {
      setError("Failed to decrypt note");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndDecryptNote();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-10">
        <Card className="p-8 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95 transition-all duration-300 hover:shadow-lg hover:border-opacity-50 space-y-6">
          <h2 className="text-xl font-semibold text-center bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent">This note is password protected</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            fetchAndDecryptNote();
          }} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300 hover:bg-background/80 hover:border-primary/30 backdrop-blur-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock Note"
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto p-4 space-y-8">
        <Card className="p-6 text-center space-y-4 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95 transition-all duration-300">
          <ShieldAlert className="h-12 w-12 mx-auto text-destructive opacity-80" />
          <h2 className="text-xl font-semibold bg-gradient-to-r from-destructive/90 to-destructive/70 bg-clip-text text-transparent">{error}</h2>
          <Button onClick={() => window.location.href = "/"} className="bg-primary/90 hover:bg-primary transition-all duration-200">
            Create New Note
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
      <Card className="p-6 space-y-4 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95 transition-all duration-300 hover:shadow-lg hover:border-opacity-50">
        <div className="bg-muted/50 p-6 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-muted/70 shadow-sm hover:shadow-md border border-border/50 hover:border-border/70">
          <pre className="whitespace-pre-wrap break-words text-pretty leading-relaxed">{content}</pre>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            This note has been destroyed and cannot be accessed again
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-background/80 hover:bg-accent/80 transition-all duration-300 hover:shadow-md backdrop-blur-sm group"
              >
                <Share2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="sr-only">Share note</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 backdrop-blur-sm bg-background/95 border-opacity-50 shadow-lg animate-in fade-in-0 zoom-in-95"
            >
              <DropdownMenuItem 
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this secure note!')}`, '_blank');
                }}
                className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/80 focus:bg-accent/80"
              >
                <Twitter className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/80 focus:bg-accent/80"
              >
                <Facebook className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/80 focus:bg-accent/80"
              >
                <Linkedin className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied!",
                    description: "The note link has been copied to your clipboard",
                  });
                }}
                className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/80 focus:bg-accent/80"
              >
                <Copy className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button 
          onClick={() => window.location.href = "/"} 
          className="w-full transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-primary/90 via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary backdrop-blur-sm"
        >
          Create New Note
        </Button>
      </Card>
    </div>
  );
}
