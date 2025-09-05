import { AppSidebar } from "../../component/dashboard/Layout/AppSidebar.tsx";
import Categories from "../../component/dashboard/Catagory.tsx";

function Categoriess() {
  return (
    <div className="bg-white  min-h-screen flex ">
      <div>
        <AppSidebar />
      </div>

      <div className="flex-1 px-6">
        <Categories />
      </div>
    </div>
  );
}

export default Categoriess;
