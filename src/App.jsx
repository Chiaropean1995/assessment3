import { BrowserRouter, Route, Routes, } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import BookingPage from "./pages/BookingPage";
import BookingManagementPage from "./pages/BookingManagementPage"
import './App.css'
import { AuthProvider } from "./components/AuthProvider";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/bookingpage" element={<BookingPage />} />
          <Route path="/bookingmanagementpage" element={<BookingManagementPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}


