import { Outlet } from "react-router-dom";
import {
  AsideNavBar,
  BottomNavBar,
  TopNavBar,
} from "@/components/shared/routes";

const RootLayout = () => {
  return (
    <main className="w-full md:flex">
      <TopNavBar />
      <AsideNavBar />
      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      <BottomNavBar />
    </main>
  );
};

export default RootLayout;
