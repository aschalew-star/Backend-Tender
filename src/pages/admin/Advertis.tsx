import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Advertisements from "../../component/dashboard/Advertisment.tsx";


function Advertis() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1 px-6">
        <Advertisements />
      </div>
    </div>
  );
}

export default Advertis;
