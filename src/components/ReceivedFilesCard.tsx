import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface ReceivedFilesCardProps {
  receivedFiles: { name: string; url: string }[];
  incomingFile: {
    name: string;
    chunks: BlobPart[];
    totalChunks: number;
  } | null;
  downloadProgress: number;
}

export default function ReceivedFilesCard({
  receivedFiles,
  incomingFile,
  downloadProgress,
}: ReceivedFilesCardProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Received Files</CardTitle>
      </CardHeader>
      <CardContent>
        {incomingFile && <Progress value={downloadProgress} className="mb-2" />}
        {receivedFiles.length === 0 && !incomingFile ? (
          <p className="text-sm text-gray-500">No files received yet.</p>
        ) : (
          <ul className="list-disc pl-5">
            {receivedFiles.map((file, idx) => (
              <li key={idx}>
                <a
                  href={file.url}
                  download={file.name}
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
