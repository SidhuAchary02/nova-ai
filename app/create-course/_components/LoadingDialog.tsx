import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

const LoadingDialog = ({ loading }: { loading: boolean }) => {
  return (
    <AlertDialog open={loading}>
      <AlertDialogContent className="border-white/10 bg-slate-900/95">
        <AlertDialogHeader className="flex flex-col items-center p-10">
          <AlertDialogTitle className="text-center text-slate-100">
            Generating your course. Hold tight.
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            <Image
              src={"/rocket.gif"}
              alt="loading"
              width={100}
              height={100}
              priority
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoadingDialog;
