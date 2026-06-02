import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export type ToastSeverity = "error" | "success" | "info";

export interface ToastItem {
  id: string;
  message: string;
  severity: ToastSeverity;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const SEVERITY_COLORS: Record<ToastSeverity, string> = {
  error: "#EF4444",
  success: "#22C55E",
  info: "#3B82F6",
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: SEVERITY_COLORS[toast.severity],
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleDismiss}
        style={styles.touchable}
        activeOpacity={0.8}
      >
        <Text style={styles.message}>{toast.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  touchable: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  message: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
