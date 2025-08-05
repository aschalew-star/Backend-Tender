import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Customers from "../../component/dashboard/Custemers.tsx";

function Customer() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <Customers />
      </div>
    </div>
  );
}

export default Customer;
