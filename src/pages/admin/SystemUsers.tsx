import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import SystemUsers from "../../component/dashboard/SystemUser.tsx";

function SystemUser() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <SystemUsers />
      </div>
    </div>
  );
}

export default SystemUser;
