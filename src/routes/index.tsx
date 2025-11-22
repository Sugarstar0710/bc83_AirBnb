import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "@/pages/AdminTemplate/AdminLayout";
import AdminDashboard from "@/pages/AdminTemplate/AdminDashboard";
import UserManagement from "@/pages/AdminTemplate/UserManagement";  
import RoomManagement from "@/pages/AdminTemplate/RoomManagement";
import LocationManagement from "@/pages/AdminTemplate/LocationManagement";
import BookingManagement from "@/pages/AdminTemplate/BookingManagement";
import HomeLayout from "@/pages/HomeTemplate/HomeLayout";
import HomePage from "@/pages/HomeTemplate/HomePage";
import RoomsPage from "@/pages/HomeTemplate/RoomsPage";
import RoomDetailPage from "@/pages/HomeTemplate/RoomDetailPage";
import ProfilePage from "@/pages/HomeTemplate/ProfilePage";
import LoginPage from "@/pages/LoginPage";

export const router = createBrowserRouter([
  // Customer Routes
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "rooms", element: <RoomsPage /> },
      { path: "rooms/:id", element: <RoomDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "login", element: <LoginPage /> },
      
      // Redirects from old admin routes
      { path: "users", element: <Navigate to="/admin/users" replace /> },
      { path: "locations", element: <Navigate to="/admin/locations" replace /> },
    ],
  },
  
  // Admin Routes
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "rooms", element: <RoomManagement /> },
      { path: "locations", element: <LocationManagement /> },
      { path: "bookings", element: <BookingManagement /> },
    ],
  },
]);
