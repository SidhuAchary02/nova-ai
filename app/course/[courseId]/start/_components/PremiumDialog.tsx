import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaLock } from "react-icons/fa";

type PremiumDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PremiumDialog({ open, onOpenChange }: PremiumDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        <DialogHeader className="flex flex-col items-center pt-6 pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <FaLock className="h-8 w-8 text-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-nova-heading text-center">
            Unlock the Full Course
          </DialogTitle>
          <DialogDescription className="text-nova-body text-center mt-4 text-base leading-relaxed">
            You&apos;ve reached the end of the free preview! Upgrade to Premium to unlock the remaining deep-dive lessons, interactive coding environments, and your completion certificate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 p-4 pt-2">
          <Button 
            className="w-full bg-amber-500 text-white hover:bg-amber-400 py-6 text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
            onClick={() => onOpenChange(false)}
          >
            Upgrade to Premium
          </Button>
          <Button 
            variant="ghost" 
            className="text-nova-body hover:text-nova-heading"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
