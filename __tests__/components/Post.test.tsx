/**
 * Smoke test to verify the component testing setup works.
 * Confirms that all mocks (expo-image, expo-router, convex/react, clerk, vector-icons)
 * are properly configured for rendering the Post component.
 *
 * Property-based tests for Post will be added in subsequent tasks (7.2–7.6).
 */
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import Post from "@/components/Post";

// Mock CommentsModal and ReportModal as they have their own complex dependencies
jest.mock("@/components/CommentsModal", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ visible }: any) =>
    visible ? React.createElement(View, { testID: "comments-modal" }) : null;
});

jest.mock("@/components/ReportModal", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ visible }: any) =>
    visible ? React.createElement(View, { testID: "report-modal" }) : null;
});

const mockPost = {
  _id: "post123" as any,
  imageUrl: "https://example.com/image.jpg",
  caption: "Test caption",
  likes: 5,
  comments: 2,
  _creationTime: Date.now() - 60000,
  isLiked: false,
  isBookmarked: false,
  author: {
    _id: "user456",
    username: "testuser",
    image: "https://example.com/avatar.jpg",
  },
};

describe("Component test setup", () => {
  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue({ _id: "currentUser123" });
    (useMutation as jest.Mock).mockReturnValue(jest.fn());
  });

  it("mocks are properly configured", () => {
    expect(jest.isMockFunction(useQuery)).toBe(true);
    expect(jest.isMockFunction(useMutation)).toBe(true);
    expect(jest.isMockFunction(useUser)).toBe(true);
  });

  it("renders Post component with all mocked dependencies", () => {
    const { getAllByText, getByText } = render(<Post post={mockPost} />);

    // Verify the component renders with key content
    expect(getAllByText("testuser").length).toBeGreaterThan(0);
    expect(getByText("Test caption")).toBeTruthy();
    expect(getByText("5 likes")).toBeTruthy();
  });
});
