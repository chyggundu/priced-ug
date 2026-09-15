import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";

import { type MediaSlide, wrapIndex } from "@/lib/media";

function ViewerVideo({ uri, width, height }: { uri: string; width: number; height: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });
  return <VideoView player={player} style={{ width, height }} nativeControls contentFit="contain" />;
}

/**
 * Full-screen media viewer: tapping a photo anywhere in the app opens it here
 * at its full size.
 *
 * `contentFit`/`resizeMode` is always `contain` — the whole point of opening a
 * picture is to see all of it, so nothing is ever cropped to fill the screen.
 */
export function MediaViewer({
  slides,
  startIndex = 0,
  visible,
  onClose,
}: {
  slides: MediaSlide[];
  startIndex?: number;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");
  const [index, setIndex] = useState(startIndex);
  const scrollRef = useRef<ScrollView>(null);

  // Re-anchor every time it opens: the same viewer is reused for whichever
  // thumbnail was tapped, so the start index changes between openings.
  useEffect(() => {
    if (!visible) return;
    const start = wrapIndex(startIndex, slides.length);
    setIndex(start);
    // The ScrollView has not laid out yet on the frame the modal appears.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: start * width, animated: false });
    });
  }, [visible, startIndex, slides.length, width]);

  if (slides.length === 0) return null;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.backdrop}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, i) =>
            slide.type === "image" ? (
              <Pressable key={`${slide.uri}-${i}`} onPress={onClose} accessibilityLabel="Close photo">
                <Image
                  source={{ uri: slide.uri }}
                  style={{ width, height }}
                  resizeMode="contain"
                />
              </Pressable>
            ) : (
              // Not wrapped in a Pressable: the video's own controls need the
              // taps, so this slide closes from the X button only.
              <ViewerVideo key={`${slide.uri}-${i}`} uri={slide.uri} width={width} height={height} />
            ),
          )}
        </ScrollView>

        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel="Close"
          style={[styles.closeBtn, { top: insets.top + 8 }]}
        >
          <Feather name="x" size={22} color="#fff" />
        </Pressable>

        {slides.length > 1 && (
          <View style={[styles.counter, { top: insets.top + 12 }]} pointerEvents="none">
            <Text style={styles.counterText}>
              {index + 1}/{slides.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000" },
  closeBtn: {
    position: "absolute",
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    position: "absolute",
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  counterText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
});
