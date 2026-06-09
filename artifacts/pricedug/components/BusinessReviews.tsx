import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  useGetBusinessReviews,
  useCreateReview,
  useReplyToReview,
  useDeleteReview,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAppAuth } from "@/context/AuthContext";

function Stars({
  rating,
  size = 16,
  color,
  mutedColor,
  onSelect,
}: {
  rating: number;
  size?: number;
  color: string;
  mutedColor: string;
  onSelect?: (value: number) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= rating;
        const star = (
          <Feather
            name="star"
            size={size}
            color={filled ? color : mutedColor}
            style={filled ? styles.starFilled : undefined}
          />
        );
        if (onSelect) {
          return (
            <Pressable key={value} onPress={() => onSelect(value)} hitSlop={6}>
              {star}
            </Pressable>
          );
        }
        return <View key={value}>{star}</View>;
      })}
    </View>
  );
}

export function BusinessReviews({
  businessId,
  ownerUserId,
}: {
  businessId: number;
  ownerUserId: string;
}) {
  const colors = useColors();
  const { userId, isAdmin } = useAppAuth();

  const { data: reviews = [], isLoading, refetch } = useGetBusinessReviews(businessId);
  const createReview = useCreateReview();
  const replyToReview = useReplyToReview();
  const deleteReview = useDeleteReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

  const isSignedIn = !!userId;
  const isOwner = isSignedIn && userId === ownerUserId;
  const hasReviewed = isSignedIn && reviews.some((r) => r.isMine);
  const canWrite = isSignedIn && !isOwner && !hasReviewed;

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const submitReview = async () => {
    if (rating < 1) {
      Alert.alert("Pick a rating", "Please select between 1 and 5 stars.");
      return;
    }
    try {
      await createReview.mutateAsync({
        businessId,
        data: { rating, comment: comment.trim() || null },
      });
      setRating(0);
      setComment("");
      refetch();
    } catch {
      Alert.alert("Error", "Could not submit your review. Please try again.");
    }
  };

  const submitReply = async (reviewId: number) => {
    const text = (replyTexts[reviewId] ?? "").trim();
    if (!text) return;
    try {
      await replyToReview.mutateAsync({ reviewId, data: { reply: text } });
      setReplyTexts((prev) => ({ ...prev, [reviewId]: "" }));
      refetch();
    } catch {
      Alert.alert("Error", "Could not post your reply. Please try again.");
    }
  };

  const confirmDelete = (reviewId: number) => {
    Alert.alert("Delete review", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview.mutateAsync({ reviewId });
            refetch();
          } catch {
            Alert.alert("Error", "Could not delete the review.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reviews</Text>
        {reviews.length > 0 && (
          <View style={styles.avgRow}>
            <Stars rating={Math.round(avg)} color={colors.primary} mutedColor={colors.border} />
            <Text style={[styles.avgText, { color: colors.mutedForeground }]}>
              {avg.toFixed(1)} ({reviews.length})
            </Text>
          </View>
        )}
      </View>

      {/* Write a review */}
      {canWrite && (
        <View style={[styles.writeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.writeTitle, { color: colors.foreground }]}>Leave a review</Text>
          <Stars
            rating={rating}
            size={28}
            color={colors.primary}
            mutedColor={colors.border}
            onSelect={setRating}
          />
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience (optional)"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[
              styles.input,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
            ]}
          />
          <Pressable
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={submitReview}
            disabled={createReview.isPending}
          >
            {createReview.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit review</Text>
            )}
          </Pressable>
        </View>
      )}

      {!isSignedIn && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Sign in to leave a review.
        </Text>
      )}
      {isSignedIn && isOwner && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          You can reply to reviews about your business below.
        </Text>
      )}

      {/* Review list */}
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="message-square" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No reviews yet
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {reviews.map((review) => (
            <View
              key={review.id}
              style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.reviewHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.author, { color: colors.foreground }]}>
                    {review.authorName}
                  </Text>
                  <Stars rating={review.rating} color={colors.primary} mutedColor={colors.border} />
                </View>
                {isAdmin && (
                  <Pressable onPress={() => confirmDelete(review.id)} hitSlop={8}>
                    <Feather name="trash-2" size={18} color={colors.primary} />
                  </Pressable>
                )}
              </View>

              {review.comment && (
                <Text style={[styles.comment, { color: colors.foreground }]}>{review.comment}</Text>
              )}

              {/* Owner reply (existing) */}
              {review.reply && (
                <View style={[styles.replyBox, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.replyLabel, { color: colors.primary }]}>
                    Owner&apos;s reply
                  </Text>
                  <Text style={[styles.replyText, { color: colors.foreground }]}>{review.reply}</Text>
                </View>
              )}

              {/* Owner reply input */}
              {isOwner && !review.reply && (
                <View style={styles.replyInputRow}>
                  <TextInput
                    value={replyTexts[review.id] ?? ""}
                    onChangeText={(t) => setReplyTexts((prev) => ({ ...prev, [review.id]: t }))}
                    placeholder="Write a reply..."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    style={[
                      styles.input,
                      { flex: 1, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                  <Pressable
                    style={[styles.replyBtn, { backgroundColor: colors.primary }]}
                    onPress={() => submitReply(review.id)}
                    disabled={replyToReview.isPending}
                  >
                    <Feather name="send" size={16} color="#fff" />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, marginTop: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const },
  avgRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  avgText: { fontSize: 13, fontWeight: "600" as const },
  starsRow: { flexDirection: "row", gap: 2 },
  starFilled: { },
  writeCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 12, marginBottom: 16 },
  writeTitle: { fontSize: 15, fontWeight: "600" as const },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 44,
    textAlignVertical: "top",
  },
  submitBtn: { borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" as const },
  hint: { fontSize: 13, marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 14 },
  list: { gap: 12 },
  reviewCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  reviewHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  author: { fontSize: 15, fontWeight: "600" as const, marginBottom: 4 },
  comment: { fontSize: 14, lineHeight: 20 },
  replyBox: { borderRadius: 8, padding: 10, gap: 4, marginTop: 4 },
  replyLabel: { fontSize: 12, fontWeight: "700" as const },
  replyText: { fontSize: 13, lineHeight: 19 },
  replyInputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 4 },
  replyBtn: { width: 44, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
