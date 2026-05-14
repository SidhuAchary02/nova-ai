import { LessonSectionType } from "@/types/types";

export const mockTechnicalLesson: LessonSectionType = {
  title: "React State as a Control Panel",
  blocks: [
    {
      type: "hero",
      title: "React State",
      subtitle: "State is the memory that makes UI feel alive.",
      estimatedMinutes: "6 min",
      difficulty: "Beginner",
      note: "We start with intuition, then move to implementation.",
    },
    {
      type: "insight",
      content: "If props are the input wires, state is the local memory inside a component.",
      accent: "violet",
    },
    {
      type: "diagram",
      title: "How data flows",
      description: "The same idea can be understood as a simple loop.",
      nodes: ["User action", "setState", "Re-render", "Updated UI"],
      edges: [
        { from: "User action", to: "setState" },
        { from: "setState", to: "Re-render" },
        { from: "Re-render", to: "Updated UI" },
      ],
    },
    {
      type: "code",
      language: "javascript",
      initialCode: `import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
      explanation: "A tiny interactive example that makes the mental model stick.",
    },
    {
      type: "summary",
      takeaways: [
        "State stores changing values inside a component.",
        "Updating state triggers a re-render.",
        "Use state when the UI must remember something.",
      ],
    },
  ],
  learning_overview: "Start with intuition, then jump into an interactive example.",
  deep_explanation: "This lesson is intentionally structured as a sequence of visual blocks rather than one long article.",
};

export const mockTheoryLesson: LessonSectionType = {
  title: "Why Systems Need Feedback Loops",
  blocks: [
    {
      type: "hero",
      title: "Feedback Loops",
      subtitle: "A simple way to understand how systems improve over time.",
      estimatedMinutes: "5 min",
      difficulty: "Intermediate",
      note: "This is a good place for analogy and comparison.",
    },
    {
      type: "analogy",
      analogy: "A feedback loop is like a thermostat: it measures, compares, and adjusts.",
      explanation: "When the room gets too cold, the heater turns on. When the goal is reached, it turns off. Learning systems behave similarly.",
    },
    {
      type: "table",
      title: "Positive vs negative feedback",
      headers: ["Type", "What it does", "Example"],
      rows: [
        ["Positive", "Amplifies change", "Viral growth"],
        ["Negative", "Reduces drift", "Thermostat control"],
      ],
    },
    {
      type: "practice",
      title: "Reflection task",
      tasks: [
        "Identify one feedback loop in a product you use daily.",
        "Explain what signal is measured and what action follows.",
      ],
    },
    {
      type: "summary",
      takeaways: [
        "Feedback loops help systems self-correct.",
        "They are common in products, markets, and learning.",
      ],
    },
  ],
};
