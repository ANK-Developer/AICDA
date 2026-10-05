import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/services/api/baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    // File uploads (FormData/File) are passed as request args, which are not serialisable.
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }).concat(
      baseApi.middleware,
    ),
});
