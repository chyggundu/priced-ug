import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";

type Rect = { x: number; y: number; w: number; h: number };

/** Ratio presets. `null` is a free-form box the user drags to any shape. */
const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
];

const MIN_SIDE = 44;

/** Fits `w`×`h` inside the area, returning the on-screen size and offsets. */
function fit(w: number, h: number, areaW: number, areaH: number) {
  const scale = Math.min(areaW / w, areaH / h);
  const width = w * scale;
  const height = h * scale;
  return { scale, width, height, left: (areaW - width) / 2, top: (areaH - height) / 2 };
}

/** Largest box of the given ratio that fits the frame, centred. */
function centredRect(frameW: number, frameH: number, aspect: number | null): Rect {
  if (!aspect) return { x: 0, y: 0, w: frameW, h: frameH };
  let w = frameW;
  let h = w / aspect;
  if (h > frameH) {
    h = frameH;
    w = h * aspect;
  }
  return { x: (frameW - w) / 2, y: (frameH - h) / 2, w, h };
}

/**
 * Optional crop step for a picture that has already been chosen.
 *
 * Nothing crops automatically anywhere in the app — the picker's own editor is
 * off — so this is the one place a seller trims or zooms into a photo, and only
 * when they tap Crop. The box starts as the whole picture: tapping Done without
 * moving it returns the picture unchanged.
 *
 * Works on a local `file://` from the picker and on an already-uploaded URL,
 * so a photo can still be cropped after it was added.
 */
export function ImageCropper({
  uri,
  visible,
  onCancel,
  onCropped,
}: {
  uri: string | null;
  visible: boolean;
  onCancel: () => void;
  onCropped: (uri: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [area, setArea] = useState<{ w: number; h: number } | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [working, setWorking] = useState(false);

  // The gesture handlers below are created once, so they read the live rect
  // and frame through refs rather than through stale closure values.
  const rectRef = useRef<Rect | null>(null);
  const startRef = useRef<Rect | null>(null);
  const frameRef = useRef<{ w: number; h: number } | null>(null);
  const aspectRef = useRef<number | null>(null);
  rectRef.current = rect;
  aspectRef.current = aspect;

  useEffect(() => {
    if (!visible || !uri) return;
    setNatural(null);
    setRect(null);
    setAspect(null);
    Image.getSize(
      uri,
      (w, h) => setNatural({ w, h }),
      () => setNatural(null),
    );
  }, [visible, uri]);

  const frame = useMemo(() => {
    if (!natural || !area) return null;
    return fit(natural.w, natural.h, area.w, area.h);
  }, [natural, area]);

  // Start with the whole picture selected, and re-fit if the frame changes.
  useEffect(() => {
    if (!frame) return;
    frameRef.current = { w: frame.width, h: frame.height };
    setRect((current) => current ?? { x: 0, y: 0, w: frame.width, h: frame.height });
  }, [frame]);

  const clamp = (r: Rect): Rect => {
    const f = frameRef.current;
    if (!f) return r;
    const w = Math.min(Math.max(r.w, MIN_SIDE), f.w);
    const h = Math.min(Math.max(r.h, MIN_SIDE), f.h);
    return {
      w,
      h,
      x: Math.min(Math.max(r.x, 0), f.w - w),
      y: Math.min(Math.max(r.y, 0), f.h - h),
    };
  };

  const moveResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = rectRef.current;
        },
        onPanResponderMove: (_e, g) => {
          const start = startRef.current;
          if (!start) return;
          setRect(clamp({ ...start, x: start.x + g.dx, y: start.y + g.dy }));
        },
      }),
    [],
  );

  /** One handle per corner; `sx`/`sy` say which edges that corner moves. */
  const cornerResponder = (sx: -1 | 1, sy: -1 | 1) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = rectRef.current;
      },
      onPanResponderMove: (_e, g) => {
        const start = startRef.current;
        const f = frameRef.current;
        if (!start || !f) return;

        // Corners pull their own edges; the opposite edges stay pinned.
        const right = start.x + start.w;
        const bottom = start.y + start.h;
        let w = sx === 1 ? start.w + g.dx : start.w - g.dx;
        let h = sy === 1 ? start.h + g.dy : start.h - g.dy;

        const ratio = aspectRef.current;
        if (ratio) {
          // Follow whichever side the finger moved further on, so a locked
          // ratio still feels like a direct drag.
          if (Math.abs(g.dx) > Math.abs(g.dy)) h = w / ratio;
          else w = h * ratio;
        }

        w = Math.min(Math.max(w, MIN_SIDE), f.w);
        h = Math.min(Math.max(h, MIN_SIDE), f.h);
        if (ratio) {
          // Re-derive after the limits, or a clamp would skew the ratio.
          if (w / ratio > f.h) w = f.h * ratio;
          h = w / ratio;
        }

        const x = sx === 1 ? start.x : right - w;
        const y = sy === 1 ? start.y : bottom - h;
        setRect(clamp({ x, y, w, h }));
      },
    });

  const corners = useMemo(
    () => ({
      topLeft: cornerResponder(-1, -1),
      topRight: cornerResponder(1, -1),
      bottomLeft: cornerResponder(-1, 1),
      bottomRight: cornerResponder(1, 1),
    }),
    [],
  );

  const chooseAspect = (value: number | null) => {
    setAspect(value);
    const f = frameRef.current;
    if (f) setRect(centredRect(f.w, f.h, value));
  };

  const onArea = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setArea({ w: width, h: height });
  };

  const apply = async () => {
    if (!uri || !rect || !frame || !natural) return;
    setWorking(true);
    try {
      const originX = Math.round(rect.x / frame.scale);
      const originY = Math.round(rect.y / frame.scale);
      const width = Math.round(rect.w / frame.scale);
      const height = Math.round(rect.h / frame.scale);
      const result = await manipulateAsync(
        uri,
        [
          {
            crop: {
              originX: Math.max(0, Math.min(originX, natural.w - 1)),
              originY: Math.max(0, Math.min(originY, natural.h - 1)),
              width: Math.max(1, Math.min(width, natural.w - originX)),
              height: Math.max(1, Math.min(height, natural.h - originY)),
            },
          },
        ],
        { compress: 0.9, format: SaveFormat.JPEG },
      );
      onCropped(result.uri);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.backdrop}>
        <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onCancel} hitSlop={10} accessibilityLabel="Cancel crop">
            <Feather name="x" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.barTitle}>Crop photo</Text>
          <Pressable onPress={apply} hitSlop={10} disabled={working || !rect} accessibilityLabel="Done">
            {working ? <ActivityIndicator color="#fff" /> : <Text style={styles.done}>Done</Text>}
          </Pressable>
        </View>

        <View style={styles.area} onLayout={onArea}>
          {uri && frame && rect ? (
            <>
              <Image
                source={{ uri }}
                style={{
                  position: "absolute",
                  left: frame.left,
                  top: frame.top,
                  width: frame.width,
                  height: frame.height,
                }}
                resizeMode="contain"
              />
              <View
                pointerEvents="box-none"
                style={{
                  position: "absolute",
                  left: frame.left,
                  top: frame.top,
                  width: frame.width,
                  height: frame.height,
                }}
              >
                {/* Dim outside the selection on all four sides, so what will
                    be kept is obvious before tapping Done. */}
                <View style={[styles.shade, { left: 0, top: 0, right: 0, height: rect.y }]} pointerEvents="none" />
                <View
                  style={[styles.shade, { left: 0, top: rect.y + rect.h, right: 0, bottom: 0 }]}
                  pointerEvents="none"
                />
                <View
                  style={[styles.shade, { left: 0, top: rect.y, width: rect.x, height: rect.h }]}
                  pointerEvents="none"
                />
                <View
                  style={[
                    styles.shade,
                    { left: rect.x + rect.w, top: rect.y, right: 0, height: rect.h },
                  ]}
                  pointerEvents="none"
                />

                <View
                  {...moveResponder.panHandlers}
                  style={[styles.box, { left: rect.x, top: rect.y, width: rect.w, height: rect.h }]}
                >
                  <View {...corners.topLeft.panHandlers} style={[styles.handle, styles.tl]} />
                  <View {...corners.topRight.panHandlers} style={[styles.handle, styles.tr]} />
                  <View {...corners.bottomLeft.panHandlers} style={[styles.handle, styles.bl]} />
                  <View {...corners.bottomRight.panHandlers} style={[styles.handle, styles.br]} />
                </View>
              </View>
            </>
          ) : (
            <ActivityIndicator color="#fff" />
          )}
        </View>

        <View style={[styles.aspects, { paddingBottom: insets.bottom + 14 }]}>
          {ASPECTS.map((option) => {
            const active = aspect === option.value;
            return (
              <Pressable
                key={option.label}
                onPress={() => chooseAspect(option.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  barTitle: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
  done: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  area: { flex: 1, margin: 16, alignItems: "center", justifyContent: "center" },
  shade: { position: "absolute", backgroundColor: "rgba(0,0,0,0.55)" },
  box: { position: "absolute", borderWidth: 2, borderColor: "#fff" },
  handle: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tl: { left: -2, top: -2, borderLeftWidth: 4, borderTopWidth: 4 },
  tr: { right: -2, top: -2, borderRightWidth: 4, borderTopWidth: 4 },
  bl: { left: -2, bottom: -2, borderLeftWidth: 4, borderBottomWidth: 4 },
  br: { right: -2, bottom: -2, borderRightWidth: 4, borderBottomWidth: 4 },
  aspects: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  chipActive: { backgroundColor: "#fff" },
  chipText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  chipTextActive: { color: "#000" },
});
