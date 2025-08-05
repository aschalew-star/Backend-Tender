import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import ActivityLogs from "../../component/dashboard/ActivityLogs.tsx";

function Activity() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <ActivityLogs />
      </div>
    </div>
  );
}

export default Activity;
