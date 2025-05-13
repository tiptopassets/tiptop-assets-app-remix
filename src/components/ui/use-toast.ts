
// Re-export from the toast-primitive component
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export { useToast, Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport };
