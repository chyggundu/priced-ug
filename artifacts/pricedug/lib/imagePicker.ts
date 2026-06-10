import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";

type Aspect = [number, number];

async function launchLibrary(aspect: Aspect): Promise<ImagePicker.ImagePickerAsset | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    quality: 0.8,
    allowsEditing: true,
    aspect,
  });
  if (result.canceled) return null;
  return result.assets[0] ?? null;
}

async function launchCamera(aspect: Aspect): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    if (!permission.canAskAgain && Platform.OS !== "web") {
      Alert.alert(
        "Camera access needed",
        "Enable camera access in Settings to take photos.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => void Linking.openSettings().catch(() => {}) },
        ],
      );
    } else {
      Alert.alert("Camera access needed", "Camera permission is required to take a photo.");
    }
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: "images",
    quality: 0.8,
    allowsEditing: true,
    aspect,
  });
  if (result.canceled) return null;
  return result.assets[0] ?? null;
}

/**
 * Prompts the user to take a photo with the camera or choose one from the
 * library, then returns the selected asset (or null if cancelled/denied).
 * On web there is no native action sheet, so it falls back to the library
 * picker (mobile browsers expose the camera through the file picker).
 */
export async function pickImageAsset(
  aspect: Aspect = [4, 3],
): Promise<ImagePicker.ImagePickerAsset | null> {
  if (Platform.OS === "web") {
    return launchLibrary(aspect);
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Add Photo",
      undefined,
      [
        { text: "Take Photo", onPress: () => void launchCamera(aspect).then(resolve) },
        { text: "Choose from Library", onPress: () => void launchLibrary(aspect).then(resolve) },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
