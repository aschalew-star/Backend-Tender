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
import Home from "./pages/Home.tsx"; // Importing the Home component
import AllTender from "./pages/AllTender.tsx";
import WrappedTenderDocPage from "./pages/TenderDoc.tsx";
import TenderDetailPage  from "./pages/TenderDetailpage"
import StartPage from "./pages/Startpage"
import NotificationSettingsPage from "./pages/NotificationSettingPage.tsx";
import Billing from "./pages/Billing.tsx";
import NotificationPage from "./pages/NotificationPage.tsx";
import { CheckoutPage } from "./pages/Checkout.tsx";
import FAQ from "./pages/FAQ.tsx";
import Categoriess from "./pages/admin/Catagory.tsx";
import Advertis from "./pages/admin/Advertis"
import Subcatagorys from "./pages/admin/Subcatagorys.tsx"
import Apppp from "./pages/AddisTender"
import PurchasedDocuments from "./pages/Userpurchased.tsx";
 import Profile from "./pages/Profile.tsx";



function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/Tenders" element={<AllTender />} />
        <Route path="/land-lease" element={<Apppp />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/documents/purchased" element={<PurchasedDocuments />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path="/Documents" element={<WrappedTenderDocPage />} />
        <Route path="/TenderDetailPage/:id" element={<TenderDetailPage />} />
        <Route path="/home" element={<StartPage/>} />
        <Route path="/alerts/email" element={<NotificationSettingsPage/>} />
        <Route path="/account/billing" element={<Billing />} />
        <Route path="/Notifications" element={<NotificationPage/>} />
           
         {/* Admin/dashboard  pages */}
        <Route path="/admin/tender-create" element={<TenderCreate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup  />} />
        <Route path="/admin/Categories" element={<Categoriess/>} />
        <Route path="/admin/Subcategories" element={<Subcatagorys/>} />
        <Route path="/admin/Advertisement" element={<Advertis/>} />
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
      </Routes>
    </Router>
  );
}

export default App;