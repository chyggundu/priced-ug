import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";

import { useColors } from "@/hooks/useColors";
import { MediaViewer } from "@/components/MediaViewer";
import { buildMediaSlides } from "@/lib/media";

function VideoSlide({ uri, width, height }: { uri: string; width: number; height: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });
  return (
    <VideoView
      player={player}
      style={{ width, height, backgroundColor: "#000" }}
      nativeControls
      contentFit="contain"
    />
  );
}

/**
 * Swipeable photo carousel with the product's video as a final slide.
 *
 * Photos are letter-boxed rather than cropped: a seller's picture is shown
 * whole, whatever shape it is. Tapping one opens the full-screen viewer at
 * that slide.
 *
 * Falls back to the single cover image when a product predates the gallery
 * columns, so older rows still render exactly as they did before.
 */
export function ProductMediaGallery({
  imageUrl,
  imageUrls,
  videoUrl,
  width,
  height = 220,
}: {
  imageUrl: string | null;
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  width?: number;
  height?: number;
}) {
  const colors = useColors();
  const [index, setIndex] = useState(0);
  const [viewerAt, setViewerAt] = useState<number | null>(null);
  // Measured rather than assumed: the card this sits in has its own padding
  // and border, and a paging ScrollView drifts if the page width is off.
  const [measured, setMeasured] = useState<number | null>(null);
  const slideWidth = width ?? measured ?? Dimensions.get("window").width - 32;

  const slides = useMemo(
    () => buildMediaSlides(imageUrl, imageUrls, videoUrl),
    [imageUrl, imageUrls, videoUrl],
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (next !== index) setIndex(next);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== measured) setMeasured(w);
  };

  const viewer = (
    <MediaViewer
      slides={slides}
      startIndex={viewerAt ?? 0}
      visible={viewerAt !== null}
      onClose={() => setViewerAt(null)}
    />
  );

  if (slides.length === 0) {
    return (
      <View
        onLayout={onLayout}
        style={[styles.placeholder, { height, backgroundColor: colors.secondary }]}
      >
        <Feather name="image" size={24} color={colors.primary} />
      </View>
    );
  }

  if (slides.length === 1 && slides[0].type === "image") {
    return (
      <>
        <Pressable onPress={() => setViewerAt(0)} accessibilityLabel="Open photo">
          <Image
            onLayout={onLayout}
            source={{ uri: slides[0].uri }}
            style={[styles.media, { width: "100%", height }]}
            resizeMode="contain"
          />
        </Pressable>
        {viewer}
      </>
    );
  }

  return (
    <View onLayout={onLayout} style={width ? { width } : undefined}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, i) =>
          slide.type === "image" ? (
            <Pressable
              key={`${slide.uri}-${i}`}
              onPress={() => setViewerAt(i)}
              accessibilityLabel={`Open photo ${i + 1}`}
            >
              <Image
                source={{ uri: slide.uri }}
                style={[styles.media, { width: slideWidth, height }]}
                resizeMode="contain"
              />
            </Pressable>
          ) : (
            <VideoSlide key={`${slide.uri}-${i}`} uri={slide.uri} width={slideWidth} height={height} />
          ),
        )}
      </ScrollView>

      <View style={styles.dots} pointerEvents="none">
        {slides.map((slide, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.45)" },
              slide.type === "video" && styles.dotVideo,
            ]}
          />
        ))}
      </View>

      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {index + 1}/{slides.length}
        </Text>
      </View>

      {viewer}
    </View>
  );
}

/** Small badge row telling a card's reader that more media is behind the cover. */
export function MediaBadges({
  photoCount,
  hasVideo,
}: {
  photoCount?: number | null;
  hasVideo?: boolean | null;
}) {
  const count = photoCount ?? 0;
  if (count < 2 && !hasVideo) return null;
  return (
    <View style={styles.badgeRow} pointerEvents="none">
      {count > 1 && (
        <View style={styles.badge}>
          <Feather name="image" size={11} color="#fff" />
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
      {hasVideo && (
        <View style={styles.badge}>
          <Feather name="play" size={11} color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: "center", justifyContent: "center" },
  // A dark mat behind the letter-boxing, so a tall or square photo reads as
  // deliberately framed rather than as a layout gap.
  media: { backgroundColor: "#0b0b0b" },
  dots: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotVideo: { width: 10, borderRadius: 3 },
  counter: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  counterText: { color: "#fff", fontSize: 11, fontWeight: "600" as const },
  badgeRow: { position: "absolute", top: 6, left: 6, flexDirection: "row", gap: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "600" as const },
});
