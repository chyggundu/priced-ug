import React, { useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";

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
  var map = L.map('map', { zoomControl: true, dragging: true }).setView([${lat}, ${lng}], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  L.marker([${lat}, ${lng}]).addTo(map);
</script>
</body>
</html>`;
}

export default function ReadOnlyMap({
  latitude,
  longitude,
  height = 200,
}: {
  latitude: number;
  longitude: number;
  height?: number;
}) {
  const html = useMemo(() => buildHtml(latitude, longitude), [latitude, longitude]);

  return (
    <View style={[styles.wrap, { height }]}>
      {Platform.OS === "web"
        ? React.createElement("iframe", {
            srcDoc: html,
            title: "customer-location",
            style: { border: 0, width: "100%", height: "100%" },
          })
        : WebView && (
            <WebView
              originWhitelist={["*"]}
              source={{ html }}
              scrollEnabled={false}
              style={{ flex: 1 }}
            />
          )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", borderRadius: 12, overflow: "hidden" },
});
