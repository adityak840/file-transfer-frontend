import { useState } from "react";
import { Input } from "./ui/input";
import type { ChangeEvent, DragEvent } from "react";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

function FileDropzone({ onFilesSelected }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <p className="mb-4">Drag & drop files here or</p>
      <label
        htmlFor="file-input"
        className="cursor-pointer text-blue-600 hover:underline"
      >
        click to select
      </label>
      <Input
        id="file-input"
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default FileDropzone;
