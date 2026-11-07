import { Button } from "../button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import styles from "./dialog.demo.module.css";

export default function DialogDemo() {
  return (
    <div className={styles.row}>
      <DialogTrigger>
        <Button variant="secondary">Rename project</Button>
        <Dialog isDismissable>
          <DialogClose />
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>The new name shows everywhere the project appears.</DialogDescription>
          <DialogFooter>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
            <Button slot="close">Save</Button>
          </DialogFooter>
        </Dialog>
      </DialogTrigger>
      <DialogTrigger>
        <Button variant="danger">Delete project</Button>
        <Dialog role="alertdialog">
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>This removes every file in it and can't be undone.</DialogDescription>
          <DialogFooter>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
            <Button slot="close" variant="danger">
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}
