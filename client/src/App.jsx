import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { useThemeStore } from "@/store/theme";

const App = () => {
  useEffect(() => {
    useThemeStore.getState().initTheme();
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
