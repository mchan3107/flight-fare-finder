import { Navigate, createBrowserRouter } from "react-router-dom";

import RootLayout from "./routes/RootLayout";
import ErrorBoundaryPage from "./routes/ErrorBoundaryPage";
import Landing from "./routes/Landing";
import AuthPage from "./routes/AuthPage";
import WatchesPage from "./routes/WatchesPage";
import { protectedLoader } from "./routes/protectedLoader";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      { index: true, element: <Landing /> },
      { path: "sign-in", element: <AuthPage mode="signin" /> },
      { path: "sign-up", element: <AuthPage mode="signup" /> },
      // Back-compat with the old combined /auth route.
      { path: "auth", element: <Navigate to="/sign-in" replace /> },
      {
        path: "app",
        loader: protectedLoader,
        element: <WatchesPage />,
      },
    ],
  },
]);
