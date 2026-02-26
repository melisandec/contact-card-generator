import {
  generateDesignVariations,
  generateAIDesignVariations,
  AIDesignPrompt,
} from "@/lib/aiDesignGenerator";

// Mock fetch for AI API tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

const MOCK_AI_DESIGN = {
  layout: "photo-left",
  colors: ["#C5A572", "#003153", "#ffffff"],
  fonts: { heading: "Montserrat", body: "Inter" },
  elements: [
    {
      type: "text",
      fieldType: "name",
      content: "John Doe",
      style: { fontSize: 32, fontWeight: 700 },
    },
    {
      type: "text",
      fieldType: "title",
      content: "CEO",
      style: { fontSize: 18 },
    },
    {
      type: "text",
      fieldType: "company",
      content: "Acme Corp",
      style: { fontSize: 16 },
    },
    {
      type: "text",
      fieldType: "email",
      content: "john@acme.com",
      style: { fontSize: 12 },
    },
    {
      type: "text",
      fieldType: "phone",
      content: "+1 555 0000",
      style: { fontSize: 12 },
    },
  ],
};

describe("AI Design Generator", () => {
  const canvasWidth = 1050;
  const canvasHeight = 600;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  // --- Fallback (sync template matching) ---

  describe("Fallback template matching", () => {
    it("generates 3 variations for a basic prompt", () => {
      const input: AIDesignPrompt = { prompt: "modern minimal card" };
      const variations = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      expect(variations).toHaveLength(3);
    });

    it("each variation has a unique id and name", () => {
      const input: AIDesignPrompt = { prompt: "elegant gold business card" };
      const variations = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      const ids = variations.map((v) => v.id);
      expect(new Set(ids).size).toBe(ids.length);
      variations.forEach((v) => {
        expect(v.name).toBeTruthy();
      });
    });

    it("generates elements with proper structure", () => {
      const input: AIDesignPrompt = { prompt: "tech gradient card" };
      const variations = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      variations.forEach((v) => {
        expect(v.elements.length).toBeGreaterThan(0);
        v.elements.forEach((el) => {
          expect(el.type).toBeDefined();
          expect(typeof el.x).toBe("number");
          expect(typeof el.y).toBe("number");
          expect(typeof el.width).toBe("number");
          expect(typeof el.height).toBe("number");
        });
      });
    });

    it("respects includeElements filter", () => {
      const input: AIDesignPrompt = {
        prompt: "minimal card",
        includeElements: {
          name: true,
          title: false,
          company: false,
          contactInfo: false,
        },
      };
      const variations = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      variations.forEach((v) => {
        const textElements = v.elements.filter((el) => el.type === "text");
        const hasTitle = textElements.some((el) => el.fieldType === "title");
        const hasCompany = textElements.some(
          (el) => el.fieldType === "company",
        );
        expect(hasTitle).toBe(false);
        expect(hasCompany).toBe(false);
        const hasName = textElements.some((el) => el.fieldType === "name");
        expect(hasName).toBe(true);
      });
    });

    it("generates valid background objects", () => {
      const input: AIDesignPrompt = { prompt: "corporate card" };
      const variations = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      variations.forEach((v) => {
        expect(v.background).toBeDefined();
        expect(["solid", "gradient", "image", "pattern"]).toContain(
          v.background.type,
        );
      });
    });

    it("prioritizes matching templates based on prompt keywords", () => {
      const goldPrompt: AIDesignPrompt = { prompt: "elegant gold card" };
      const goldVariations = generateDesignVariations(
        goldPrompt,
        canvasWidth,
        canvasHeight,
      );
      expect(goldVariations[0].name).toContain("elegant-gold");
    });

    it("text elements have fieldType labels", () => {
      const input: AIDesignPrompt = { prompt: "business card" };
      const variations = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      variations.forEach((v) => {
        const textEls = v.elements.filter((el) => el.type === "text");
        textEls.forEach((el) => {
          expect(el.fieldType).toBeDefined();
        });
      });
    });

    it("works with an empty includeElements object", () => {
      const input: AIDesignPrompt = {
        prompt: "card",
        includeElements: {},
      };
      const variations = generateDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );
      expect(variations).toHaveLength(3);
      variations.forEach((v) => {
        expect(v.elements.length).toBeGreaterThan(0);
      });
    });
  });

  // --- AI-powered generation ---

  describe("AI-powered generation", () => {
    it("calls the API and returns AI variations on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          designs: [MOCK_AI_DESIGN, MOCK_AI_DESIGN, MOCK_AI_DESIGN],
          count: 3,
        }),
      });

      const input: AIDesignPrompt = { prompt: "luxury gold card" };
      const result = await generateAIDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );

      expect(result.source).toBe("ai");
      expect(result.variations).toHaveLength(3);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/designs/generate",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    it("returns properly structured elements from AI response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          designs: [MOCK_AI_DESIGN],
          count: 1,
        }),
      });

      const input: AIDesignPrompt = { prompt: "modern card" };
      const result = await generateAIDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );

      // Should be padded to 3 with fallbacks
      expect(result.variations.length).toBe(3);

      const aiVariation = result.variations[0];
      expect(aiVariation.id).toContain("ai-variation");
      expect(aiVariation.elements.length).toBeGreaterThan(0);
      aiVariation.elements.forEach((el) => {
        expect(typeof el.x).toBe("number");
        expect(typeof el.y).toBe("number");
        expect(typeof el.width).toBe("number");
        expect(typeof el.height).toBe("number");
      });
    });

    it("falls back to template matching when API returns error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      const input: AIDesignPrompt = { prompt: "tech card" };
      const result = await generateAIDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );

      expect(result.source).toBe("fallback");
      expect(result.variations).toHaveLength(3);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it("falls back when fetch throws a network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const input: AIDesignPrompt = { prompt: "card" };
      const result = await generateAIDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );

      expect(result.source).toBe("fallback");
      expect(result.variations).toHaveLength(3);
      expect(result.errors).toContain("Network error");
    });

    it("fills remaining variations with fallbacks when AI returns fewer than 3", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          designs: [MOCK_AI_DESIGN],
          count: 1,
        }),
      });

      const input: AIDesignPrompt = { prompt: "blue tech card" };
      const result = await generateAIDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );

      expect(result.variations).toHaveLength(3);
      // First should be AI, remaining should be fallback
      expect(result.variations[0].id).toContain("ai-variation");
      expect(result.variations[1].id).toContain("fallback");
    });

    it("passes includeElements to the API request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          designs: [MOCK_AI_DESIGN, MOCK_AI_DESIGN, MOCK_AI_DESIGN],
          count: 3,
        }),
      });

      const input: AIDesignPrompt = {
        prompt: "card",
        includeElements: { name: true, title: true, qrCode: true },
      };
      await generateAIDesignVariations(input, canvasWidth, canvasHeight);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.includeElements).toContain("name");
      expect(callBody.includeElements).toContain("title");
      expect(callBody.includeElements).toContain("qr code");
    });

    it("falls back when API returns empty designs array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          designs: [],
          count: 0,
          errors: ["All variations failed parsing"],
        }),
      });

      const input: AIDesignPrompt = { prompt: "card" };
      const result = await generateAIDesignVariations(
        input,
        canvasWidth,
        canvasHeight,
      );

      expect(result.source).toBe("fallback");
      expect(result.variations).toHaveLength(3);
    });
  });
});
