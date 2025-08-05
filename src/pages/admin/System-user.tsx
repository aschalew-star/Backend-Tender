import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import CreateSystemUser from "../../component/dashboard/CreateSystemUser.tsx";

function SystemUsers() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <CreateSystemUser />
      </div>
    </div>
  );
}

export default SystemUsers;
