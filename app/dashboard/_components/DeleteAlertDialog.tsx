import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteAlertDialogProps = {
  open: boolean;
  setIsOpen: (value: boolean) => void;
  handleDeleteCourse: () => void;
};

const DeleteAlertDialog = ({
  open,
  setIsOpen,
  handleDeleteCourse,
}: DeleteAlertDialogProps) => {
  const deleteCourse = () => {
    handleDeleteCourse();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will permanently delete this
            course and its generated content from your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteCourse()} className="bg-red-600 hover:bg-red-700">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlertDialog;
