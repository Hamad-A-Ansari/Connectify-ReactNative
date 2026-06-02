import React from "react";
import renderer, { act } from "react-test-renderer";
import ToastProvider from "@/provider/ToastProvider";
import { useToast } from "@/hooks/useToast";
import { Text, TouchableOpacity } from "react-native";

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

let showToastRef: ((message: string, severity: "error" | "success" | "info") => void) | null = null;

function TestComponent() {
  const { showToast } = useToast();
  showToastRef = showToast;
  return <Text>Test</Text>;
}

describe("Toast System", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    showToastRef = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows a toast when showToast is called", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
    });

    act(() => {
      showToastRef!("Something went wrong", "error");
    });

    const json = tree!.toJSON() as any;
    // ToastProvider renders children + toast container
    // Find the toast message text in the tree
    const allText = JSON.stringify(json);
    expect(allText).toContain("Something went wrong");
  });

  it("supports multiple toasts in queue", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
    });

    act(() => {
      showToastRef!("Error message", "error");
      showToastRef!("Success message", "success");
      showToastRef!("Info message", "info");
    });

    const allText = JSON.stringify(tree!.toJSON());
    expect(allText).toContain("Error message");
    expect(allText).toContain("Success message");
    expect(allText).toContain("Info message");
  });

  it("auto-dismisses toast after 3 seconds", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
    });

    act(() => {
      showToastRef!("Temporary toast", "info");
    });

    expect(JSON.stringify(tree!.toJSON())).toContain("Temporary toast");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(JSON.stringify(tree!.toJSON())).not.toContain("Temporary toast");
  });

  it("throws when useToast is used outside ToastProvider", () => {
    function BadComponent() {
      useToast();
      return null;
    }

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderer.create(<BadComponent />);
    }).toThrow("useToast must be used within a ToastProvider");
    consoleSpy.mockRestore();
  });

  it("renders toasts with correct severity styling context", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
    });

    act(() => {
      showToastRef!("Error toast", "error");
    });

    // The toast should render in the tree
    const allText = JSON.stringify(tree!.toJSON());
    expect(allText).toContain("Error toast");
    // Error severity uses red color (#EF4444)
    expect(allText).toContain("#EF4444");
  });
});
