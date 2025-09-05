import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Categories from "../../component/dashboard/Catagory.tsx";
import Subcategories from "../../component/dashboard/Subcatagory.tsx";

function Subcatagorys() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1 px-6">
        <Subcategories/>
      </div>
    </div>
  );
}

export default Subcatagorys;
