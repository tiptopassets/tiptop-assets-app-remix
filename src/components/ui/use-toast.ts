
// Re-export from the toast-primitive component
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast, Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport };
