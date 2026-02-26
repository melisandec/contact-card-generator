import { DesignElement, CanvasBackground } from "@/types";

export interface AIDesignVariation {
  id: string;
  name: string;
  elements: Omit<DesignElement, "id">[];
  background: CanvasBackground;
}

export interface AIDesignPrompt {
  prompt: string;
  includeElements?: {
    photo?: boolean;
    name?: boolean;
    title?: boolean;
    company?: boolean;
    contactInfo?: boolean;
    qrCode?: boolean;
  };
}

export interface AIGenerateResult {
  variations: AIDesignVariation[];
  source: "ai" | "fallback";
  errors?: string[];
}

interface AIResponseDesign {
  layout: string;
  colors: string[];
  fonts: { heading: string; body: string };
  elements: Array<{
    type: string;
    fieldType?: string;
    content?: string;
    style: Record<string, unknown>;
  }>;
}

interface ParsedDesign {
  theme: string;
  colors: string[];
  fonts: { heading: string; body: string };
  layout: "left" | "right" | "top" | "center";
  elements: Array<{
    type: "text" | "shape" | "image";
    fieldType?: DesignElement["fieldType"];
    content?: string;
    style: {
      fontWeight?: string;
      fontSize?: number;
      color?: string;
      fill?: string;
    };
  }>;
}

const DESIGN_TEMPLATES: ParsedDesign[] = [
  {
    theme: "modern-minimal",
    colors: ["#1a1a2e", "#16213e", "#0f3460", "#e94560", "#ffffff"],
    fonts: { heading: "Inter", body: "Inter" },
    layout: "left",
    elements: [
      { type: "shape", content: undefined, style: { fill: "#1a1a2e" } },
      {
        type: "text",
        fieldType: "name",
        content: "John Doe",
        style: { fontWeight: "700", fontSize: 32, color: "#ffffff" },
      },
      {
        type: "text",
        fieldType: "title",
        content: "Software Engineer",
        style: { fontWeight: "400", fontSize: 16, color: "#e94560" },
      },
      {
        type: "text",
        fieldType: "company",
        content: "Acme Corp",
        style: { fontWeight: "400", fontSize: 14, color: "#cccccc" },
      },
      {
        type: "text",
        fieldType: "email",
        content: "john@acme.com",
        style: { fontWeight: "400", fontSize: 12, color: "#888888" },
      },
      {
        type: "text",
        fieldType: "phone",
        content: "+1 (555) 123-4567",
        style: { fontWeight: "400", fontSize: 12, color: "#888888" },
      },
    ],
  },
  {
    theme: "elegant-gold",
    colors: ["#0a0a0a", "#1c1c1c", "#c5a572", "#f5f0e8", "#ffffff"],
    fonts: { heading: "Georgia", body: "Arial" },
    layout: "center",
    elements: [
      { type: "shape", content: undefined, style: { fill: "#c5a572" } },
      {
        type: "text",
        fieldType: "name",
        content: "Jane Smith",
        style: { fontWeight: "700", fontSize: 34, color: "#0a0a0a" },
      },
      {
        type: "text",
        fieldType: "title",
        content: "Creative Director",
        style: { fontWeight: "400", fontSize: 16, color: "#1c1c1c" },
      },
      {
        type: "text",
        fieldType: "company",
        content: "Design Studio",
        style: { fontWeight: "400", fontSize: 14, color: "#555555" },
      },
      {
        type: "text",
        fieldType: "email",
        content: "jane@studio.com",
        style: { fontWeight: "400", fontSize: 12, color: "#777777" },
      },
      {
        type: "text",
        fieldType: "phone",
        content: "+1 (555) 987-6543",
        style: { fontWeight: "400", fontSize: 12, color: "#777777" },
      },
    ],
  },
  {
    theme: "tech-gradient",
    colors: ["#667eea", "#764ba2", "#f093fb", "#ffffff", "#2d3748"],
    fonts: { heading: "Helvetica", body: "Verdana" },
    layout: "right",
    elements: [
      { type: "shape", content: undefined, style: { fill: "#667eea" } },
      {
        type: "text",
        fieldType: "name",
        content: "Alex Chen",
        style: { fontWeight: "700", fontSize: 30, color: "#ffffff" },
      },
      {
        type: "text",
        fieldType: "title",
        content: "Full Stack Developer",
        style: { fontWeight: "400", fontSize: 15, color: "#f093fb" },
      },
      {
        type: "text",
        fieldType: "company",
        content: "TechStart Inc.",
        style: { fontWeight: "400", fontSize: 13, color: "#dddddd" },
      },
      {
        type: "text",
        fieldType: "email",
        content: "alex@techstart.io",
        style: { fontWeight: "400", fontSize: 12, color: "#bbbbbb" },
      },
      {
        type: "text",
        fieldType: "website",
        content: "techstart.io",
        style: { fontWeight: "400", fontSize: 12, color: "#bbbbbb" },
      },
    ],
  },
  {
    theme: "nature-organic",
    colors: ["#2d6a4f", "#40916c", "#95d5b2", "#d8f3dc", "#1b4332"],
    fonts: { heading: "Georgia", body: "Verdana" },
    layout: "left",
    elements: [
      { type: "shape", content: undefined, style: { fill: "#d8f3dc" } },
      {
        type: "text",
        fieldType: "name",
        content: "Sarah Green",
        style: { fontWeight: "700", fontSize: 32, color: "#1b4332" },
      },
      {
        type: "text",
        fieldType: "title",
        content: "Landscape Architect",
        style: { fontWeight: "400", fontSize: 16, color: "#2d6a4f" },
      },
      {
        type: "text",
        fieldType: "company",
        content: "EcoDesign Co.",
        style: { fontWeight: "400", fontSize: 14, color: "#40916c" },
      },
      {
        type: "text",
        fieldType: "email",
        content: "sarah@ecodesign.com",
        style: { fontWeight: "400", fontSize: 12, color: "#555555" },
      },
      {
        type: "text",
        fieldType: "phone",
        content: "+1 (555) 456-7890",
        style: { fontWeight: "400", fontSize: 12, color: "#555555" },
      },
    ],
  },
  {
    theme: "bold-corporate",
    colors: ["#003153", "#00509d", "#00a8e8", "#f8f9fa", "#ffffff"],
    fonts: { heading: "Arial", body: "Helvetica" },
    layout: "center",
    elements: [
      { type: "shape", content: undefined, style: { fill: "#003153" } },
      {
        type: "text",
        fieldType: "name",
        content: "Michael Brown",
        style: { fontWeight: "700", fontSize: 34, color: "#ffffff" },
      },
      {
        type: "text",
        fieldType: "title",
        content: "Chief Executive Officer",
        style: { fontWeight: "400", fontSize: 16, color: "#00a8e8" },
      },
      {
        type: "text",
        fieldType: "company",
        content: "Global Solutions",
        style: { fontWeight: "400", fontSize: 14, color: "#cccccc" },
      },
      {
        type: "text",
        fieldType: "email",
        content: "michael@global.com",
        style: { fontWeight: "400", fontSize: 12, color: "#999999" },
      },
      {
        type: "text",
        fieldType: "phone",
        content: "+1 (555) 000-1234",
        style: { fontWeight: "400", fontSize: 12, color: "#999999" },
      },
    ],
  },
];

function matchPromptToTemplates(prompt: string): ParsedDesign[] {
  const lower = prompt.toLowerCase();
  const scored = DESIGN_TEMPLATES.map((template) => {
    let score = 0;
    const themeWords = template.theme.split("-");
    themeWords.forEach((word) => {
      if (lower.includes(word)) score += 3;
    });
    template.colors.forEach((color) => {
      if (lower.includes(color)) score += 2;
    });
    if (lower.includes("gold") && template.theme.includes("gold")) score += 5;
    if (lower.includes("minimal") && template.theme.includes("minimal"))
      score += 5;
    if (lower.includes("tech") && template.theme.includes("tech")) score += 5;
    if (lower.includes("nature") && template.theme.includes("nature"))
      score += 5;
    if (lower.includes("corporate") && template.theme.includes("corporate"))
      score += 5;
    if (lower.includes("elegant") && template.theme.includes("elegant"))
      score += 5;
    if (lower.includes("bold") && template.theme.includes("bold")) score += 4;
    if (lower.includes("blue") && template.colors.some((c) => c.includes("00")))
      score += 2;
    if (
      lower.includes("green") &&
      template.colors.some((c) => c.includes("6a") || c.includes("91"))
    )
      score += 2;
    if (lower.includes("dark") && template.colors[0].match(/^#[0-3]/))
      score += 2;
    if (
      lower.includes("light") &&
      template.colors.some((c) => c.match(/^#[d-f]/i))
    )
      score += 2;
    // Every template gets at least 1 base score so we always return results
    score += 1;
    return { template, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.template);
}

function buildVariation(
  parsed: ParsedDesign,
  canvasWidth: number,
  canvasHeight: number,
  variationIndex: number,
  includeElements?: AIDesignPrompt["includeElements"],
): AIDesignVariation {
  const elements: Omit<DesignElement, "id">[] = [];
  const layout = parsed.layout;

  // Accent bar shape
  const accentEl = parsed.elements.find((e) => e.type === "shape");
  if (accentEl) {
    if (layout === "left") {
      elements.push({
        type: "shape",
        shapeType: "rectangle",
        x: 0,
        y: 0,
        width: 12,
        height: canvasHeight,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        fill: accentEl.style.fill ?? parsed.colors[0],
      });
    } else if (layout === "right") {
      elements.push({
        type: "shape",
        shapeType: "rectangle",
        x: canvasWidth - 12,
        y: 0,
        width: 12,
        height: canvasHeight,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        fill: accentEl.style.fill ?? parsed.colors[0],
      });
    } else {
      // center or top: horizontal accent bar at bottom
      elements.push({
        type: "shape",
        shapeType: "rectangle",
        x: 0,
        y: canvasHeight - 8,
        width: canvasWidth,
        height: 8,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        fill: accentEl.style.fill ?? parsed.colors[0],
      });
    }
  }

  const textElements = parsed.elements.filter((e) => e.type === "text");
  const shouldInclude = (fieldType?: DesignElement["fieldType"]): boolean => {
    if (!includeElements || !fieldType) return true;
    if (fieldType === "name") return includeElements.name !== false;
    if (fieldType === "title") return includeElements.title !== false;
    if (fieldType === "company") return includeElements.company !== false;
    if (
      fieldType === "email" ||
      fieldType === "phone" ||
      fieldType === "website"
    )
      return includeElements.contactInfo !== false;
    return true;
  };

  // Position text elements based on layout
  let startX: number;
  let startY: number;
  let textAlign: "left" | "center" | "right";

  if (layout === "left") {
    startX = 40;
    startY = 60;
    textAlign = "left";
  } else if (layout === "right") {
    startX = canvasWidth - 400;
    startY = 60;
    textAlign = "right";
  } else {
    startX = canvasWidth / 2 - 180;
    startY = 50;
    textAlign = "center";
  }

  let currentY = startY;
  textElements.forEach((te, idx) => {
    if (!shouldInclude(te.fieldType)) return;
    const fontSize = te.style.fontSize ?? 16;
    const height = Math.ceil(fontSize * 1.6);
    elements.push({
      type: "text",
      x: startX,
      y: currentY,
      width: 360,
      height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: idx + 1,
      content: te.content ?? "",
      fontFamily: idx === 0 ? parsed.fonts.heading : parsed.fonts.body,
      fontSize,
      fontWeight: te.style.fontWeight ?? "400",
      color: te.style.color ?? "#000000",
      textAlign,
      fieldType: te.fieldType,
    });
    currentY += height + 8;
  });

  // Background
  const bgColor = parsed.colors[parsed.colors.length - 1] ?? "#ffffff";
  const gradAngle = layout === "left" ? 135 : layout === "right" ? 225 : 180;
  const background: CanvasBackground =
    variationIndex % 2 === 0
      ? { type: "solid", color: bgColor }
      : {
          type: "gradient",
          gradient: {
            type: "linear",
            angle: gradAngle,
            stops: [
              { color: bgColor, position: 0 },
              {
                color: parsed.colors[Math.min(3, parsed.colors.length - 1)],
                position: 100,
              },
            ],
          },
        };

  return {
    id: `variation-${variationIndex}`,
    name: `${parsed.theme} v${variationIndex + 1}`,
    elements,
    background,
  };
}

export function generateDesignVariations(
  input: AIDesignPrompt,
  canvasWidth: number,
  canvasHeight: number,
): AIDesignVariation[] {
  const matched = matchPromptToTemplates(input.prompt);
  return matched.map((parsed, i) =>
    buildVariation(parsed, canvasWidth, canvasHeight, i, input.includeElements),
  );
}

// --- AI-powered generation via Hugging Face API ---

const VALID_FONTS = [
  "Inter",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Playfair Display",
  "Cormorant Garamond",
  "Poppins",
  "Raleway",
  "Merriweather",
];

const LAYOUT_MAP: Record<string, "left" | "right" | "top" | "center"> = {
  "photo-left": "left",
  "photo-right": "right",
  "photo-top": "top",
  "photo-bottom": "center",
  "no-photo": "center",
};

const VALID_FIELD_TYPES: DesignElement["fieldType"][] = [
  "name",
  "title",
  "company",
  "email",
  "phone",
  "website",
  "location",
  "description",
  "custom",
];

function sanitizeFont(font: string): string {
  const match = VALID_FONTS.find(
    (f) => f.toLowerCase() === font?.toLowerCase().trim(),
  );
  return match ?? "Inter";
}

function sanitizeColor(color: string): string {
  if (typeof color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(color.trim())) {
    return color.trim();
  }
  return "#333333";
}

function convertAIResponseToVariation(
  aiDesign: AIResponseDesign,
  canvasWidth: number,
  canvasHeight: number,
  variationIndex: number,
  includeElements?: AIDesignPrompt["includeElements"],
): AIDesignVariation {
  const layout = LAYOUT_MAP[aiDesign.layout] ?? "center";
  const colors = (aiDesign.colors ?? []).map(sanitizeColor);
  const fonts = {
    heading: sanitizeFont(aiDesign.fonts?.heading ?? "Inter"),
    body: sanitizeFont(aiDesign.fonts?.body ?? "Inter"),
  };

  const elements: Omit<DesignElement, "id">[] = [];

  // Add accent bar based on layout
  const accentColor = colors[0] ?? "#1a1a2e";
  if (layout === "left") {
    elements.push({
      type: "shape",
      shapeType: "rectangle",
      x: 0,
      y: 0,
      width: 12,
      height: canvasHeight,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      fill: accentColor,
    });
  } else if (layout === "right") {
    elements.push({
      type: "shape",
      shapeType: "rectangle",
      x: canvasWidth - 12,
      y: 0,
      width: 12,
      height: canvasHeight,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      fill: accentColor,
    });
  } else {
    elements.push({
      type: "shape",
      shapeType: "rectangle",
      x: 0,
      y: canvasHeight - 8,
      width: canvasWidth,
      height: 8,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      fill: accentColor,
    });
  }

  // Filter out non-text elements from AI response (photo, qr handled separately)
  const textElements = (aiDesign.elements ?? []).filter(
    (e) => e.type === "text" && e.fieldType,
  );

  const shouldInclude = (fieldType?: string): boolean => {
    if (!includeElements || !fieldType) return true;
    if (fieldType === "name") return includeElements.name !== false;
    if (fieldType === "title") return includeElements.title !== false;
    if (fieldType === "company") return includeElements.company !== false;
    if (
      fieldType === "email" ||
      fieldType === "phone" ||
      fieldType === "website"
    )
      return includeElements.contactInfo !== false;
    return true;
  };

  let startX: number;
  let startY: number;
  let textAlign: "left" | "center" | "right";

  if (layout === "left") {
    startX = 40;
    startY = 60;
    textAlign = "left";
  } else if (layout === "right") {
    startX = canvasWidth - 400;
    startY = 60;
    textAlign = "right";
  } else {
    startX = canvasWidth / 2 - 180;
    startY = 50;
    textAlign = "center";
  }

  let currentY = startY;
  textElements.forEach((te, idx) => {
    const ft = VALID_FIELD_TYPES.includes(
      te.fieldType as DesignElement["fieldType"],
    )
      ? (te.fieldType as DesignElement["fieldType"])
      : undefined;
    if (!shouldInclude(ft)) return;

    const fontSize =
      typeof te.style?.fontSize === "number"
        ? Math.min(Math.max(te.style.fontSize, 8), 72)
        : 16;
    const fontWeight = String(te.style?.fontWeight ?? "400");
    const color =
      typeof te.style?.color === "string"
        ? sanitizeColor(te.style.color as string)
        : (colors[1] ?? "#333333");
    const height = Math.ceil(fontSize * 1.6);

    elements.push({
      type: "text",
      x: startX,
      y: currentY,
      width: 360,
      height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: idx + 1,
      content: te.content ?? "",
      fontFamily: idx === 0 ? fonts.heading : fonts.body,
      fontSize,
      fontWeight,
      color,
      textAlign,
      fieldType: ft,
    });
    currentY += height + 8;
  });

  // Background
  const bgColor = colors[colors.length - 1] ?? "#ffffff";
  const gradAngle = layout === "left" ? 135 : layout === "right" ? 225 : 180;
  const background: CanvasBackground =
    variationIndex % 2 === 0
      ? { type: "solid", color: bgColor }
      : {
          type: "gradient",
          gradient: {
            type: "linear",
            angle: gradAngle,
            stops: [
              { color: bgColor, position: 0 },
              {
                color: colors[Math.min(1, colors.length - 1)] ?? "#e0e0e0",
                position: 100,
              },
            ],
          },
        };

  const themeName = `${aiDesign.layout ?? "custom"}-${colors[0]?.replace("#", "") ?? "design"}`;

  return {
    id: `ai-variation-${variationIndex}`,
    name: `AI ${themeName} v${variationIndex + 1}`,
    elements,
    background,
  };
}

/**
 * Generate AI-powered design variations via the Hugging Face API.
 * Falls back to local template matching if the API is unavailable.
 */
export async function generateAIDesignVariations(
  input: AIDesignPrompt,
  canvasWidth: number,
  canvasHeight: number,
): Promise<AIGenerateResult> {
  const includeElementsList: string[] = [];
  if (input.includeElements?.name !== false) includeElementsList.push("name");
  if (input.includeElements?.title !== false) includeElementsList.push("title");
  if (input.includeElements?.company !== false)
    includeElementsList.push("company");
  if (input.includeElements?.contactInfo !== false) {
    includeElementsList.push("email", "phone");
  }
  if (input.includeElements?.qrCode) includeElementsList.push("qr code");
  if (input.includeElements?.photo) includeElementsList.push("photo");

  try {
    const response = await fetch("/api/designs/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: input.prompt,
        includeElements: includeElementsList,
        temperatures: [0.7, 0.8, 0.9],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg =
        (errorData as Record<string, string>).error ??
        `API returned status ${response.status}`;
      console.warn("AI generation API error:", errorMsg);
      // Fall back to local generation
      return {
        variations: generateDesignVariations(input, canvasWidth, canvasHeight),
        source: "fallback",
        errors: [errorMsg],
      };
    }

    const data = await response.json();

    if (!data.designs || data.designs.length === 0) {
      return {
        variations: generateDesignVariations(input, canvasWidth, canvasHeight),
        source: "fallback",
        errors: data.errors ?? ["No valid designs generated by AI"],
      };
    }

    const aiVariations = (data.designs as AIResponseDesign[]).map((design, i) =>
      convertAIResponseToVariation(
        design,
        canvasWidth,
        canvasHeight,
        i,
        input.includeElements,
      ),
    );

    // If AI returned fewer than 3, fill remaining with fallback variations
    if (aiVariations.length < 3) {
      const fallbackAll = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      const needed = 3 - aiVariations.length;
      const extras = fallbackAll.slice(0, needed).map((v, i) => ({
        ...v,
        id: `fallback-${aiVariations.length + i}`,
        name: `${v.name} (template)`,
      }));
      aiVariations.push(...extras);
    }

    return {
      variations: aiVariations,
      source: data.designs.length > 0 ? "ai" : "fallback",
      errors: data.errors,
    };
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
    return {
      variations: generateDesignVariations(input, canvasWidth, canvasHeight),
      source: "fallback",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
