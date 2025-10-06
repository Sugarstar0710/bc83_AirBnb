import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "@/pages/AdminTemplate/AdminLayout";
import AdminDashboard from "@/pages/AdminTemplate/AdminDashboard";
import UserManagement from "@/pages/AdminTemplate/UserManagement";  
import RoomManagement from "@/pages/AdminTemplate/RoomManagement";
import LocationManagement from "@/pages/AdminTemplate/LocationManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "rooms", element: <RoomManagement /> },
      { path: "locations", element: <LocationManagement /> },
    ],
  },
]);
