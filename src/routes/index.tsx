import { createBrowserRouter } from "react-router-dom";
import HomeTemplate from "@/pages/HomeTemplate";

export const router = createBrowserRouter([
  { path: "/", element: <HomeTemplate /> },
  // { path: "/login", element: <LoginPage /> },
  // { path: "/register", element: <RegisterPage /> },
]);
