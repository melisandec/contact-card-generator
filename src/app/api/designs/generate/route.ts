import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Provider + model combos on the new HF router (free tier via SambaNova)
const API_BASE = "https://router.huggingface.co/sambanova/v1/chat/completions";

const MODELS = ["Meta-Llama-3.1-8B-Instruct", "DeepSeek-R1-Distill-Llama-70B"];

const SYSTEM_PROMPT = `You are a professional business card designer. Generate a card design based on the user's description. Output ONLY a valid JSON object with the following structure, no other text before or after the JSON. Use realistic placeholder text. Ensure colors are hex codes. Choose fonts from this list: Inter, Montserrat, Roboto, Open Sans, Lato, Playfair Display, Cormorant Garamond, Poppins, Raleway, Merriweather.

JSON format:
{
  "layout": "photo-left",
  "colors": ["#hex1", "#hex2", "#hex3"],
  "fonts": { "heading": "font-name", "body": "font-name" },
  "elements": [
    { "type": "text", "fieldType": "name", "content": "Full Name", "style": { "fontSize": 32, "fontWeight": 700 } },
    { "type": "text", "fieldType": "title", "content": "Job Title", "style": { "fontSize": 18 } },
    { "type": "text", "fieldType": "company", "content": "Company Name", "style": { "fontSize": 16 } },
    { "type": "text", "fieldType": "email", "content": "email@example.com", "style": { "fontSize": 12 } },
    { "type": "text", "fieldType": "phone", "content": "+1 123 456 7890", "style": { "fontSize": 12 } }
  ]
}

The "layout" must be one of: "photo-left", "photo-right", "photo-top", "photo-bottom", "no-photo".
Output ONLY the JSON object. No markdown, no explanation, no code fences.`;

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface GenerateRequestBody {
  prompt: string;
  includeElements?: string[];
  temperatures?: number[];
}

function buildUserPrompt(prompt: string, includeElements?: string[]): string {
  const elements = includeElements?.length
    ? includeElements.join(", ")
    : "name, title, company, email, phone";
  return `Design a business card with these requirements: ${prompt}\nInclude these elements: ${elements}\nBe creative with color choices and layout. Output only the JSON.`;
}

async function callModel(
  userPrompt: string,
  temperature: number,
  apiKey: string,
): Promise<string | null> {
  // Try each model until one succeeds
  for (const model of MODELS) {
    const result = await callSingleModel(
      model,
      userPrompt,
      temperature,
      apiKey,
    );
    if (result !== null) return result;
  }
  return null;
}

async function callSingleModel(
  model: string,
  userPrompt: string,
  temperature: number,
  apiKey: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature,
        top_p: 0.95,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errorDetail = `status ${response.status}`;
      try {
        const errorText = await response.text();
        errorDetail = errorText.slice(0, 300);
      } catch {
        // ignore
      }
      console.error(`API error for ${model}: ${errorDetail}`);
      return null;
    }

    const result: ChatCompletionResponse = await response.json();

    if (result.error) {
      console.error(`Model ${model} returned error:`, result.error.message);
      return null;
    }

    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      console.error(`No content in response from ${model}`);
      return null;
    }

    return content;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error(`Call to ${model} timed out`);
    } else {
      console.error(`Call to ${model} failed:`, error);
    }
    return null;
  }
}

function parseDesignJSON(text: string): Record<string, unknown> | null {
  if (!text) return null;

  // Strip any markdown code fences
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Strip any <think>...</think> tags (DeepSeek reasoning)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Try to extract JSON object from the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.layout || !parsed.colors || !parsed.fonts || !parsed.elements) {
      console.error(
        "Parsed JSON missing required fields:",
        Object.keys(parsed),
      );
      return null;
    }

    // Validate colors are hex codes
    if (Array.isArray(parsed.colors)) {
      parsed.colors = parsed.colors.filter(
        (c: string) => typeof c === "string" && /^#[0-9a-fA-F]{3,8}$/.test(c),
      );
      if (parsed.colors.length === 0) {
        parsed.colors = ["#1a1a2e", "#e94560", "#ffffff"];
      }
    }

    // Validate elements array
    if (!Array.isArray(parsed.elements) || parsed.elements.length === 0) {
      return null;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse AI response JSON:", e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: "AI generation is not available. Please contact support." },
        { status: 503 },
      );
    }

    let body: GenerateRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { prompt, includeElements, temperatures = [0.7, 0.8, 0.9] } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const userPrompt = buildUserPrompt(prompt.trim(), includeElements);

    // Make concurrent API calls with different temperatures for variation
    const calls = temperatures
      .slice(0, 3)
      .map((temp) => callModel(userPrompt, temp, apiKey));

    const rawResults = await Promise.all(calls);

    const designs: Record<string, unknown>[] = [];
    const errors: string[] = [];

    rawResults.forEach((result, i) => {
      if (result) {
        const parsed = parseDesignJSON(result);
        if (parsed) {
          designs.push(parsed);
        } else {
          errors.push(
            `Variation ${i + 1}: Failed to parse AI response as valid design JSON`,
          );
        }
      } else {
        errors.push(`Variation ${i + 1}: API call failed or timed out`);
      }
    });

    return NextResponse.json({
      designs,
      errors: errors.length > 0 ? errors : undefined,
      count: designs.length,
    });
  } catch (error) {
    console.error("Unhandled error in AI generate route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Server error: ${error.message}`
            : "An unexpected server error occurred",
        designs: [],
        count: 0,
      },
      { status: 500 },
    );
  }
}
