import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";
import { logger } from "./logger";

const MAX_WIDTH = 1080;
const JPEG_QUALITY = 0.8;

/**
 * Gets the dimensions of an image from its URI.
 */
function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
}

/**
 * Compresses and resizes an image for upload.
 *
 * - Resizes to a maximum width of 1080px while maintaining aspect ratio.
 * - Does not upscale images smaller than 1080px wide.
 * - Outputs JPEG format with 0.8 quality.
 * - Falls back to the original URI if compression fails.
 */
export async function compressImage(uri: string): Promise<string> {
  try {
    const { width } = await getImageDimensions(uri);

    // Don't upscale small images, but still compress for format normalization
    if (width <= MAX_WIDTH) {
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return result.uri;
    }

    // Resize maintaining aspect ratio (height is auto-calculated by the library)
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    logger.warn("Image compression failed, using original", error);
    return uri; // Fallback to original
  }
}
