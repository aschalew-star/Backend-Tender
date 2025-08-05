import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Overview from "../../component/dashboard/Dashboardoverview.tsx";

function Dashboardoverview() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <Overview />
      </div>
    </div>
  );
}

export default Dashboardoverview;
