"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, X } from "lucide-react";
import { createWorker } from "tesseract.js";
import { parseOCRText } from "@/lib/ocr/parser";

interface OCRUploadProps {
  onOCRComplete: (data: { map?: string; players: Array<{ faction: string; score?: number }> }) => void;
}

export function OCRUpload({ onOCRComplete }: OCRUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB");
      return;
    }

    setError("");
    setIsProcessing(true);
    setProgress(0);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Initialize Tesseract worker
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Perform OCR
      const {
        data: { text },
      } = await worker.recognize(file);

      await worker.terminate();

      // Parse the OCR text
      const parsed = parseOCRText(text);

      // Pass the parsed data to parent
      onOCRComplete(parsed);

      setIsProcessing(false);
    } catch (err) {
      console.error("OCR error:", err);
      setError("Failed to process image. Please try again or enter data manually.");
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setProgress(0);
    setError("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Game Screenshot (Optional)</CardTitle>
        <CardDescription>Upload a photo of the final scores to auto-fill the form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!preview ? (
          <div>
            <Label
              htmlFor="ocr-upload"
              className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
            </Label>
            <input
              id="ocr-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={preview}
                alt="Game screenshot"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
              {!isProcessing && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearImage}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Processing image... {progress}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Tip: For best results, ensure the image is clear and the text is readable. You can review
          and edit the auto-filled data before submitting.
        </p>
      </CardContent>
    </Card>
  );
}
