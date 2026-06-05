import React from "react";
import { View } from "react-native";

export const Link = ({ children, href, asChild, ...props }: any) => {
  if (asChild) {
    return React.Children.only(children);
  }
  return React.createElement(View, props, children);
};

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
});

export const useLocalSearchParams = () => ({});
export const useSegments = () => [];
export const usePathname = () => "/";
