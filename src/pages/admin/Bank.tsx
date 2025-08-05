import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Banks from "../../component/dashboard/Banks.tsx";

function Bank() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1">
        <Banks />
      </div>
    </div>
  );
}

export default Bank;
