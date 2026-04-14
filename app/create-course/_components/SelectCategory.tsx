import React, { useContext } from "react";
import { categoryList } from "../_shared/CategoryList";
import { UserInputContext } from "@/app/_context/UserInputContext";

const SelectCategory = () => {
  const { userInput, setUserInput } = useContext(UserInputContext);

  const handleCategorySelect = (category: string) => {
    setUserInput((prev) => ({ ...prev, category }));
  };

  return (
    <div>
      <h2 className="mb-5 text-lg font-medium text-slate-100">Select the course category</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {categoryList.map((category, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-slate-800/70 cursor-pointer ${
              userInput?.category === category.name
                ? "border-primary/70 bg-slate-800/80"
                : "border-white/10 bg-slate-900/60"
            }`}
            onClick={() => handleCategorySelect(category.name)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`} />
            <div className="relative z-10">
              <div className="mb-3 text-3xl">{category.icon}</div>
              <h2 className="text-lg font-semibold text-slate-100">{category.name}</h2>
              <p className="mt-1 text-sm text-slate-300">{category.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectCategory;
