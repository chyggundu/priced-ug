import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/expo";
import {
  useGetFavorites,
  useAddFavoriteBusiness,
  useRemoveFavoriteBusiness,
  useAddFavoriteProduct,
  useRemoveFavoriteProduct,
  getGetFavoritesQueryKey,
} from "@workspace/api-client-react";

export function useFavorites() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetFavorites({
    query: { enabled: !!isSignedIn, queryKey: getGetFavoritesQueryKey() },
  });

  const favoriteBusinessIds = new Set((data?.businesses ?? []).map((b) => b.id));
  const favoriteProductIds = new Set((data?.products ?? []).map((p) => p.id));

  // Per-item in-flight locks so rapid taps can't fire duplicate mutations
  // against a stale snapshot (e.g. add+add instead of add+remove).
  const pendingBusinesses = useRef(new Set<number>());
  const pendingProducts = useRef(new Set<number>());

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() }),
    [queryClient],
  );

  const addBiz = useAddFavoriteBusiness();
  const removeBiz = useRemoveFavoriteBusiness();
  const addProd = useAddFavoriteProduct();
  const removeProd = useRemoveFavoriteProduct();

  const toggleBusiness = useCallback(
    (businessId: number) => {
      if (pendingBusinesses.current.has(businessId)) return;
      pendingBusinesses.current.add(businessId);
      const mutation = favoriteBusinessIds.has(businessId) ? removeBiz : addBiz;
      mutation.mutate(
        { businessId },
        {
          onSettled: async () => {
            await invalidate();
            pendingBusinesses.current.delete(businessId);
          },
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, addBiz.mutate, removeBiz.mutate, invalidate],
  );

  const toggleProduct = useCallback(
    (productId: number) => {
      if (pendingProducts.current.has(productId)) return;
      pendingProducts.current.add(productId);
      const mutation = favoriteProductIds.has(productId) ? removeProd : addProd;
      mutation.mutate(
        { productId },
        {
          onSettled: async () => {
            await invalidate();
            pendingProducts.current.delete(productId);
          },
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, addProd.mutate, removeProd.mutate, invalidate],
  );

  return {
    isSignedIn: !!isSignedIn,
    isLoading,
    favorites: data,
    isBusinessFavorite: (id: number) => favoriteBusinessIds.has(id),
    isProductFavorite: (id: number) => favoriteProductIds.has(id),
    toggleBusiness,
    toggleProduct,
  };
}
