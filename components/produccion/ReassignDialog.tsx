import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/contexts/users-context";

interface ReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  selectedResponsable: string;
  setSelectedResponsable: (value: string) => void;
  lotCode?: string;
}

export function ReassignDialog({
  open,
  onOpenChange,
  onSubmit,
  selectedResponsable,
  setSelectedResponsable,
  lotCode,
}: ReassignDialogProps) {
  const { users } = useUsers();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reasignar lote</DialogTitle>
          <DialogDescription>
            Lote: {lotCode}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Select value={selectedResponsable} onValueChange={setSelectedResponsable}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un operario" />
            </SelectTrigger>
            <SelectContent>
              {users.filter((u) => u.role === "operator").map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>Reasignar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
