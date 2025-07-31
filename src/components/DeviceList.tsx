import { useEffect, useState } from "react";
import { socket } from "../socket";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";

interface Device {
  id: string;
  name?: string;
}

interface DeviceListProps {
  onSelectDevice: (deviceId: string) => void;
  selectedDevice: string | null;
}

function DeviceList({ onSelectDevice, selectedDevice }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    // Listen for device list updates
    socket.on("device-list", (deviceList: Device[]) => {
      setDevices(deviceList.filter((d) => d.id !== socket.id)); // Exclude self
    });

    return () => {
      socket.off("device-list");
    };
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              <p className="h-10 flex items-center justify-center">
                No devices connected
              </p>
            </TableCell>
          </TableRow>
        ) : (
          devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>{device.name || "Unnamed"}</TableCell>
              <TableCell>{device.id.slice(0, 8)}...</TableCell>
              <TableCell>
                <Button
                  variant={selectedDevice === device.id ? "default" : "outline"}
                  onClick={() => onSelectDevice(device.id)}
                >
                  {selectedDevice === device.id ? "Selected" : "Select"}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default DeviceList;
