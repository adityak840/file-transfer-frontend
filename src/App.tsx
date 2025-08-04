import { Toaster } from "sonner";
import DeviceList from "./components/DeviceList";
import FileDropzone from "./components/FileDropzone";
import SelectedFilesCard from "./components/SelectedFilesCard";
import ReceivedFilesCard from "./components/ReceivedFilesCard";
import { ThemeToggle } from "./components/ThemeToggle";
import useFileTransferSocket from "./hooks/useFileTransferSocket";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import IncomingTransferDialog from "./components/IncomingFileTransfer";

function App() {
  const {
    devices,
    selectedDevice,
    setSelectedDevice,
    deviceName,
    setDeviceName,
    selectedFiles,
    setSelectedFiles,
    uploadProgress,
    downloadProgress,
    receivedFiles,
    incomingFile,
    isDialogOpen,
    pendingTransfer,
    senderDeviceName,
    handleAccept,
    handleReject,
    handleSend,
    status,
  } = useFileTransferSocket();

  return (
    <div className="flex flex-col h-screen overflow-auto p-6">
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
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="Enter a name"
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceList
            devices={devices}
            onSelectDevice={setSelectedDevice}
            selectedDevice={selectedDevice}
          />
        </CardContent>
      </Card>

      <FileDropzone onFilesSelected={setSelectedFiles} />

      <SelectedFilesCard
        selectedFiles={selectedFiles}
        uploadProgress={uploadProgress}
        onSend={handleSend}
        selectedDeviceName={
          devices.find((d) => d.id === selectedDevice)?.name || ""
        }
      />

      <ReceivedFilesCard
        receivedFiles={receivedFiles}
        incomingFile={incomingFile}
        downloadProgress={downloadProgress}
      />

      <IncomingTransferDialog
        open={isDialogOpen}
        pendingTransfer={pendingTransfer}
        onAccept={handleAccept}
        onReject={handleReject}
        senderDeviceName={senderDeviceName}
      />

      <Toaster />
    </div>
  );
}

export default App;
