import { Navigate, Outlet } from "react-router-dom";

// import Images & Icons
import BannerImage from "@/assets/images/side-img.svg";

const AuthLayout = () => {
  const isAuthenticated = false;
  return (
    <>
      {isAuthenticated ? (
        // Navigate: Is A Hidden Element, Its used to programmatically redirect the User to another path based on a specific condition or event.
        <Navigate to="/" />
      ) : (
        <>
          <main className="flex flex-1 justify-center items-center">
            <Outlet />
          </main>
          <img
            src={BannerImage}
            alt="banner"
            className="hidden xl:block h-screen w-1/2 object-cover"
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;
