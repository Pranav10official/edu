import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini initialization as mandated by SKILL.md
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      console.warn(`Model ${model} failed: ${errStr}. Trying next fallback if available...`);
      // If it's a 503 or quota spike, try next model immediately
      if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE') || errStr.includes('429')) {
        continue;
      }
      // For other client errors (e.g. invalid arguments), don't loop endlessly
      break;
    }
  }

  throw lastError;
}

// Helper to format inline image data for Gemini API
function formatImagePart(base64DataUri: string) {
  const match = base64DataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      inlineData: {
        mimeType: match[1],
        data: match[2],
      },
    };
  }
  return {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64DataUri,
    },
  };
}

// 1. AI Personal Tutor
app.post('/api/ai/tutor', async (req, res) => {
  try {
    const {
      message,
      history = [],
      level = 'intermediate', // beginner, intermediate, advanced
      language = 'English',
      image,
      context = '',
    } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    const systemInstruction = `You are "EduGenie", an empathetic, brilliant, world-class AI Personal Tutor.
Your goal is to guide students to genuine mastery through step-by-step, engaging Socratic explanations.
- Explanation mode: ${level.toUpperCase()}.
  * Beginner: Use simple everyday analogies, intuitive breakdowns, no harsh jargon without immediate friendly definition.
  * Intermediate: Standard academic rigor, clear intuitive steps, conceptual depth, practical examples.
  * Advanced: Rigorous terminology, mathematical proofs or theoretical mechanics where appropriate, deep nuances.
- Language: Respond directly and fluently in ${language}. If formulas or technical terms are standard in English or LaTeX, retain them clearly.
- Formatting: Use structured Markdown with bold key terms, numbered steps, bullet points, and code/math blocks.
- End your response with 2-3 short, relevant "Next questions to explore" or "Quick follow-up check" to encourage active recall.
${context ? `Current Context/Subject: ${context}` : ''}`;

    const parts: any[] = [];
    if (image) {
      parts.push(formatImagePart(image));
    }
    parts.push({
      text: `${history.length > 0 ? `Conversation History:\n${history.map((h: any) => `${h.role === 'user' ? 'Student' : 'EduGenie'}: ${h.text}`).join('\n')}\n\n` : ''}Student Query: ${message}`,
    });

    const response = await generateContentWithFallback({
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'I could not generate an answer right now. Please try again.';
    res.json({ reply: text });
  } catch (error: any) {
    console.error('Tutor error:', error);
    res.status(500).json({ error: error.message || 'Failed to get tutor response' });
  }
});

// 2. AI Doubt Solver (with Step-by-Step, Concepts, & Similar Practice Questions)
app.post('/api/ai/doubt-solver', async (req, res) => {
  try {
    const { question, image, subject = 'General Science & Math', language = 'English' } = req.body;

    if (!question && !image) {
      return res.status(400).json({ error: 'Question or image is required' });
    }

    const promptText = `You are EduGenie's Expert Doubt Solver specializing in ${subject}.
Analyze the student's question/problem thoroughly.
DO NOT merely give the final answer. Provide an educational breakdown designed for maximum comprehension.
Language: ${language}.

Return your response in valid JSON matching this structure:
{
  "problemTitle": "Brief descriptive title of the problem",
  "subject": "${subject}",
  "difficulty": "Easy" | "Medium" | "Hard",
  "keyConcepts": ["Concept 1", "Concept 2"],
  "formulasUsed": ["Formula or theorem (if applicable)"],
  "stepByStepSolution": [
    {
      "step": 1,
      "title": "Short title of step",
      "explanation": "Detailed explanation of what is done and why"
    }
  ],
  "finalAnswer": "Clear, highlighted final answer or conclusion",
  "proTipsAndCommonPitfalls": "Crucial tip to avoid mistakes in exams",
  "similarPracticeQuestions": [
    {
      "question": "A similar question for the student to practice",
      "hint": "Gentle nudge",
      "solution": "Brief answer and verification"
    },
    {
      "question": "A slightly tougher variant",
      "hint": "What to watch out for",
      "solution": "Brief answer and verification"
    }
  ]
}

Ensure strictly valid JSON only without codeblock wrapper if possible.
Question details: ${question || 'Analyze the provided image question.'}`;

    const parts: any[] = [];
    if (image) {
      parts.push(formatImagePart(image));
    }
    parts.push({ text: promptText });

    const response = await generateContentWithFallback({
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    let data;
    try {
      data = JSON.parse(response.text || '{}');
    } catch {
      data = { rawText: response.text };
    }

    res.json(data);
  } catch (error: any) {
    console.error('Doubt solver error:', error);
    res.status(500).json({ error: error.message || 'Failed to solve doubt' });
  }
});

// 3. Personalized Study Planner
app.post('/api/ai/study-planner', async (req, res) => {
  try {
    const {
      subjects = [],
      examName = 'Upcoming Examinations',
      examDate,
      dailyHours = 3,
      strengths = '',
      weaknesses = '',
      targetScore = 'A+ / 90%+',
      language = 'English',
    } = req.body;

    const promptText = `You are EduGenie's Senior Academic Strategist.
Create a high-impact, realistic, and motivating personalized study roadmap and daily schedule.
- Exam: ${examName}
- Target Date: ${examDate || 'In 30 days'}
- Available study time: ${dailyHours} hours/day
- Subjects to prepare: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}
- Student Weak Areas: ${weaknesses || 'Needs balanced revision'}
- Student Strong Areas: ${strengths || 'Consistent foundation'}
- Target Goal: ${targetScore}
- Language: ${language}

Generate a comprehensive plan in JSON:
{
  "planTitle": "Study Plan Name",
  "overview": "Encouraging strategic executive summary",
  "weeklyMilestones": [
    { "week": "Week 1", "goal": "Primary focus goal", "priorityTopics": ["Topic A", "Topic B"] }
  ],
  "dailySchedule": [
    {
      "day": "Day 1 (Monday)",
      "dateLabel": "Phase 1: Foundation",
      "focusSubject": "Subject name",
      "allocatedHours": ${dailyHours},
      "tasks": [
        { "id": "task-1", "time": "45 mins", "title": "Concept deep-dive: ...", "type": "study", "completed": false },
        { "id": "task-2", "time": "30 mins", "title": "Active practice & problem solving", "type": "practice", "completed": false },
        { "id": "task-3", "time": "15 mins", "title": "Flashcards & quick recall revision", "type": "revision", "completed": false }
      ]
    },
    {
      "day": "Day 2 (Tuesday)",
      "dateLabel": "Phase 1: Deep Dive",
      "focusSubject": "Subject name",
      "allocatedHours": ${dailyHours},
      "tasks": [
        { "id": "task-4", "time": "50 mins", "title": "Core topic mastery", "type": "study", "completed": false },
        { "id": "task-5", "time": "25 mins", "title": "Quiz testing & weak spot review", "type": "quiz", "completed": false }
      ]
    },
    {
      "day": "Day 3 (Wednesday)",
      "dateLabel": "Phase 1: Application",
      "focusSubject": "Subject name",
      "allocatedHours": ${dailyHours},
      "tasks": [
        { "id": "task-6", "time": "40 mins", "title": "Problem set drills", "type": "practice", "completed": false },
        { "id": "task-7", "time": "30 mins", "title": "Summary notes compilation", "type": "revision", "completed": false }
      ]
    },
    {
      "day": "Day 4 (Thursday)",
      "dateLabel": "Phase 1: Expansion",
      "focusSubject": "Subject name",
      "allocatedHours": ${dailyHours},
      "tasks": [
        { "id": "task-8", "time": "45 mins", "title": "Theory & mechanics", "type": "study", "completed": false },
        { "id": "task-9", "time": "30 mins", "title": "Formula sheet & cheat sheet review", "type": "revision", "completed": false }
      ]
    },
    {
      "day": "Day 5 (Friday)",
      "dateLabel": "Phase 1: Consolidation",
      "focusSubject": "Subject name",
      "allocatedHours": ${dailyHours},
      "tasks": [
        { "id": "task-10", "time": "45 mins", "title": "Cross-topic integration", "type": "study", "completed": false },
        { "id": "task-11", "time": "30 mins", "title": "Timed practice test", "type": "quiz", "completed": false }
      ]
    },
    {
      "day": "Day 6 (Saturday)",
      "dateLabel": "Phase 1: Mock Exam & Deep Review",
      "focusSubject": "Mock Assessment & Weak Areas",
      "allocatedHours": ${dailyHours},
      "tasks": [
        { "id": "task-12", "time": "60 mins", "title": "Full length mock test / comprehensive quiz", "type": "quiz", "completed": false },
        { "id": "task-13", "time": "30 mins", "title": "Error log analysis & remediation", "type": "revision", "completed": false }
      ]
    },
    {
      "day": "Day 7 (Sunday)",
      "dateLabel": "Phase 1: Rest & Spaced Repetition",
      "focusSubject": "Light Revision & Mental Recharge",
      "allocatedHours": 1.5,
      "tasks": [
        { "id": "task-14", "time": "30 mins", "title": "Weekly flashcard lightning round", "type": "revision", "completed": false },
        { "id": "task-15", "time": "30 mins", "title": "Week 2 goals preview & schedule adjustment", "type": "study", "completed": false }
      ]
    }
  ],
  "smartRevisionTips": [
    "Tip 1 on spaced repetition",
    "Tip 2 on active recall",
    "Tip 3 on managing burnout"
  ]
}`;

    const response = await generateContentWithFallback({
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Planner error:', error);
    res.status(500).json({ error: error.message || 'Failed to create plan' });
  }
});

// 4. AI Quiz & Mock Test Generator
app.post('/api/ai/quiz-generator', async (req, res) => {
  try {
    const {
      topic,
      difficulty = 'Medium', // Easy, Medium, Hard
      count = 5,
      types = ['mcq'], // mcq, boolean, fill_blank, short_answer
      contentSource = '',
      language = 'English',
    } = req.body;

    const promptText = `Generate a rigorous, educational quiz testing knowledge of: "${topic}".
Difficulty: ${difficulty}.
Number of questions: ${count}.
Requested Question Types: ${types.join(', ')}.
Language: ${language}.
${contentSource ? `Base the questions primarily on this study material:\n"""\n${contentSource.slice(0, 15000)}\n"""\n` : ''}

Output strictly valid JSON with this structure:
{
  "quizTitle": "Catchy Title for the Quiz",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "type": "mcq", // or "boolean" or "fill_blank" or "short_answer"
      "question": "Clear question text",
      "options": ["Option A", "Option B", "Option C", "Option D"], // required for mcq and boolean (True/False)
      "correctAnswer": "Option A", // The exact text matching the correct option or expected phrase
      "explanation": "Detailed explanation of why this answer is correct and why other options are incorrect",
      "conceptTag": "Specific subtopic tag (e.g. Thermodynamics, Linear Equations)",
      "points": 10
    }
  ]
}`;

    const response = await generateContentWithFallback({
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Quiz generator error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 5. AI Notes Summarizer & Document Analyzer
app.post('/api/ai/notes-summarizer', async (req, res) => {
  try {
    const {
      content,
      mode = 'comprehensive', // 'brief', 'comprehensive', 'exam_revision'
      language = 'English',
      image,
    } = req.body;

    if (!content && !image) {
      return res.status(400).json({ error: 'Content or image document is required' });
    }

    const promptText = `Analyze and transform the provided study notes/document into a high-value structured revision study pack.
Summary Mode: ${mode}.
Language: ${language}.

Return strictly valid JSON:
{
  "title": "Distilled Subject / Document Title",
  "executiveSummary": "2-3 crisp sentences providing the high-level overview",
  "keyConcepts": [
    {
      "heading": "Concept Name",
      "summary": "Clear, intuitive breakdown",
      "importance": "High" | "Medium" | "Core Foundation"
    }
  ],
  "definitionsAndFormulas": [
    {
      "term": "Term or Formula",
      "explanation": "Precise definition or mathematical breakdown"
    }
  ],
  "keyTakeaways": [
    "Bullet point 1",
    "Bullet point 2",
    "Bullet point 3"
  ],
  "keywordsGlossary": [
    { "keyword": "Term", "brief": "Definition" }
  ],
  "quickRevisionFlashPoints": [
    "Quick memory bite 1",
    "Quick memory bite 2"
  ]
}

Document/Notes:\n${content || 'Analyze the attached image document.'}`;

    const parts: any[] = [];
    if (image) {
      parts.push(formatImagePart(image));
    }
    parts.push({ text: promptText });

    const response = await generateContentWithFallback({
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Notes summarizer error:', error);
    res.status(500).json({ error: error.message || 'Failed to summarize notes' });
  }
});

// 6. AI Flashcard Generator
app.post('/api/ai/flashcards', async (req, res) => {
  try {
    const { topic, sourceText, count = 8, language = 'English' } = req.body;

    const promptText = `You are a cognitive learning specialist designing active recall flashcards.
Target Topic: "${topic || 'General Revision'}".
Language: ${language}.
Number of cards: ${count}.
${sourceText ? `Source Content:\n"""\n${sourceText.slice(0, 15000)}\n"""\n` : ''}

Generate high-yield, engaging flashcards formatted in JSON:
{
  "deckTitle": "Flashcard Deck Name",
  "cards": [
    {
      "id": "card-1",
      "question": "Front of card: clear, focused question or prompt",
      "answer": "Back of card: succinct, memorable, complete answer",
      "hint": "Useful memory trigger / mnemonic",
      "category": "Subtopic or Category",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

    const response = await generateContentWithFallback({
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Flashcard generator error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// 7. Programming Assistant (Explain, Debug, Practice Challenges)
app.post('/api/ai/programming', async (req, res) => {
  try {
    const {
      action = 'explain', // 'explain', 'debug', 'practice', 'line_by_line'
      language = 'python',
      code = '',
      errorTrace = '',
      userQuery = '',
    } = req.body;

    const promptText = `You are EduGenie's Senior Software Engineering & Computer Science Mentor.
Target Language: ${language}
Action Requested: ${action.toUpperCase()}
Student Query / Task: ${userQuery || 'Analyze this code'}
${code ? `Code Snippet:\n\`\`\`${language}\n${code}\n\`\`\`\n` : ''}
${errorTrace ? `Error Output / Stack Trace:\n\`\`\`\n${errorTrace}\n\`\`\`\n` : ''}

Return your response in structured JSON:
{
  "action": "${action}",
  "summary": "Crisp overview of the analysis or bug origin",
  "analysis": "In-depth explanation with pedagogical clarity",
  "fixedCode": "Corrected, optimal code snippet (if applicable, or improved refactor)",
  "lineByLine": [
    { "line": "1-3", "explanation": "What this block does" }
  ],
  "timeComplexity": "e.g. O(n log n)",
  "spaceComplexity": "e.g. O(1)",
  "bestPractices": [
    "Point 1",
    "Point 2"
  ],
  "practiceChallenge": {
    "title": "A related coding challenge for the student to attempt",
    "description": "Problem description with input/output examples",
    "starterSnippet": "def solve(...):",
    "hint": "Algorithm suggestion"
  }
}`;

    const response = await generateContentWithFallback({
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Programming assistant error:', error);
    res.status(500).json({ error: error.message || 'Failed to process programming request' });
  }
});

// 8. AI Learning Insights & Weak Topic Recommendations
app.post('/api/ai/learning-insights', async (req, res) => {
  try {
    const {
      quizHistory = [],
      weakTopics = [],
      totalStudyMinutes = 0,
      streakDays = 1,
      level = 'Intermediate',
    } = req.body;

    const promptText = `You are EduGenie's Chief Learning Analytics Advisor.
Analyze the following student metrics and generate empowering, personalized diagnostic insights.
- Level: ${level}
- Total Study Time: ${totalStudyMinutes} minutes
- Current Learning Streak: ${streakDays} days
- Weak / Struggling Topics Identified: ${JSON.stringify(weakTopics)}
- Recent Quiz Attempts: ${JSON.stringify(quizHistory.slice(-5))}

Format response in JSON:
{
  "overallHealth": "Excellent" | "Good" | "Needs Attention",
  "readinessScore": 84, // 0 - 100 percentage
  "strengthsSummary": "Key concepts where student demonstrates strong mastery",
  "criticalWeakAreas": [
    {
      "topic": "Topic Name",
      "urgency": "High" | "Medium",
      "recommendation": "Specific actionable next step to fix this concept"
    }
  ],
  "recommendedActionPlan": [
    {
      "action": "Take a 5-question targeted quiz on ...",
      "type": "quiz",
      "timeEstimate": "10 mins"
    },
    {
      "action": "Review summary flashcards for ...",
      "type": "flashcards",
      "timeEstimate": "5 mins"
    }
  ],
  "motivationalMessage": "Inspiring, personalized encouragement"
}`;

    const response = await generateContentWithFallback({
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Insights error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate learning insights' });
  }
});

// Document Q&A endpoint
app.post('/api/ai/document-qa', async (req, res) => {
  try {
    const { documentText, question, language = 'English' } = req.body;
    if (!documentText || !question) {
      return res.status(400).json({ error: 'Both document text and question are required' });
    }

    const prompt = `You are EduGenie Document Intelligence.
Based STRICTLY on the provided document text, answer the student's question accurately with citations or references to specific sections.
If the answer is not contained in the document, mention this politely and provide contextual academic insight.
Language: ${language}.

Document Text:
"""
${documentText.slice(0, 20000)}
"""

Student Question:
${question}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Doc QA error:', error);
    res.status(500).json({ error: error.message || 'Failed to query document' });
  }
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server running on port ${PORT}`);
  });
}

startServer();
