import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Regions from "../../component/dashboard/regions.tsx";

function Region() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <Regions />
      </div>
    </div>
  );
}

export default Region;
