import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";

type Aspect = [number, number];

async function launchLibraryMultiple(
  selectionLimit: number,
): Promise<ImagePicker.ImagePickerAsset[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    quality: 0.8,
    allowsMultipleSelection: true,
    selectionLimit,
  });
  if (result.canceled) return [];
  return result.assets ?? [];
}

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

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
      aspect,
    });
    if (result.canceled) return null;
    return result.assets[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("not available on simulator")) {
      Alert.alert("Camera unavailable", "The simulator has no camera. Choose a photo from the library instead.");
    } else {
      Alert.alert("Camera unavailable", message || "Could not open the camera.");
    }
    return null;
  }
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

/**
 * Same action sheet as `pickImageAsset`, but the library branch allows picking
 * several photos at once (the camera branch can only ever return one).
 * `selectionLimit` is how many more the caller still has room for.
 */
export async function pickImageAssets(
  selectionLimit: number,
  aspect: Aspect = [4, 3],
): Promise<ImagePicker.ImagePickerAsset[]> {
  if (selectionLimit < 1) return [];
  if (Platform.OS === "web") {
    return launchLibraryMultiple(selectionLimit);
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Add Photos",
      undefined,
      [
        {
          text: "Take Photo",
          onPress: () => void launchCamera(aspect).then((a) => resolve(a ? [a] : [])),
        },
        {
          text: "Choose from Library",
          onPress: () => void launchLibraryMultiple(selectionLimit).then(resolve),
        },
        { text: "Cancel", style: "cancel", onPress: () => resolve([]) },
      ],
      { cancelable: true, onDismiss: () => resolve([]) },
    );
  });
}

async function launchVideoLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "videos",
    quality: 0.8,
    videoMaxDuration: 60,
  });
  if (result.canceled) return null;
  return result.assets[0] ?? null;
}

async function launchVideoCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Camera access needed", "Camera permission is required to record a video.");
    return null;
  }
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "videos",
      quality: 0.8,
      videoMaxDuration: 60,
    });
    if (result.canceled) return null;
    return result.assets[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("not available on simulator")) {
      Alert.alert("Camera unavailable", "The simulator has no camera. Choose a video from the library instead.");
    } else {
      Alert.alert("Camera unavailable", message || "Could not open the camera.");
    }
    return null;
  }
}

/** Records or picks one short video, returning null if cancelled/denied. */
export async function pickVideoAsset(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (Platform.OS === "web") {
    return launchVideoLibrary();
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Add Video",
      undefined,
      [
        { text: "Record Video", onPress: () => void launchVideoCamera().then(resolve) },
        { text: "Choose from Library", onPress: () => void launchVideoLibrary().then(resolve) },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
