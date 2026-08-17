import React, { useEffect } from "react";
import { Modal, View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";

type Props = {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
};

export default function VideoModal({ visible, uri, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(uri ?? "", (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (visible && uri) {
      player.play();
    } else {
      player.pause();
    }
  }, [visible, uri, player]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={12}
        >
          <Feather name="x" size={26} color="#fff" />
        </Pressable>
        {uri ? (
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture={false}
            nativeControls
          />
        ) : (
          <ActivityIndicator color="#fff" />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", alignItems: "center", justifyContent: "center" },
  video: { width: "100%", height: "60%" },
  closeBtn: { position: "absolute", right: 16, zIndex: 10 },
});
