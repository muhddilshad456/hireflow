import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../types/authTypes";

const initialState: AuthState = {
  user: null,
  token: null,
};

interface setCredentialsPayload {
  user: User | null;
  token: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<setCredentialsPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, updateToken, logout } = authSlice.actions;
export default authSlice.reducer;
