import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/es/storage";

console.log("storage value:", storage);

const persistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
