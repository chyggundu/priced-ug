import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, type Query } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /*
        Cached data renders immediately and refreshes behind it, so returning
        to a screen never shows a spinner over data already held.
      */
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
      // Refetching on every focus made the browse feed re-request on each tab
      // switch, for data that had not changed.
      refetchOnWindowFocus: false,
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "pricedug.query-cache",
  // Writing on every cache mutation would thrash the bridge while scrolling
  // pulls in pages; once a second is frequent enough to survive a kill.
  throttleTime: 1000,
});

/*
  Only public, non-personal data is written to disk.

  Restoring a signed-in user's business, customer profile or the admin lists
  from disk would show the previous account's data for a frame after a sign-out
  or an account switch — those refetch from the network instead. Products,
  categories and the city list are identical for everyone, so they are what
  makes the first frame useful.
*/
const PERSISTED_KEYS = new Set(["products", "categories", "cities"]);

export const persistOptions = {
  persister,
  maxAge: 24 * 60 * 60 * 1000,
  // Bump when a cached shape changes, so old entries are discarded rather than
  // deserialised into the wrong type.
  buster: "v2",
  dehydrateOptions: {
    shouldDehydrateQuery: (query: Query) => {
      if (query.state.status !== "success") return false;
      const root = query.queryKey[0];
      return typeof root === "string" && PERSISTED_KEYS.has(root);
    },
  },
};
