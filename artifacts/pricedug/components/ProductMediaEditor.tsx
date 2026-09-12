import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";

import { useColors } from "@/hooks/useColors";
import { pickImageAssets, pickVideoAsset } from "@/lib/imagePicker";
import { uploadMedia } from "@/lib/storage";

/** Same ceiling the website's product form uses, so both clients agree. */
export const MAX_PHOTOS = 7;

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });
  return <VideoView player={player} style={styles.videoPreview} nativeControls contentFit="cover" />;
}

/**
 * The photo strip and video slot shared by the add- and edit-product screens.
 *
 * `imageUrls` is the gallery the website writes; the first entry doubles as
 * the cover (`image_url`), which is what every list view still reads.
 */
export function ProductMediaEditor({
  imageUrls,
  onChangeImageUrls,
  videoUrl,
  onChangeVideoUrl,
  onBusyChange,
}: {
  imageUrls: string[];
  onChangeImageUrls: (urls: string[]) => void;
  videoUrl: string | null;
  onChangeVideoUrl: (url: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const colors = useColors();
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const setBusy = (photos: boolean, video: boolean) => {
    setUploadingPhotos(photos);
    setUploadingVideo(video);
    onBusyChange?.(photos || video);
  };

  const addPhotos = async () => {
    const remaining = MAX_PHOTOS - imageUrls.length;
    if (remaining < 1) {
      Alert.alert("Photo limit", `You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const assets = await pickImageAssets(remaining);
    if (assets.length === 0) return;

    setBusy(true, uploadingVideo);
    try {
      // Uploaded one at a time so a single failure does not lose the rest.
      const uploaded: string[] = [];
      for (const asset of assets.slice(0, remaining)) {
        uploaded.push(await uploadMedia(asset.uri, asset.mimeType ?? "image/jpeg"));
      }
      onChangeImageUrls([...imageUrls, ...uploaded]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Upload failed", message);
    } finally {
      setBusy(false, uploadingVideo);
    }
  };

  const removePhoto = (index: number) => {
    onChangeImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addVideo = async () => {
    const asset = await pickVideoAsset();
    if (!asset) return;

    setBusy(uploadingPhotos, true);
    try {
      onChangeVideoUrl(await uploadMedia(asset.uri, asset.mimeType ?? "video/mp4"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Upload failed", message);
    } finally {
      setBusy(uploadingPhotos, false);
    }
  };

  const removeVideo = () => {
    Alert.alert("Remove video", "Remove the video from this product?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onChangeVideoUrl(null) },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.foreground }]}>
        Photos ({imageUrls.length}/{MAX_PHOTOS})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
        keyboardShouldPersistTaps="handled"
      >
        {imageUrls.map((url, index) => (
          <View key={`${url}-${index}`} style={styles.thumbWrap}>
            <Image source={{ uri: url }} style={styles.thumb} />
            {index === 0 && (
              <View style={[styles.coverBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.coverBadgeText}>Cover</Text>
              </View>
            )}
            <Pressable
              style={styles.removeBtn}
              onPress={() => removePhoto(index)}
              hitSlop={8}
              accessibilityLabel={`Remove photo ${index + 1}`}
            >
              <Feather name="x" size={13} color="#fff" />
            </Pressable>
          </View>
        ))}

        {imageUrls.length < MAX_PHOTOS && (
          <Pressable
            onPress={addPhotos}
            disabled={uploadingPhotos}
            style={[styles.addTile, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
          >
            {uploadingPhotos ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Feather name="camera" size={22} color={colors.primary} />
                <Text style={[styles.addTileText, { color: colors.primary }]}>Add photo</Text>
              </>
            )}
          </Pressable>
        )}
      </ScrollView>

      <Text style={[styles.label, { color: colors.foreground }]}>Video</Text>
      {videoUrl ? (
        <View style={styles.videoWrap}>
          <VideoPreview uri={videoUrl} />
          <Pressable style={styles.removeBtnLarge} onPress={removeVideo} hitSlop={8}>
            <Feather name="trash-2" size={15} color="#fff" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={addVideo}
          disabled={uploadingVideo}
          style={[styles.videoAdd, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
        >
          {uploadingVideo ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Feather name="video" size={22} color={colors.primary} />
              <Text style={[styles.addTileText, { color: colors.primary }]}>Add a short video</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: "600" as const },
  strip: { gap: 10, paddingRight: 16, paddingBottom: 4 },
  thumbWrap: { position: "relative", overflow: "hidden", borderRadius: 10 },
  thumb: { width: 96, height: 96, borderRadius: 10, resizeMode: "cover" },
  coverBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coverBadgeText: { color: "#fff", fontSize: 10, fontWeight: "600" as const },
  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnLarge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  addTile: {
    width: 96,
    height: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addTileText: { fontSize: 11, fontWeight: "600" as const, textAlign: "center" },
  videoWrap: { position: "relative" },
  videoPreview: { width: "100%", height: 190, borderRadius: 10, backgroundColor: "#000" },
  videoAdd: {
    height: 90,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
