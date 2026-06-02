import * as Updates from "expo-updates";
import { logger } from "./logger";

export async function checkForUpdates(): Promise<void> {
  if (__DEV__) return;

  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      logger.info("Update downloaded, will apply on next launch");
    }
  } catch (error) {
    logger.warn("Failed to check for updates", error);
  }
}
