type CategoryListType = {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
  prompt: string;
};

export const categoryList: CategoryListType[] = [
  {
    id: 1,
    name: "Programming",
    icon: "💻",
    description: "Web dev, DSA, software engineering, and coding skills",
    color: "from-violet-500/30 to-fuchsia-500/10",
    prompt: "development",
  },
  {
    id: 2,
    name: "Business",
    icon: "📈",
    description: "Strategy, entrepreneurship, and business fundamentals",
    color: "from-amber-500/30 to-orange-500/10",
    prompt: "business",
  },
  {
    id: 3,
    name: "Finance & Accounting",
    icon: "💼",
    description: "Financial literacy, accounting, and investment topics",
    color: "from-emerald-500/30 to-teal-500/10",
    prompt: "finance",
  },
];
