import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface IncomingTransferDialogProps {
  open: boolean;
  pendingTransfer: {
    senderId: string;
    fileName: string;
    fileSize: number;
  } | null;
  senderDeviceName: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingTransferDialog({
  open,
  pendingTransfer,
  senderDeviceName,
  onAccept,
  onReject,
}: IncomingTransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Incoming File Transfer</DialogTitle>
          <DialogDescription>
            {pendingTransfer
              ? `${pendingTransfer.fileName} (${Math.round(
                  pendingTransfer.fileSize / 1024
                )} KB) from device ${senderDeviceName}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4 mt-4">
          <Button variant="outline" onClick={onReject}>
            Reject
          </Button>
          <Button variant="outline" onClick={onAccept}>
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
