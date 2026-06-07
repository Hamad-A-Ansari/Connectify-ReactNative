// Jest setup file for component tests
// Mocks for external dependencies used in component tests

// Mock expo-image
jest.mock("expo-image", () => ({
  Image: ({ source, style, ...props }) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      ...props,
      style,
      testID: props.testID || "expo-image",
      accessibilityLabel: typeof source === "string" ? source : undefined,
    });
  },
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  Link: ({ children, href, asChild, ...props }) => {
    const React = require("react");
    const { View } = require("react-native");
    if (asChild) {
      return React.Children.only(children);
    }
    return React.createElement(View, props, children);
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => "/",
}));

// Mock convex/react
jest.mock("convex/react", () => ({
  useQuery: jest.fn(() => null),
  useMutation: jest.fn(() => jest.fn()),
  useAction: jest.fn(() => jest.fn()),
  useConvex: jest.fn(() => ({})),
  ConvexProvider: ({ children }) => children,
}));

// Mock @clerk/clerk-expo
jest.mock("@clerk/clerk-expo", () => ({
  useUser: jest.fn(() => ({
    user: { id: "test-clerk-id", firstName: "Test", lastName: "User" },
    isLoaded: true,
    isSignedIn: true,
  })),
  useAuth: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    userId: "test-clerk-id",
    getToken: jest.fn(() => Promise.resolve("test-token")),
  })),
  ClerkProvider: ({ children }) => children,
}));

// Mock @expo/vector-icons (Ionicons)
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name, size, color, ...props }) =>
      React.createElement(Text, { ...props, testID: `icon-${name}` }, name),
  };
});

// Mock @/hooks/useToast
jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn(),
  })),
}));

// Mock @/lib/logger
jest.mock("@/lib/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock @/lib/errorFormatter
jest.mock("@/lib/errorFormatter", () => ({
  formatErrorForUser: jest.fn((err) =>
    err?.message || "Something went wrong"
  ),
}));
