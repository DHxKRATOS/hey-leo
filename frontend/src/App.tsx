import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AppRouter } from "./components/AppRouter";
import { ToastProvider } from "./components/ui/toast";

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <div>
          <AppRouter />
        </div>
      </ToastProvider>
    </Provider>
  );
}

export default App;
