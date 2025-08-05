import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import EditTender from "../../component/dashboard/EditTender.tsx";

function Tenderedit() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <EditTender />
      </div>
    </div>
  );
}

export default Tenderedit;
