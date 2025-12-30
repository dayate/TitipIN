import { Dialog as DialogPrimitive } from "bits-ui";

import DialogContent from "./dialog-content.svelte";
import DialogDescription from "./dialog-description.svelte";
import DialogFooter from "./dialog-footer.svelte";
import DialogHeader from "./dialog-header.svelte";
import DialogTitle from "./dialog-title.svelte";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
