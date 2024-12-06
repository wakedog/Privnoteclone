import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { importKey, decryptMessage, hashPassword, decryptFile } from "../lib/crypto";
import { Loader2, ShieldAlert } from "lucide-react";

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
      
      // Get the key from URL fragment
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
      setNeedsPassword(false); // Clear password requirement after successful decryption
      setError(null); // Clear any previous errors

      // Mark the note as read
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-10">
        <Card className="p-8 shadow-lg border-opacity-50 backdrop-blur-sm space-y-6">
          <h2 className="text-xl font-semibold text-center">This note is password protected</h2>
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <Card className="p-6 text-center space-y-4">
          <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">{error}</h2>
          <Button onClick={() => window.location.href = "/"}>
            Create New Note
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
      <Card className="p-6 space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          This note has been destroyed and cannot be accessed again
        </div>
        <Button onClick={() => window.location.href = "/"} className="w-full">
          Create New Note
        </Button>
      </Card>
    </div>
  );
}
