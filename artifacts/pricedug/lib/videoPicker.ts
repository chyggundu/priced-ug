import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";

const MAX_DURATION_SECONDS = 60;

function isTooLong(asset: ImagePicker.ImagePickerAsset): boolean {
  // duration is in milliseconds when present; some pickers/platforms omit it,
  // in which case we can't check client-side and just let it through.
  return typeof asset.duration === "number" && asset.duration > MAX_DURATION_SECONDS * 1000;
}

function rejectIfTooLong(asset: ImagePicker.ImagePickerAsset | null): ImagePicker.ImagePickerAsset | null {
  if (asset && isTooLong(asset)) {
    Alert.alert("Video too long", `Please choose a video that is ${MAX_DURATION_SECONDS} seconds or shorter.`);
    return null;
  }
  return asset;
}

async function launchLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    quality: 0.8,
    videoMaxDuration: MAX_DURATION_SECONDS,
  });
  if (result.canceled) return null;
  return rejectIfTooLong(result.assets[0] ?? null);
}

async function launchCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  if (!cameraPermission.granted) {
    if (!cameraPermission.canAskAgain && Platform.OS !== "web") {
      Alert.alert(
        "Camera access needed",
        "Enable camera and microphone access in Settings to record a video.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => void Linking.openSettings().catch(() => {}) },
        ],
      );
    } else {
      Alert.alert("Camera access needed", "Camera and microphone permission is required to record a video.");
    }
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["videos"],
    quality: 0.8,
    videoMaxDuration: MAX_DURATION_SECONDS,
  });
  if (result.canceled) return null;
  return rejectIfTooLong(result.assets[0] ?? null);
}

/**
 * Prompts the user to record a video with the camera or choose one from the
 * library (max 60s), then returns the selected asset (or null if
 * cancelled/denied/too long). On web there is no native action sheet, so it
 * falls back to the library picker.
 */
export async function pickVideoAsset(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (Platform.OS === "web") {
    return launchLibrary();
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Add Video",
      `Up to ${MAX_DURATION_SECONDS} seconds`,
      [
        { text: "Record Video", onPress: () => void launchCamera().then(resolve) },
        { text: "Choose from Library", onPress: () => void launchLibrary().then(resolve) },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
