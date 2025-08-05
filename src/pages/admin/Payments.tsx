import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Payments from "../../component/dashboard/Payment";

function Payment() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <Payments />
      </div>
    </div>
  );
}

export default Payment;
