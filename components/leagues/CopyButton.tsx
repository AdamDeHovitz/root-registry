"use client";

import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      Copy
    </Button>
  );
}
