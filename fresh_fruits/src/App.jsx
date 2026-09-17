import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";
// import './App.css'
import Home from "./pages/Home";
import Fruits from "./pages/Fruits";
import Vegetables from "./pages/Vegetables";
import Leafygreen from "./pages/Leafygreen";
import Offers from "./pages/Offers";
import BestSellers from "./pages/BestSellers";

import Organic from "./pages/Organic";
import ProductDetails from  "./pages/ProductDetails";


import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import OrderSuccess from "./pages/OrderSuccess";
import OrderDetails from "./pages/OrderDetails";
import Boilerplate from "./components/Boilerplate";
import { getUserProfile } from "./services/api";

function UserGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getUserProfile()
      .then(() => setStatus("authenticated"))
      .catch(() => {
        setStatus("unauthenticated");
        navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
      });
  }, [location.pathname, navigate]);
 
  return status === "authenticated" ? <Outlet /> : null;
}




function App() {

  return(
    <>
       <BrowserRouter>  
      
     <Routes>
      <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login initialMode="register" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<UserGuard />}>
            <Route element={<Boilerplate />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>
          </Route>
          <Route element={<Boilerplate />}>
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/order-details" element={<OrderDetails />} />
            <Route path="/" element={<Home />} />
            <Route path="/fruits" element={<Fruits />} />
            <Route path="/vegetables" element={<Vegetables />}></Route>
            <Route path="/Leafygreen" element={<Leafygreen/>}></Route>
            <Route path="/Organic" element={<Organic/>}></Route>
            <Route path="/offers" element={<Offers/>}></Route>
            <Route path="/best-sellers" element={<BestSellers/>}></Route>
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />



          </Route>
      </Routes>
       </BrowserRouter>

    
    
    
    
    </>



  )
  
  
  
}

export default App
