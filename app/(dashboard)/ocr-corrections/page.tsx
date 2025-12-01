import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { getAllOCRCorrections } from "@/lib/db/queries/games";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OCRCorrectionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const corrections = await getAllOCRCorrections();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">OCR Corrections Log</h1>
        <p className="text-muted-foreground">
          Track and analyze AI parsing corrections to improve accuracy
        </p>
      </div>

      {corrections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No OCR corrections logged yet. Corrections are logged when users modify AI-parsed game data.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Total corrections: {corrections.length}
          </div>

          {corrections.map(({ correction, game }) => (
            <Card key={correction.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Game: {game?.map || "Unknown"} - {game?.date ? new Date(game.date).toLocaleDateString() : "Unknown date"}
                </CardTitle>
                <CardDescription>
                  Corrected on {new Date(correction.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Fields Changed ({correction.fieldsChanged.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {correction.fieldsChanged.map((field, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 text-xs rounded bg-destructive/10 text-destructive"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Original (AI Parsed)</h3>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                      {JSON.stringify(correction.originalData, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Corrected (User Edited)</h3>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                      {JSON.stringify(correction.correctedData, null, 2)}
                    </pre>
                  </div>
                </div>

                {correction.imageUrl && (
                  <div>
                    <h3 className="font-semibold mb-2">Source Image</h3>
                    <div className="relative w-full max-w-2xl">
                      <img
                        src={correction.imageUrl}
                        alt="Game screenshot"
                        className="w-full rounded border"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
