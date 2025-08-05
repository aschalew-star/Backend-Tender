import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Notifications from "../../component/dashboard/Notifications.tsx";

function Notification() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <Notifications />
      </div>
    </div>
  );
}

export default Notification;
