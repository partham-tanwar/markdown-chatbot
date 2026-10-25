import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

// रॉ मार्कडाउन सिंबल्स (#, ##, **) को हटाने के लिए फंक्शन
function cleanMarkdownText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') 
    .replace(/\*\*/g, '')     
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1: $2'); 
}

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ 
        reply: 'API key is missing in environment variables. Please check your .env.local file.' 
      }, { status: 500 });
    }

    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ reply: 'No messages provided.' }, { status: 400 });
    }

    const rawMessage = messages[messages.length - 1].content.trim();
    const latestMessage = rawMessage.toLowerCase();

    // 1. INSTANT GREETINGS CHECK
    const greetings = ['hi', 'hello', 'hey', 'hii', 'hy', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hey there'];
    if (greetings.includes(latestMessage)) {
      return NextResponse.json({
        reply: "Hello! Welcome to QYBRENTHAK AI PRIVATE LIMITED. I am your official Customer Success Assistant. How can I assist you with our professional courses or platform services today?",
        sources: []
      });
    }

    const kbDir = path.join(process.cwd(), 'app/knowledge-base');
    
    let kbFilesMap: { [key: string]: string } = {};
    let fullKbContext = '';
    let allSources: string[] = [];

    if (fs.existsSync(kbDir)) {
      const files = fs.readdirSync(kbDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(kbDir, file);
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          kbFilesMap[file.toLowerCase()] = rawContent;
          fullKbContext += `\n\n=== File: ${file} ===\n${rawContent}`;
          allSources.push(file);
        }
      }
    }

    // 2. ROBUST BUTTON MAPPING (सारे संभावित नामों को कवर किया गया है)
    if (latestMessage.includes('course') || latestMessage.includes('available courses')) {
      const courseKey = Object.keys(kbFilesMap).find(k => k.includes('course'));
      if (courseKey) {
        return NextResponse.json({
          reply: cleanMarkdownText(kbFilesMap[courseKey]),
          sources: [courseKey]
        });
      }
    }

    if (latestMessage.includes('admission') || latestMessage.includes('placement')) {
      const admissionKey = Object.keys(kbFilesMap).find(k => k.includes('admission'));
      if (admissionKey) {
        return NextResponse.json({
          reply: cleanMarkdownText(kbFilesMap[admissionKey]),
          sources: [admissionKey]
        });
      }
    }

    if (latestMessage.includes('faq') || latestMessage.includes('frequently')) {
      const faqKey = Object.keys(kbFilesMap).find(k => k.includes('faq'));
      if (faqKey) {
        return NextResponse.json({
          reply: cleanMarkdownText(kbFilesMap[faqKey]),
          sources: [faqKey]
        });
      }
    }

    // 3. AI MODEL CALL FOR CUSTOM SPECIFIC QUESTIONS
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-3.8-flash',
        systemInstruction: `You are the official AI Customer Success Assistant for QYBRENTHAK AI PRIVATE LIMITED. 
        Analyze the user's specific query carefully and extract ONLY the precise answer requested from the Knowledge Base below.
        
        STRICT RULES:
        1. If the user asks about a specific course, fee, or topic, provide ONLY the relevant details for that specific item. Do not dump unrelated files.
        2. Never output raw markdown symbols like hash (#) or bold asterisks (**). Output clean, readable plain conversational text.
        
        Knowledge Base:
        ${fullKbContext}`,
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.1,
        }
      });

      const result = await model.generateContent(rawMessage);
      const responseText = cleanMarkdownText(result.response.text());

      return NextResponse.json({ 
        reply: responseText, 
        sources: allSources 
      });

    } catch (aiError: any) {
      console.warn('AI Model error:', aiError);
      return NextResponse.json({ 
        reply: "Welcome to QYBRENTHAK AI PRIVATE LIMITED. Please explore our available courses or ask any specific question.", 
        sources: allSources 
      });
    }

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      reply: 'Hello! Welcome to QYBRENTHAK AI PRIVATE LIMITED. How can we assist you today?' 
    }, { status: 200 });
  }
}