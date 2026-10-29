import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { SocketProvider } from "../context/SocketContext.tsx";
import { NotificationProvider } from "../context/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <SocketProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </SocketProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
