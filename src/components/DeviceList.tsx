import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import type { Device } from "@/hooks/useFileTransferSocket";

interface DeviceListProps {
  devices: Device[];
  onSelectDevice: (deviceId: string) => void;
  selectedDevice: string | null;
}

function DeviceList({
  devices,
  onSelectDevice,
  selectedDevice,
}: DeviceListProps) {
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
              <TableCell>{device.id.slice(0, 20)}...</TableCell>
              <TableCell className="w-[20%]">
                <Button
                  variant={"outline"}
                  onClick={() =>
                    selectedDevice === device.id
                      ? onSelectDevice("")
                      : onSelectDevice(device.id)
                  }
                >
                  {selectedDevice === device.id ? "Deselect" : "Select"}
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
