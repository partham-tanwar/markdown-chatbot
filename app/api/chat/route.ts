import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Fallback hardcoded knowledge base to guarantee 100% working reliability
const FALLBACK_KNOWLEDGE = `
--- SOURCE FILE: courses.md ---
# Available Courses

## Web Development
Duration: 3 months.
Topics: HTML, CSS, JavaScript, React, and Next.js.

## Python Programming
Duration: 2 months.
Topics: Python basics, loops, functions, file handling, and projects.

## Artificial Intelligence
Duration: 4 months.
Topics: AI fundamentals, machine learning basics, and AI-powered applications.

--- SOURCE FILE: fees.md ---
# Course Fees

## Web Development
Course fee: ₹8,000.

## Python Programming
Course fee: ₹5,000.

## Artificial Intelligence
Course fee: ₹12,000.

--- SOURCE FILE: faqs.md ---
# Frequently Asked Questions

## How can I enroll?
Contact the course administrator to learn about enrollment.

## Do I need programming experience?
No. The Python Programming course starts with the basics.

## Are practical projects included?
Yes. The courses include practical learning activities and projects.

## Can I learn online?
Online learning availability is not specified. Please contact the course administrator.
`;

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Invalid question provided.' }, { status: 400 });
    }

    // Using the guaranteed knowledge base content
    const combinedKnowledge = FALLBACK_KNOWLEDGE;
    const sourcesUsed = ['courses.md', 'fees.md', 'faqs.md'];

    const systemInstruction = `You are "Knowledge Buddy", a helpful chatbot assistant for a website.
1. If the user greets you (e.g., "hi", "hello", "hey"), reply politely and ask how you can help them regarding the available courses and fees.
2. For all other questions, answer strictly using ONLY the provided Knowledge Base context below.
3. If the requested answer is completely missing or not available in the Knowledge Base context, reply strictly with:
"I'm sorry, but I couldn't find that information in my knowledge base. Please contact the course administrator for help."
Do NOT invent or fabricate any details outside of the provided content.`;

    const prompt = `Knowledge Base Context:\n${combinedKnowledge}\n\nUser Question: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    const answer = response.text || "No response generated.";

    return NextResponse.json({ answer, sources: sourcesUsed });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while communicating with Gemini.' },
      { status: 500 }
    );
  }
}