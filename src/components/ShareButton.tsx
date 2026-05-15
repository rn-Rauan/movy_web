import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  text?: string;
  url: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  className?: string;
};

export function ShareButton({
  title,
  text,
  url,
  variant = "outline",
  size = "sm",
  label = "Compartilhar",
  className,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    const nav = typeof navigator !== "undefined" ? navigator : undefined;

    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({ title, text, url: absoluteUrl });
        return;
      } catch (err) {
        const aborted = err instanceof Error && err.name === "AbortError";
        if (aborted) return;
      }
    }

    try {
      await nav?.clipboard?.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleShare} className={className} type="button">
      {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Share2 className="h-4 w-4 mr-1.5" />}
      {label}
    </Button>
  );
}
