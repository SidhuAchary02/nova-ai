import {
  UserInputContext,
} from "@/app/_context/UserInputContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserInputType } from "@/types/types";
import { useContext, useState } from "react";

const SelectOption = () => {
  const { userInput, setUserInput } = useContext(UserInputContext);
  const [chaptersError, setChaptersError] = useState<string>("");

  const handleInputChange = (
    fieldName: keyof UserInputType,
    value: string | number
  ) => {
    if (fieldName === "totalChapters") {
      const numValue = Number(value);
      if (numValue < 1) {
        setChaptersError("Minimum 1 chapter required");
        return;
      }
      if (numValue > 20) {
        setChaptersError("Maximum 20 chapters allowed");
        return;
      }
      setChaptersError("");
    }
    setUserInput((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-nova-heading">Difficulty Level</label>
          <Select
            onValueChange={(value) => handleInputChange("difficulty", value)}
            defaultValue={userInput?.difficulty}
          >
            <SelectTrigger className="h-11 border-black/10 bg-nova-bg/70 text-nova-heading">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advance">Advance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-nova-heading">Course Duration (Days)</label>
          <Select
            onValueChange={(value) => handleInputChange("duration", value)}
            defaultValue={userInput?.duration}
          >
            <SelectTrigger className="h-11 border-black/10 bg-nova-bg/70 text-nova-heading">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 Day">1 Day</SelectItem>
              <SelectItem value="3 Days">3 Days</SelectItem>
              <SelectItem value="5 Days">5 Days</SelectItem>
              <SelectItem value="7 Days">7 Days</SelectItem>
              <SelectItem value="10 Days">10 Days</SelectItem>
              <SelectItem value="15 Days">15 Days (Max)</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-nova-body">Maximum course duration is 15 days</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-nova-heading">Add Video</label>
          <Select
            onValueChange={(value) => handleInputChange("video", value)}
            defaultValue={userInput?.video}
          >
            <SelectTrigger className="h-11 border-black/10 bg-nova-bg/70 text-nova-heading">
              <SelectValue placeholder="Select Option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-nova-heading">Number of Chapters</label>
          <Input
            type="number"
            min="1"
            max="20"
            placeholder="Enter chapters (1-20)"
            onChange={(e) => handleInputChange("totalChapters", e.target.value)}
            defaultValue={userInput?.totalChapters}
            className={`h-11 border-black/10 bg-nova-bg/70 text-nova-heading ${chaptersError ? "border-red-500" : ""}`}
          />
          {chaptersError && (
            <p className="text-xs text-red-500 mt-1 font-medium">{chaptersError}</p>
          )}
          <p className="mt-1 text-xs text-nova-body">Minimum 1, Maximum 20 chapters</p>
        </div>
      </div>
    </div>
  );
};

export default SelectOption;
