import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions use the danger style and receive focus on Cancel first. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * Required before any destructive operation such as deleting a job or
 * suspending an account. The confirm button stays disabled while a request runs.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!loading) onOpenChange(next);
      }}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
