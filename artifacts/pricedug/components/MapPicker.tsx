import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

// Default center: Kampala, Uganda
const DEFAULT_CENTER = { lat: 0.3476, lng: 32.5825 };

type Coords = { lat: number; lng: number };

// react-native-webview has no web implementation; only require it on native.
let WebView: React.ComponentType<any> | null = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require("react-native-webview").WebView;
}

function buildHtml(initial: Coords | null): string {
  const center = initial ?? DEFAULT_CENTER;
  const zoom = initial ? 16 : 12;
  const hasInitial = initial ? "true" : "false";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0;}</style>
</head>
<body>
<div id="map"></div>
<script>
  var initLat = ${center.lat};
  var initLng = ${center.lng};
  var hasInitial = ${hasInitial};
  var map = L.map('map', { zoomControl: true }).setView([initLat, initLng], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  var marker = null;
  function send(latlng) {
    var msg = JSON.stringify({ lat: latlng.lat, lng: latlng.lng });
    if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(msg); }
    else if (window.parent) { window.parent.postMessage(msg, '*'); }
  }
  function place(latlng) {
    if (!marker) {
      marker = L.marker(latlng, { draggable: true }).addTo(map);
      marker.on('dragend', function () { send(marker.getLatLng()); });
    } else {
      marker.setLatLng(latlng);
    }
    send(marker.getLatLng());
  }
  if (hasInitial) { place({ lat: initLat, lng: initLng }); }
  map.on('click', function (e) { place(e.latlng); });
</script>
</body>
</html>`;
}

export default function MapPicker({
  initialLat,
  initialLng,
  onConfirm,
  onCancel,
}: {
  initialLat: number | null;
  initialLng: number | null;
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const initial =
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null;
  const html = useMemo(() => buildHtml(initial), []);
  const [selected, setSelected] = useState<Coords | null>(initial);
  const iframeRef = useRef<any>(null);

  const applyMessage = (raw: string) => {
    try {
      const d = JSON.parse(raw);
      const lat = d.lat;
      const lng = d.lng;
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        setSelected({ lat, lng });
      }
    } catch {
      // ignore non-JSON messages
    }
  };

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e: MessageEvent) => {
      // Only trust messages coming from our own map iframe.
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      if (typeof e.data === "string") applyMessage(e.data);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={onCancel} style={styles.headerBtn} hitSlop={8}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Pick location</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.mapWrap}>
        {Platform.OS === "web"
          ? React.createElement("iframe", {
              ref: iframeRef,
              srcDoc: html,
              title: "map",
              style: { border: 0, width: "100%", height: "100%" },
            })
          : WebView && (
              <WebView
                originWhitelist={["*"]}
                source={{ html }}
                onMessage={(event: { nativeEvent: { data: string } }) =>
                  applyMessage(event.nativeEvent.data)
                }
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.loading}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                )}
                style={{ flex: 1 }}
              />
            )}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerRow}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.coordText, { color: colors.foreground }]}>
            {selected
              ? `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`
              : "Tap the map to drop a pin"}
          </Text>
        </View>
        <Pressable
          style={[styles.confirmBtn, { backgroundColor: colors.primary, opacity: selected ? 1 : 0.5 }]}
          disabled={!selected}
          onPress={() => selected && onConfirm(selected.lat, selected.lng)}
        >
          <Text style={styles.confirmText}>Use this location</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600" as const, textAlign: "center" },
  mapWrap: { flex: 1, overflow: "hidden" },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, gap: 12 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  coordText: { fontSize: 14 },
  confirmBtn: { borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  confirmText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
});
