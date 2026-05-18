"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OutOfCreditsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function OutOfCreditsDialog({
  open,
  onOpenChange,
}: OutOfCreditsDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-black/5 bg-nova-card text-nova-heading sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Free credits used</DialogTitle>
          <DialogDescription className="text-nova-body">
            You are out of your free credits. Please upgrade to our premium plan
            to continue generating courses.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-black/10 bg-transparent text-nova-heading hover:bg-black/5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/dashboard/upgrade")}
            className="bg-nova-primary text-white hover:bg-nova-primary/90"
          >
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
