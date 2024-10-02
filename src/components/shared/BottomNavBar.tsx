import { Link, useLocation } from "react-router-dom";

import { Links } from "@/constants";
import { INavLink } from "@/types";

export const BottomNavBar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav-bar">
      {Links.map((link: INavLink) => {
        const isActive = pathname === link.route;
        return (
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`flex-center flex-col gap-1 p-2 transition ${
              isActive && "rounded-[10px] bg-primary-500"
            }`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              width={16}
              height={16}
              className={`${isActive && "invert-white"}`}
            />
            <p className="tiny-medium text-light-2">{link.label}</p>
          </Link>
        );
      })}
    </nav>
  );
};
