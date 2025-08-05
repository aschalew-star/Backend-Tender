import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import TenderCreate from "./pages/admin/TenderCreate.tsx";
import Dashboardoverview from "./pages/admin/DashboardOverveiw.tsx";
import Login from "./pages/Login.tsx";
import Payment from "./pages/admin/Payments.tsx";
import Notification from "./pages/admin/Notification.tsx";
import SystemUser from "./pages/admin/SystemUsers.tsx"; // Assuming you have a SystemUser page
import Customers from "./pages/admin/Customer.tsx"; // Assuming you have a Customer page
import Bank from "./pages/admin/Bank.tsx"; // Assuming you have a Bank page
import Region from "./pages/admin/Region.tsx";
import Activity from "./pages/admin/Activity.tsx"; // Assuming you have an Activity page
import Tenders from "./pages/admin/Tenders.tsx"; // Assuming you have a Tenders page
import Signup from "./pages/Signup.tsx"; // Assuming you have a Signup page
import Tenderedit from "./pages/admin/Tenderedit.tsx"; // Importing the Tenderedit component
import SystemUsers from "./pages/admin/System-user.tsx"; // Importing the SystemUser component
import Createpayment from "./pages/admin/Createpayment.tsx"; // Importing the Createpayment component



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/tender-create" element={<TenderCreate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup  />} />
        <Route path="/admin/dashboard" element={<Dashboardoverview />} />
        <Route path="/admin/Payment" element={<Payment />} />
        <Route path="/admin/Payment/create" element={<Createpayment />} />
        <Route path="/admin/Notification" element={<Notification />} />
        <Route path="/admin/Tenders" element={<Tenders />} />
        <Route path="/admin/SystemUser" element={<SystemUser />} />
        <Route path="/admin/Customers" element={<Customers />} />
        <Route path="/admin/Bank" element={<Bank />} />
        <Route path="/admin/Region" element={<Region />} />
        <Route path="/admin/Activity" element={<Activity />} />
        <Route path="/edit-tender/:id" element={<Tenderedit />} />
        <Route path="/admin/SystemUser/create" element={<SystemUsers />} />
        {/* <Route path="/admin/create" element={<div>Create Tender Page (Placeholder)</div>} />
        <Route path="/admin/categories" element={<div>Categories Page (Placeholder)</div>} />
        <Route path="/admin/settings" element={<div>Settings Page (Placeholder)</div>} />
        <Route path="*" element={<Overview />} /> {/* Fallback to Dashboard */} 
      </Routes>
    </Router>
  );
}

export default App;