import { useEffect, useState } from "react";
import { socket } from "./socket";
import FileDropzone from "./components/FileDropzone";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ThemeToggle } from "./components/ThemeToggle";
import DeviceList from "./components/DeviceList";
import { Input } from "./components/ui/input";

function App() {
  const [status, setStatus] = useState<string>("Connecting...");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>("My Device");

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setStatus("✅ Connected to server!");
      console.log("Connected with socket ID:", socket.id);
      socket.emit("set-device-name", deviceName);
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

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("error", onError);
      socket.disconnect();
    };
  }, [deviceName]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleSend = () => {
    if (selectedFiles.length > 0 && selectedDevice) {
      console.log(`Sending files to ${selectedDevice}:`, selectedFiles);
      setSelectedFiles([]);
    } else {
      alert(
        selectedFiles.length === 0
          ? "No files selected!"
          : "Select a device first!"
      );
    }
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceName(e.target.value);
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
            <Button onClick={handleSend} className="mt-4">
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
          <p>No files received yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
