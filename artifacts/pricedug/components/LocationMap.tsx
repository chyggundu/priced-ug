import React, { useMemo } from "react";
import { View, StyleSheet, Platform, Pressable, Text, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

let WebView: React.ComponentType<any> | null = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require("react-native-webview").WebView;
}

function buildHtml(lat: number, lng: number): string {
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
  var map = L.map('map', {
    zoomControl: true,
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    tap: true
  }).setView([${lat}, ${lng}], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  var marker = L.marker([${lat}, ${lng}]).addTo(map);
  marker.on('click', function() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage('openMaps');
    }
  });
</script>
</body>
</html>`;
}

export default function LocationMap({
  latitude,
  longitude,
  height = 220,
  label = "Open in Google Maps",
}: {
  latitude: number;
  longitude: number;
  height?: number;
  label?: string;
}) {
  const colors = useColors();
  const html = useMemo(() => buildHtml(latitude, longitude), [latitude, longitude]);

  const openGoogleMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    );
  };

  return (
    <View>
      <View style={[styles.wrap, { height }]}>
        {Platform.OS === "web"
          ? React.createElement("iframe", {
              srcDoc: html,
              title: "location-map",
              style: { border: 0, width: "100%", height: "100%" },
            })
          : WebView && (
              <WebView
                originWhitelist={["*"]}
                source={{ html }}
                scrollEnabled={false}
                nestedScrollEnabled
                style={{ flex: 1 }}
                onMessage={(event: { nativeEvent: { data: string } }) => {
                  if (event.nativeEvent.data === "openMaps") {
                    openGoogleMaps();
                  }
                }}
              />
            )}
      </View>
      <Pressable style={styles.openButton} onPress={openGoogleMaps}>
        <Feather name="external-link" size={14} color={colors.primary} />
        <Text style={[styles.openButtonText, { color: colors.primary }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", borderRadius: 12, overflow: "hidden" },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  openButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
