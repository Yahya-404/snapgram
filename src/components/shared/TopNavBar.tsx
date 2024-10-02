import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthProvider";
import { useSignOutAccount } from "@/lib/TanStack/queries";

// import Images & Icons
import LogoImage from "@/assets/images/logo.svg";
import LogoutIcon from "@/assets/icons/logout.svg";
import ProfileIcon from "@/assets/icons/profile-placeholder.svg";

export const TopNavBar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    // navigate(0) means to reload the page
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <nav className="top-nav-bar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 text-center">
          <img src={LogoImage} alt="logo" width={130} height={325} />
        </Link>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}
          >
            <img src={LogoutIcon} alt="logout" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img
              src={user.imageUrl || ProfileIcon}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};
