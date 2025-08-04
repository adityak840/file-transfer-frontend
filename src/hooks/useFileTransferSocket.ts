import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import type {
  IncomingTransferPayload,
  ReceiveChunkPayload,
} from "../interfaces";
import { toast } from "sonner";

export interface Device {
  id: string;
  name?: string;
}

export default function useFileTransferSocket() {
  const [status, setStatus] = useState("Connecting...");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("My Device");
  const [devices, setDevices] = useState<Device[]>([]);
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
  const incomingFileRef = useRef(incomingFile);
  const selectedFilesRef = useRef<File[]>([]);
  const selectedDeviceRef = useRef<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{
    senderId: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const senderDeviceName = pendingTransfer
    ? devices.find((d) => d.id === pendingTransfer.senderId)?.name ||
      "Unnamed Device"
    : "";

  useEffect(() => {
    incomingFileRef.current = incomingFile;
  }, [incomingFile]);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    selectedDeviceRef.current = selectedDevice;
  }, [selectedDevice]);

  // Accept transfer handler
  const handleAccept = () => {
    if (pendingTransfer) {
      socket.emit("transfer-accepted", { senderId: pendingTransfer.senderId });
      setIsDialogOpen(false);
      setPendingTransfer(null);
      toast.success("Transfer accepted");
    }
  };

  // Reject transfer handler
  const handleReject = () => {
    if (pendingTransfer) {
      socket.emit("transfer-rejected", { senderId: pendingTransfer.senderId });
      setIsDialogOpen(false);
      setPendingTransfer(null);
      toast.error("Transfer rejected");
    }
  };

  // Handle file send logic
  const handleSend = () => {
    if (selectedFiles.length === 0 || !selectedDevice) {
      alert(
        selectedFiles.length === 0
          ? "No files selected!"
          : "Select a device first!"
      );
      return;
    }

    const file = selectedFiles[0];

    socket.emit("request-transfer", {
      targetId: selectedDevice,
      fileName: file.name,
      fileSize: file.size,
    });

    toast("Transfer request sent to recipient...");
  };

  const sendFileChunks = useCallback(async () => {
    const currentFiles = selectedFilesRef.current;
    const currentDevice = selectedDeviceRef.current;

    if (currentFiles.length === 0 || !currentDevice) {
      alert(
        currentFiles.length === 0
          ? "No files selected!"
          : "Select a device first!"
      );
      return;
    }

    const file = currentFiles[0];
    const CHUNK_SIZE = 256 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    socket.emit("start-transfer", {
      targetId: currentDevice,
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
            targetId: currentDevice,
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

    socket.emit("transfer-complete", { targetId: currentDevice });
    setSelectedFiles([]);
    setUploadProgress(0);
  }, []);

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
      toast.error(err.message || "Socket error occurred");
    }

    socket.on("device-list", (devList: Device[]) => {
      setDevices(devList.filter((d) => d.id !== socket.id));
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("error", onError);

    socket.on(
      "incoming-transfer",
      ({ senderId, fileName, fileSize }: IncomingTransferPayload) => {
        setPendingTransfer({ senderId, fileName, fileSize });
        setIsDialogOpen(true);
        toast(`Incoming file: ${fileName}`, { duration: 4000 });
      }
    );

    socket.on("transfer-started", ({ fileName }: IncomingTransferPayload) => {
      const newIncomingFile = { name: fileName, chunks: [], totalChunks: 0 };
      setIncomingFile(newIncomingFile);
      incomingFileRef.current = newIncomingFile;
      setDownloadProgress(0);
    });

    socket.on("transfer-accepted", () => {
      toast.success("Recipient accepted the transfer. Sending file...");
      sendFileChunks();
    });

    socket.on("transfer-rejected", () => {
      toast.error("Recipient rejected the transfer.");
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
        toast.success("File received successfully");
      }
    });

    return () => {
      socket.off("device-list");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("error", onError);
      socket.off("incoming-transfer");
      socket.off("receive-chunk");
      socket.off("transfer-complete");
      socket.off("transfer-accepted");
      socket.off("transfer-rejected");
      socket.disconnect();
    };
  }, [deviceName, sendFileChunks]);

  return {
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
  };
}
