import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Categories } from "./pages/Categories";
import { Packages } from "./pages/Packages";
import { Secrets } from "./pages/Secrets";
import { Orders } from "./pages/Orders";
import { Shipping } from "./pages/Shipping";
import { Announcements } from "./pages/Announcements";
import { Roles } from "./pages/Roles";
import { Accounts } from "./pages/Accounts";
import { Channels } from "./pages/Channels";
import { SubTenants } from "./pages/SubTenants";
import { Login } from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="packages" element={<Packages />} />
          <Route path="secrets" element={<Secrets />} />
          <Route path="orders" element={<Orders />} />
          <Route path="shipping-templates" element={<Shipping />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="roles" element={<Roles />} />
          <Route path="users" element={<Accounts />} />
          <Route path="channels" element={<Channels />} />
          <Route path="sub-tenants" element={<SubTenants />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
