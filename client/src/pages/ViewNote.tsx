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
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="p-6 space-y-4 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95">
          <div className="flex items-center justify-center min-h-[200px] bg-muted/50 rounded-lg backdrop-blur-sm border border-border/50 transition-all duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full"></div>
              <Loader2 className="relative h-8 w-8 animate-spin text-primary opacity-80" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 w-48 bg-muted/70 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted/70 rounded-md animate-pulse"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-10">
        <Card className="p-8 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95 transition-all duration-300 hover:shadow-lg hover:border-opacity-50">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full"></div>
                <div className="relative flex items-center justify-center w-full h-full">
                  <svg className="w-8 h-8 text-primary/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 10V14M12 21H5C3.89543 21 3 20.1046 3 19V14C3 12.8954 3.89543 12 5 12H19C20.1046 12 21 12.8954 21 14V19C21 20.1046 20.1046 21 19 21H12ZM12 21V14M8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V12H8V7Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent animate-gradient">Password Protected Note</h2>
              <p className="text-muted-foreground/90">Enter the password to view this secure note</p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                fetchAndDecryptNote();
              }} 
              className="space-y-6 animate-in slide-in-from-bottom-2 duration-500"
            >
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
              <Button 
                type="submit" 
                className="w-full transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-primary/90 via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary backdrop-blur-sm"
                disabled={loading}
              >
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
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="p-8 text-center space-y-6 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95 transition-all duration-300 hover:shadow-lg">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full"></div>
            <ShieldAlert className="relative h-16 w-16 mx-auto text-destructive opacity-90 animate-in fade-in-0 zoom-in-95 duration-500 hover:scale-105 transition-transform" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-destructive via-destructive/90 to-destructive/70 bg-clip-text text-transparent animate-in slide-in-from-bottom-2 duration-500 animate-gradient">{error}</h2>
            <p className="text-muted-foreground/90 animate-in slide-in-from-bottom-3 duration-500">The note may have been deleted or accessed already.</p>
          </div>
          <Button 
            onClick={() => window.location.href = "/"} 
            className="transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-primary/90 via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500"
          >
            Create New Note
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
      <Card className="p-8 space-y-6 shadow-xl border-opacity-40 backdrop-blur-sm bg-gradient-to-b from-card to-card/95 transition-all duration-300 hover:shadow-lg hover:border-opacity-50">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="bg-muted/50 p-8 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-muted/70 shadow-sm hover:shadow-md border border-border/50 hover:border-border/70 group">
            <pre className="whitespace-pre-wrap break-words text-pretty leading-relaxed transition-all duration-300 group-hover:scale-[1.01]">{content}</pre>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/90">
            <svg className="w-4 h-4 text-primary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M12 15V17M7 21H17C18.1046 21 19 20.1046 19 19V13C19 11.8954 18.1046 11 17 11H7C5.89543 11 5 11.8954 5 13V19C5 20.1046 5.89543 21 7 21Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            This note has been destroyed and cannot be accessed again
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="relative bg-background/80 hover:bg-accent/80 transition-all duration-300 hover:shadow-md backdrop-blur-sm group"
              >
                <div className="absolute inset-0 bg-primary/5 rounded-md blur group-hover:bg-primary/10 transition-colors duration-300"></div>
                <Share2 className="relative h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
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
                className="group flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-accent/80 focus:bg-accent/80 hover:pl-4"
              >
                <Twitter className="h-4 w-4 transition-all duration-300 group-hover:scale-110 text-primary/70 group-hover:text-primary" />
                <span className="transition-colors duration-300 group-hover:text-primary">Share on Twitter</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="group flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-accent/80 focus:bg-accent/80 hover:pl-4"
              >
                <Facebook className="h-4 w-4 transition-all duration-300 group-hover:scale-110 text-primary/70 group-hover:text-primary" />
                <span className="transition-colors duration-300 group-hover:text-primary">Share on Facebook</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="group flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-accent/80 focus:bg-accent/80 hover:pl-4"
              >
                <Linkedin className="h-4 w-4 transition-all duration-300 group-hover:scale-110 text-primary/70 group-hover:text-primary" />
                <span className="transition-colors duration-300 group-hover:text-primary">Share on LinkedIn</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied!",
                    description: "The note link has been copied to your clipboard",
                  });
                }}
                className="group flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-accent/80 focus:bg-accent/80 hover:pl-4"
              >
                <Copy className="h-4 w-4 transition-all duration-300 group-hover:scale-110 text-primary/70 group-hover:text-primary" />
                <span className="transition-colors duration-300 group-hover:text-primary">Copy Link</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button 
          onClick={() => window.location.href = "/"} 
          className="group w-full transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-primary/90 via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary backdrop-blur-sm"
        >
          <span className="relative inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
            Create New Note
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m-8-8h16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </Button>
      </Card>
    </div>
  );
}
