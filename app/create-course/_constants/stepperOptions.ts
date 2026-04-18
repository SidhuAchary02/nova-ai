import { IconType } from "react-icons/lib";
import {
  FaBookOpen,
  FaBullseye,
  FaChartLine,
  FaClock,
  FaLayerGroup,
  FaListCheck,
  FaSliders,
} from "react-icons/fa6";

export type StepperOption = {
  id: number;
  /** Compact label under the mini stepper */
  shortLabel: string;
  name: string;
  icon: IconType;
};

/**
 * Seven-step onboarding before roadmap generation.
 * Labels match the AI assistant flow (intent → review).
 */
export const stepperOptions: StepperOption[] = [
  { id: 1, shortLabel: "Intent", name: "Course intent", icon: FaBookOpen },
  { id: 2, shortLabel: "Goal", name: "Your goal", icon: FaBullseye },
  { id: 3, shortLabel: "Level", name: "Starting level", icon: FaChartLine },
  { id: 4, shortLabel: "Time", name: "Time commitment", icon: FaClock },
  { id: 5, shortLabel: "Style", name: "Learning style", icon: FaLayerGroup },
  { id: 6, shortLabel: "Extras", name: "Customization", icon: FaSliders },
  { id: 7, shortLabel: "Review", name: "Review", icon: FaListCheck },
];
