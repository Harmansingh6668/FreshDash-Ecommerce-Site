import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import AdminLayout from "../Components/layout/AdminLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Products from "../pages/Products/Products";
import CreateProduct from "../pages/Products/CreateProduct";
import EditProduct from "../pages/Products/EditProduct";
import CreateCategory from "../pages/Categories/CreateCategory";
import Categories from "../pages/Categories/Categories";
import Orders from "../pages/Orders/Orders";
import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";
import { getAdminProfile } from "../services/api";

function AdminGuard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getAdminProfile()
      .then(() => setStatus("authenticated"))
      .catch(() => { setStatus("unauthenticated"); navigate("/login", { replace: true }); });
  }, [navigate]);

  return status === "authenticated" ? <Outlet /> : null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
  
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
        {/* <Route index element={<Navigate to="/admin/dashboard" replace />} /> */}

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<CreateProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
             <Route path="categories" element={<Categories />} />
             <Route path="categories/create" element={<CreateCategory />} />
                 <Route path="orders" element={<Orders />} />
                 <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                 
          
    
    

        

       
         
        </Route>
        </Route>
         <Route
          path="*"
          element={<Navigate to="/admin/dashboard" replace />}
        />

       
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;