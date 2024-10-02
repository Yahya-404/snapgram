// import Images & Icons
import HomeIcon from "@/assets/icons/home.svg";
import WallpaperIcon from "@/assets/icons/wallpaper.svg";
import PeopleIcon from "@/assets/icons/people.svg";
import BookmarkIcon from "@/assets/icons/bookmark.svg";
import GalleryIcon from "@/assets/icons/gallery-add.svg";

export const Links = [
  {
    imgURL: HomeIcon,
    route: "/",
    label: "Home",
  },
  {
    imgURL: WallpaperIcon,
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: PeopleIcon,
    route: "/users-community",
    label: "People",
  },
  {
    imgURL: BookmarkIcon,
    route: "/saved",
    label: "Saved",
  },
  {
    imgURL: GalleryIcon,
    route: "/create-post",
    label: "Create Post",
  },
];
