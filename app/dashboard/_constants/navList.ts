import { IconType } from "react-icons/lib";
import {
  LuLayoutDashboard,
  LuAtom,
  LuShieldCheck,
  LuUser,
  LuMessageSquare,
  LuBookPlus,
} from "react-icons/lu";

type NavListType = {
  id: number;
  name: string;
  icon: IconType;
  route: string;
};

export const navList: NavListType[] = [
  {
    id: 1,
    name: "Home",
    icon: LuLayoutDashboard,
    route: "/dashboard",
  },
  {
    id: 2,
    name: "Explore",
    icon: LuAtom,
    route: "/dashboard/explore",
  },
  {
    id: 3,
    name: "Create Course",
    icon: LuBookPlus,
    route: "/create-course",
  },
  {
    id: 4,
    name: "Profile",
    icon: LuUser,
    route: "/dashboard/profile",
  },
  {
    id: 5,
    name: "Upgrade",
    icon: LuShieldCheck,
    route: "/dashboard/upgrade",
  },
  {
    id: 6,
    name: "Contact",
    icon: LuMessageSquare,
    route: "/dashboard/contact",
  },
];
