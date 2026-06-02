import React, { createContext, useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, { ToastItem, ToastSeverity } from "@/components/Toast";

export interface ToastContextValue {
  showToast: (message: string, severity: ToastSeverity) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const insets = useSafeAreaInsets();

  const dismissToast = useCallback((id: string) => {
    const timer = timerRefs.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, severity: ToastSeverity) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: ToastItem = { id, message, severity };

      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        dismissToast(id);
      }, 3000);
      timerRefs.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        style={[styles.toastContainer, { top: insets.top }]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
