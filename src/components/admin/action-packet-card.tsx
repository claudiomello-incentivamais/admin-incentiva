import { useState } from "react";
import { Check, Copy, Send, SquareChartGantt, StickyNote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap = {
  discord: Send,
  trello: SquareChartGantt,
  admin: StickyNote,
} as const;

const toneMap = {
  discord: "text-[color:var(--color-info)] bg-[color:var(--color-info)]/10",
  trello: "text-[color:var(--color-warning)] bg-[color:var(--color-warning)]/10",
  admin: "text-[color:var(--color-success)] bg-[color:var(--color-success)]/10",
} as const;

export function ActionPacketCard({
  channel,
  title,
  detail,
  content,
  owner,
}: {
  channel: "discord" | "trello" | "admin";
  title: string;
  detail: string;
  content: string;
  owner: string;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = iconMap[channel];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error(error);
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("rounded-lg p-2", toneMap[channel])}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em]">
              {channel}
            </Badge>
            <Badge variant="secondary" className="text-[10px] text-mono h-5">
              {owner}
            </Badge>
          </div>

          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 gap-2 bg-background" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      <div className="mt-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
        <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-foreground font-sans">
          {content}
        </pre>
      </div>
    </div>
  );
}
