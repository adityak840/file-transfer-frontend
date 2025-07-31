import { useEffect, useState } from "react";
import { socket } from "./socket"; // Import from the new socket.ts

function App() {
  const [status, setStatus] = useState<string>("Connecting...");

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      setStatus("✅ Connected to server!");
      console.log("Connected with socket ID:", socket.id);
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
  }, []);

  return (
    <div>
      <h1>File Transfer App</h1>
      <p>Status: {status}</p>
    </div>
  );
}

export default App;
