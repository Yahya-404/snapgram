import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { Links } from "@/constants";
import { Button } from "../ui/button";
import { INavLink } from "@/types";
import { INITIAL_USER, useUserContext } from "@/context/AuthProvider";
import { useSignOutAccount } from "@/lib/TanStack/queries";

// import Images & Icons
import LogoImage from "@/assets/images/logo.svg";
import ProfileIcon from "@/assets/icons/profile-placeholder.svg";
import LogoutIcon from "@/assets/icons/logout.svg";

export const AsideNavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setIsAuthenticated, setUser } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const { user } = useUserContext();

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/sign-in");
  };

  return (
    <aside className="aside-nav-bar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 text-center">
          <img src={LogoImage} alt="logo" width={170} height={36} />
        </Link>
        <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
          <img
            src={user.imageUrl || ProfileIcon}
            alt="profile"
            className="h-14 w-14 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-light-3">@{user.username}</p>
          </div>
        </Link>
        <ul className="flex flex-col gap-5">
          {Links.map((link: INavLink) => {
            const isActive = pathname === link.route;
            return (
              <li
                key={link.label}
                className={`aside-link group ${isActive && "bg-primary-500"}`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${
                      isActive && "invert-white"
                    }`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
        <Button
          variant="ghost"
          className="shad-button_ghost"
          onClick={(e) => handleSignOut(e)}
        >
          <img src={LogoutIcon} alt="logout" />
          <p className="small-medium lg:base-medium">logout</p>
        </Button>
      </div>
    </aside>
  );
};
