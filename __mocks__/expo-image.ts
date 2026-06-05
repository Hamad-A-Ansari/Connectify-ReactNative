import React from "react";
import { View } from "react-native";

export const Image = ({ source, style, ...props }: any) =>
  React.createElement(View, {
    ...props,
    style,
    testID: props.testID || "expo-image",
    accessibilityLabel: typeof source === "string" ? source : undefined,
  });
