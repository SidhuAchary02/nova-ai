# AI Pipeline Overview

## AI Models Configuration

Your system uses **Groq** as the exclusive AI provider with three tier models:

### Model Tiers

```
HEAVY:   openai/gpt-oss-120b
LESSON:  qwen/qwen3.6-27b
LIGHT:   openai/gpt-oss-20b
```

---

## Generation Pipelines

### 1. **Learning Strategy Pipeline** (HEAVY - openai/gpt-oss-120b)
**Function:** `generateLearningStrategyAction` in [app/actions/generateLearningStrategy.ts](app/actions/generateLearningStrategy.ts#L194)

- Creates personalized learning roadmap (Step 1 of pipeline)
- Outputs JSON with phases, skill graph, timeline
- Temperature: 0.55
- No database write on generation

---

### 2. **Course Structure Pipeline** (HEAVY - openai/gpt-oss-120b)
**Function:** `generateCourseStructureAction` in [app/actions/generateCourseStructureAction.ts](app/actions/generateCourseStructureAction.ts#L21)

- Builds course outline after learning strategy
- Chapter titles, descriptions, durations, subtopics
- JSON output matching courseStructureOutputSchema
- Temperature: 0.55
- Follows learning strategy phases and skill order

---

### 3. **Chapter Content Bundle Pipeline** (LESSON - qwen/qwen3.6-27b)
**Function:** `generateChapterContentBundle` in [configs/ai-models.ts](configs/ai-models.ts)

- Generates complete chapter with sections
- Each section includes:
  - learning_overview
  - deep_explanation (markdown with tables/diagrams)
  - code_sandbox (if applicable)
  - mini_challenge
  - interview_relevance
  - summary_cheat_sheet
- Includes sources (5-8 references)
- JSON output (SYSTEM_PROMPTS.chapterBundle)
- Temperature: 0.65

---

### 4. **Chapter Content MDX Pipeline** (LESSON - qwen/qwen3.6-27b)
**Function:** `generateChapterContentMDX` in [configs/ai-models.ts](configs/ai-models.ts)

- Raw markdown text for course lessons
- Plain text output (no JSON)
- Temperature: 0.65
- Estimated tokens: 2200

---

### 5. **Quiz Generation Pipeline** (LIGHT - openai/gpt-oss-20b)
**Function:** `generateQuizStructured` in [configs/ai-models.ts](configs/ai-models.ts)

- Creates 5 multiple-choice questions
- JSON output with question, options (4), correctAnswer, explanation
- Temperature: 0.4 (low for consistent answers)
- Used in [app/actions/generateQuiz.ts](app/actions/generateQuiz.ts)

---

### 6. **Sources Generation Pipeline** (LIGHT - openai/gpt-oss-20b)
**Function:** `generateSourcesJsonObject` in [configs/ai-models.ts](configs/ai-models.ts)

- Generates 5-8 credible reference sources
- JSON output: { sources: [{ title, url (https), description }] }
- Temperature: 0.55
- Used by [app/actions/generateSourcesAction.ts](app/actions/generateSourcesAction.ts#L38)

---

### 7. **Mermaid Diagram Pipeline** (LESSON - qwen/qwen3.6-27b)
**Function:** `generateMermaidDiagram` in [configs/ai-models.ts](configs/ai-models.ts)

- Generates flowchart/diagram code for lessons
- Plain text Mermaid output (no markdown wrapper)
- 6-12 nodes maximum
- Temperature: 0.3 (very low for technical accuracy)
- Estimated tokens: 700

---

### 8. **Course Layout Pipeline** (HEAVY - openai/gpt-oss-120b)
**Function:** `generateCourseLayout` in [configs/ai-models.ts](configs/ai-models.ts)

- Legacy create flow course outline
- JSON output
- Temperature: 0.7

---

### 9. **Course Title Generation** (HEAVY - openai/gpt-oss-120b)
**Function:** `generateCourseTitleAction` in [app/actions/generateCourseTitleAction.ts](app/actions/generateCourseTitleAction.ts#L20)

- Generates course title from intent/topic
- JSON output
- Used for course naming

---

### 10. **Intent Assist Pipeline** (HEAVY - openai/gpt-oss-120b)
**Function:** `generateIntentAssistAction` in [app/actions/generateIntentAssistAction.ts](app/actions/generateIntentAssistAction.ts#L55)

- Clarifies/suggests course intent
- JSON output
- Helps user refine course topic

---

### 11. **Course Chat Pipeline** (LIGHT - openai/gpt-oss-20b)
**Function:** `generateCourseChatAction` in [app/actions/generateCourseChatAction.ts](app/actions/generateCourseChatAction.ts#L38)

- Real-time chat about course content
- Plain text responses
- Temperature: 0.45
- Model: **LIGHT** (override to "light" for faster responses)
- Maintains message context (last 6 messages)

---

## Key Patterns

### Task Classification
- **Heavy (Default):** Complex reasoning, course architecture, structured planning
- **Lesson:** Content creation, educational materials, markdown output
- **Light:** Quick generation, assessments, references, chat

### Rate Limiting
- Uses Groq key management with budget tracking
- Fallback to pooling system (light/heavy pools)
- Exponential backoff retry (2s → 4s → 8s) on rate limits
- Key rotation when budgets exhausted

### JSON Handling
- All structured outputs use Groq's `json_object` response_format
- Auto-strips markdown code fences from responses
- Schema validation with Zod (learningSchemas)

### Temperature Settings
- 0.3: Diagrams (technical accuracy)
- 0.4: Quizzes (consistency)
- 0.45: Chat (balance)
- 0.55: Roadmaps, sources (some variation)
- 0.65: Chapter content (creative explanations)
- 0.7: Course layout (variety)

---

## Full Pipeline Flow (User Creation)

1. **User Intent** → generateIntentAssistAction (HEAVY)
2. **Learning Strategy** → generateLearningStrategyAction (HEAVY)
3. **Course Structure** → generateCourseStructureAction (HEAVY)
4. **Per Chapter:**
   - Content Bundle → generateChapterContentBundle (LESSON)
   - Or MDX → generateChapterContentMDX (LESSON)
   - Quiz → generateQuizStructured (LIGHT)
   - Sources → generateSourcesJsonObject (LIGHT)
   - Diagrams → generateMermaidDiagram (LESSON)
5. **Stored via** → storeCourseWithLearningPipelineAction

---

## AI Model Usage Summary

| Task | Model | Type | Temperature |
|------|-------|------|---|
| Learning roadmap | openai/gpt-oss-120b | Heavy | 0.55 |
| Course structure | openai/gpt-oss-120b | Heavy | 0.55 |
| Chapter content | qwen/qwen3.6-27b | Lesson | 0.65 |
| Quiz generation | openai/gpt-oss-20b | Light | 0.4 |
| Sources | openai/gpt-oss-20b | Light | 0.55 |
| Diagrams | qwen/qwen3.6-27b | Lesson | 0.3 |
| Course chat | openai/gpt-oss-20b | Light | 0.45 |
| Course title | openai/gpt-oss-120b | Heavy | 0.55 |
| Intent clarification | openai/gpt-oss-120b | Heavy | 0.55 |
| Course layout | openai/gpt-oss-120b | Heavy | 0.7 |
