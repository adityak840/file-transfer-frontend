import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface SelectedFilesCardProps {
  selectedFiles: File[];
  uploadProgress: number;
  onSend: () => void;
  selectedDeviceName: string;
}

export default function SelectedFilesCard({
  selectedFiles,
  uploadProgress,
  onSend,
  selectedDeviceName,
}: SelectedFilesCardProps) {
  if (selectedFiles.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Selected Files</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5">
          {selectedFiles.map((file, idx) => (
            <li key={idx}>
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </li>
          ))}
        </ul>
        <Progress value={uploadProgress} className="mt-2" />
        <Button variant="outline" onClick={onSend} className="mt-4">
          Send Files {selectedDeviceName ? `to ${selectedDeviceName}` : ""}
        </Button>
      </CardContent>
    </Card>
  );
}
