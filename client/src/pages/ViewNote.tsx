import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { importKey, decryptMessage } from "../lib/crypto";
import { Loader2, ShieldAlert } from "lucide-react";

export function ViewNote() {
  const [match, params] = useRoute("/note/:id");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndDecryptNote = async () => {
      try {
        if (!params?.id) return;
        
        // Get the key from URL fragment
        const key = window.location.hash.slice(1);
        if (!key) {
          setError("Invalid decryption key");
          return;
        }

        const response = await fetch(`/api/notes/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("This note has been deleted or does not exist");
          } else {
            setError("Failed to fetch note");
          }
          return;
        }

        const { encryptedContent, iv } = await response.json();
        const cryptoKey = await importKey(key);
        const decrypted = await decryptMessage(encryptedContent, iv, cryptoKey);
        setContent(decrypted);
      } catch (err) {
        setError("Failed to decrypt note");
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecryptNote();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
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
