import React from "react";
import { View, StyleSheet } from "react-native";
import ReadOnlyMap from "./ReadOnlyMap";
import { geocode, type Coords } from "@/lib/geocode";

/**
 * The map inside the business details card: the stored pin when there is one,
 * otherwise the written address geocoded on the fly. Renders nothing — not even
 * its divider — when the location cannot be placed at all.
 */
export function BusinessLocationMap({
  latitude,
  longitude,
  query,
  borderColor,
}: {
  latitude: number | null;
  longitude: number | null;
  query: string | null;
  borderColor: string;
}) {
  const stored: Coords | null =
    latitude != null && longitude != null ? { latitude, longitude } : null;
  const [coords, setCoords] = React.useState<Coords | null>(stored);

  React.useEffect(() => {
    if (latitude != null && longitude != null) {
      setCoords({ latitude, longitude });
      return;
    }
    if (!query) {
      setCoords(null);
      return;
    }
    let active = true;
    geocode(query).then((hit) => {
      if (active) setCoords(hit);
    });
    return () => {
      active = false;
    };
  }, [latitude, longitude, query]);

  if (!coords) return null;

  return (
    <>
      <View style={[styles.separator, { backgroundColor: borderColor }]} />
      <ReadOnlyMap
        latitude={coords.latitude}
        longitude={coords.longitude}
        height={200}
        rounded={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  separator: { height: 1, marginLeft: 14 },
});
