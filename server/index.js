import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3001;

// Your frontend URL
const FRONTEND_URL =
  'https://ideal-couscous-vpgvgrj6qv442w4p-5173.app.github.dev';

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/*
====================================================
BREAK DOWN TASKS
====================================================
*/

app.post('/api/break-down', async (req, res) => {
  try {
    const tasks = req.body.tasks;

    console.log('Received tasks for break down:', tasks);

    if (!tasks || tasks.length === 0) {
      return res.status(400).json({
        error: 'No tasks were provided.',
      });
    }

    const prompt = `
You are a helpful productivity assistant.

Break down each of the user's to-do list tasks into smaller,
manageable subtasks.

For each task:

- Create 3 to 6 useful subtasks.
- Make each subtask something the user could realistically complete.
- Keep the subtasks specific and actionable.
- Do not change the original task.
- Do not add unnecessary subtasks.

Here are the user's tasks:

${JSON.stringify(tasks, null, 2)}

Return ONLY valid JSON in this exact format:

{
  "tasks": [
    {
      "taskId": "original task id",
      "subtasks": [
        "subtask 1",
        "subtask 2",
        "subtask 3"
      ]
    }
  ]
}
`;

    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        break;
      } catch (error) {
        console.error(
          `Gemini break-down attempt ${attempt} failed:`,
          error
        );

        if (error.status === 503 && attempt < 3) {
          console.log('Retrying Gemini...');

          await new Promise((resolve) =>
            setTimeout(resolve, 5000)
          );
        } else {
          throw error;
        }
      }
    }

    if (!response) {
      throw new Error(
        'Gemini did not return a response.'
      );
    }

    const result = JSON.parse(response.text);

    console.log('Gemini break-down result:', result);

    res.json(result);
  } catch (error) {
    console.error(
      'Break down error:',
      error
    );

    res.status(500).json({
      error:
        'Something went wrong while breaking down the tasks.',
    });
  }
});

/*
====================================================
CREATE SCHEDULE
====================================================
*/

app.post('/api/create-schedule', async (req, res) => {
  try {
    const tasks = req.body.tasks;

    console.log(
      'Received tasks for schedule:',
      tasks
    );

    if (!tasks || tasks.length === 0) {
      return res.status(400).json({
        error: 'No tasks were provided.',
      });
    }

    const prompt = `
You are a helpful productivity assistant.

The user has the following to-do list:

${JSON.stringify(tasks, null, 2)}

Create a reasonable order for completing these tasks.

Consider:

- Due dates, if provided.
- Task importance.
- Dependencies between tasks.
- Tasks that should logically happen before other tasks.
- Breaking larger tasks into a reasonable order.
- Avoiding an unnecessarily complicated schedule.

Do NOT change the user's original task names.

Return ONLY valid JSON in exactly this format:

{
  "schedule": [
    {
      "task": "original task name",
      "time": "Suggested time or timing",
      "reason": "Short explanation for why this task belongs here"
    }
  ],
  "explanation": "A short explanation of why this overall order makes sense."
}

Make sure every original task appears exactly once in the schedule.
`;

    console.log('Sending schedule request to Gemini...');

    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        console.log(
          'Gemini schedule response received.'
        );

        break;
      } catch (error) {
        console.error(
          `Gemini schedule attempt ${attempt} failed:`,
          error
        );

        if (error.status === 503 && attempt < 3) {
          console.log(
            'Gemini unavailable. Retrying...'
          );

          await new Promise((resolve) =>
            setTimeout(resolve, 5000)
          );
        } else {
          throw error;
        }
      }
    }

    if (!response) {
      throw new Error(
        'Gemini did not return a schedule response.'
      );
    }

    const result = JSON.parse(response.text);

    console.log(
      'Gemini schedule result:',
      result
    );

    res.json(result);
  } catch (error) {
    console.error(
      'Create schedule error:',
      error
    );

    res.status(500).json({
      error:
        'Something went wrong while creating the schedule.',
    });
  }
});

/*
====================================================
START SERVER
====================================================
*/

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});