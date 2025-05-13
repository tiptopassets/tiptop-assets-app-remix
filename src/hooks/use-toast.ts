
// Import directly from the UI components instead of creating a circular import
import { toast as uiToast, type ToastProps } from "@/components/ui/toast";
import { useToast as useUiToast } from "@/components/ui/use-toast";

// Export the toast functions
export const toast = uiToast;
export const useToast = useUiToast;
