import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Alltenders from "../../component/dashboard/Alltenders.tsx";

function Tenders() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <Alltenders />
      </div>
    </div>
  );
}

export default Tenders;
