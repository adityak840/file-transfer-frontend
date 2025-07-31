// ==== FRONTEND (App.tsx) ====
import { useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import FileDropzone from "./components/FileDropzone";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ThemeToggle } from "./components/ThemeToggle";
import DeviceList from "./components/DeviceList";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";
import type {
  IncomingTransferPayload,
  ReceiveChunkPayload,
} from "./interfaces";

function App() {
  const [status, setStatus] = useState("Connecting...");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("My Device");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [receivedFiles, setReceivedFiles] = useState<
    { name: string; url: string }[]
  >([]);
  const [incomingFile, setIncomingFile] = useState<{
    name: string;
    chunks: BlobPart[];
    totalChunks: number;
  } | null>(null);
  const incomingFileRef = useRef<typeof incomingFile>(null);

  useEffect(() => {
    socket.connect();

    socket.binaryType = "arraybuffer";

    function onConnect() {
      setStatus("✅ Connected to server!");
      socket.emit("set-device-name", deviceName);
      socket.emit("join-receive-room");
    }

    function onDisconnect(reason: string) {
      setStatus("⚠️ Disconnected");
      console.warn("Disconnected. Reason:", reason);
    }

    function onConnectError(error: Error) {
      setStatus("❌ Connection failed");
      console.error("Connect error:", error.message);
    }

    function onError(err: Error) {
      console.error("Socket error:", err);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("error", onError);
    socket.on("incoming-transfer", ({ fileName }: IncomingTransferPayload) => {
      const newIncomingFile = { name: fileName, chunks: [], totalChunks: 0 };
      setIncomingFile(newIncomingFile);
      incomingFileRef.current = newIncomingFile;
      setDownloadProgress(0);
    });

    socket.on(
      "receive-chunk",
      ({ chunk, index, totalChunks }: ReceiveChunkPayload) => {
        if (incomingFileRef.current) {
          const updatedChunks = [...incomingFileRef.current.chunks];
          updatedChunks[index] = chunk;
          const newIncomingFile = {
            ...incomingFileRef.current,
            chunks: updatedChunks,
            totalChunks,
          };
          setIncomingFile(newIncomingFile);
          incomingFileRef.current = newIncomingFile;
          setDownloadProgress(Math.round(((index + 1) / totalChunks) * 100));
        }
      }
    );

    socket.on("transfer-complete", () => {
      if (
        incomingFileRef.current &&
        incomingFileRef.current.chunks.length ===
          incomingFileRef.current.totalChunks
      ) {
        const file = incomingFileRef.current;
        const blob = new Blob(file.chunks);
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { name: file.name, url }]);
        setIncomingFile(null);
        incomingFileRef.current = null;
        setDownloadProgress(100);
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("error", onError);
      socket.disconnect();
    };
  }, [deviceName]);

  const handleSelectDevice = (deviceId: string) => setSelectedDevice(deviceId);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDeviceName(e.target.value);
  const handleFilesSelected = (files: File[]) => setSelectedFiles(files);

  const handleSend = async () => {
    if (selectedFiles.length === 0 || !selectedDevice) {
      alert(
        selectedFiles.length === 0
          ? "No files selected!"
          : "Select a device first!"
      );
      return;
    }

    const file = selectedFiles[0];
    const CHUNK_SIZE = 256 * 1024; // 256KB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    socket.emit("start-transfer", {
      targetId: selectedDevice,
      fileName: file.name,
      fileSize: file.size,
    });

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = await file.slice(start, end).arrayBuffer();

      await new Promise<void>((resolve) => {
        socket.emit(
          "file-chunk",
          {
            targetId: selectedDevice,
            chunk: new Uint8Array(chunk),
            index: i,
            totalChunks,
          },
          () => resolve()
        );
      });

      setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
      await new Promise((res) => setTimeout(res, 10));
    }

    socket.emit("transfer-complete", { targetId: selectedDevice });
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">File Transfer App</h1>
        <ThemeToggle />
      </div>

      <p className="mb-4">Status: {status}</p>

      <div className="mb-4">
        <label htmlFor="device-name" className="block text-sm font-medium mb-1">
          Your Device Name
        </label>
        <Input
          id="device-name"
          value={deviceName}
          onChange={handleNameChange}
          placeholder="Enter a name"
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceList
            onSelectDevice={handleSelectDevice}
            selectedDevice={selectedDevice}
          />
        </CardContent>
      </Card>

      <FileDropzone onFilesSelected={handleFilesSelected} />

      {selectedFiles.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
            <Progress value={uploadProgress} className="mt-2" />
            <Button variant="outline" onClick={handleSend} className="mt-4">
              Send Files{" "}
              {selectedDevice ? `to ${selectedDevice.slice(0, 8)}` : ""}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Received Files</CardTitle>
        </CardHeader>
        <CardContent>
          {receivedFiles.length === 0 && !incomingFile ? (
            <p>No files received yet.</p>
          ) : (
            <>
              {incomingFile && (
                <Progress value={downloadProgress} className="mb-2" />
              )}
              <ul className="list-disc pl-5">
                {receivedFiles.map((file, index) => (
                  <li key={index}>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
