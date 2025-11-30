"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, X } from "lucide-react";
import { fileToBase64 } from "@/lib/ocr/gemini-vision";

interface OCRUploadProps {
  onOCRComplete: (data: {
    map?: string;
    players: Array<{
      playerName?: string;
      faction: string;
      score?: number;
      isWinner?: boolean;
      isDominance?: boolean;
      order?: number;
    }>;
  }) => void;
}

export function OCRUpload({ onOCRComplete }: OCRUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions (max 1920px on longest side)
          const MAX_SIZE = 1920;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }

          // Create canvas and compress
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            "image/jpeg",
            0.85 // 85% quality
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError("");
    setIsProcessing(true);

    // Create preview from original file
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Compress image before uploading
    let processedFile = file;
    try {
      processedFile = await compressImage(file);
    } catch (compressionError) {
      console.warn("Image compression failed, using original:", compressionError);
      // Continue with original file if compression fails
    }

    try {
      // Convert compressed image to base64
      const base64Data = await fileToBase64(processedFile);

      // Send to Gemini Vision API
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          mimeType: "image/jpeg", // Always JPEG after compression
        }),
      });

      // Try to parse response as JSON, fallback to text if it fails
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // Response is not JSON, try to get text for better error message
        const errorText = await response.text();
        throw new Error(errorText || `Server returned ${response.status} ${response.statusText}`);
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "OCR processing failed");
      }

      // Pass the parsed data to parent
      onOCRComplete(result.data);

      setIsProcessing(false);
    } catch (err) {
      console.error("OCR error:", err);
      setError(err instanceof Error ? err.message : "Failed to process image. Please try again or enter data manually.");
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
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
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Processing image with AI vision...
                </span>
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
