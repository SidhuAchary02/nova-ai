type CategoryListType = {
  id: number;
  name: string;
  icon: string;
  prompt: string;
};

export const categoryList: CategoryListType[] = [
  {
    id: 1,
    name: "Programming",
    icon: "/thumbnail.png",
    prompt: "development",
  },
  {
    id: 2,
    name: "Business",
    icon: "/thumbnail.png",
    prompt: "business",
  },
  {
    id: 3,
    name: "Finance & Accounting",
    icon: "/thumbnail.png",
    prompt: "finance",
  },
];
