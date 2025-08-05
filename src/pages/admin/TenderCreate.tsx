import { AppSidebar } from '../../component/dashboard/Layout/AppSidebar.tsx';
 import { CreateTender } from "../../component/dashboard/CreateTender.tsx";


function TenderCreate() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
      <AppSidebar />
      </div>

      <div className="flex-1">
            <CreateTender />
            </div>
    </div>
  );
}

export default TenderCreate;