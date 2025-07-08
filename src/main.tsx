import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ResetPassword from './pages/ResetPassword'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
