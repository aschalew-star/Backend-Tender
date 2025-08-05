import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import { PaymentForm } from "../../component/dashboard/Createpayment.tsx";

function Createpayment() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <PaymentForm/>
      </div>
    </div>
  );
}

export default Createpayment;
