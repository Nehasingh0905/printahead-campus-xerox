// =======================
// AI PRINT SUGGESTIONS SERVICE
// =======================
// Uses Google Gemini API for intelligent print recommendations

class AIService {
  constructor() {
    // TODO: Replace with your Google Gemini API key
    // Get it from: https://aistudio.google.com/app/apikey (new) or https://makersuite.google.com/app/apikey (legacy)
    this.apiKey = "YOUR_GEMINI_API_KEY_HERE";
    // Using Gemini 1.5 Flash model (fast and free tier available)
    // Alternative: 'gemini-1.5-pro' for more complex reasoning
    this.model = "gemini-1.5-flash";
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  // Get print suggestions based on file type and name
  async getPrintSuggestions(fileName, fileType, fileSize = null) {
    try {
      if (!this.apiKey || this.apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        // Fallback suggestions if API key not configured
        return this.getFallbackSuggestions(fileName, fileType);
      }

      const prompt = `You are a helpful assistant for a print shop. Analyze the file details and provide optimal print recommendations.

File Details:
- File name: ${fileName}
- File type: ${fileType}
${fileSize ? `- File size: ${Math.round(fileSize / 1024)} KB` : ""}

Provide a JSON response ONLY (no markdown, no code blocks) with print recommendations based on the file type and name:
{
  "colorMode": "mono" or "color",
  "sides": "single" or "duplex",
  "copies": number (default 1),
  "paperSize": "A4" or "A3",
  "binding": "none" or "staple" or "spiral",
  "quality": "standard" or "high",
  "recommendation": "brief explanation in one sentence",
  "estimatedPrice": number in rupees (₹)
}

Consider:
- Image files (PNG, JPG, etc.) should use color printing
- PDFs and documents typically benefit from duplex (double-sided)
- Presentations should be color with multiple slides per page
- Resumes/CVs need high-quality color printing
- Reports benefit from duplex with stapling
- Academic papers often need duplex printing`;

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Gemini API error:", errorData);
        throw new Error(`AI service unavailable: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response structures
      let text = "";
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        text = data.candidates[0].content.parts[0].text;
      } else if (data.text) {
        text = data.text;
      }

      if (!text) {
        throw new Error("No response from AI");
      }

      // Try to parse JSON directly (if responseMimeType was used)
      try {
        const suggestions = JSON.parse(text.trim());
        return { success: true, suggestions };
      } catch (parseError) {
        // Fallback: Extract JSON from markdown code blocks or plain text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          return { success: true, suggestions };
        }
      }

      return this.getFallbackSuggestions(fileName, fileType);
    } catch (error) {
      console.error("Error getting AI suggestions from Gemini:", error);
      // Return fallback suggestions on error
      return this.getFallbackSuggestions(fileName, fileType);
    }
  }

  // Fallback suggestions when AI is not available
  getFallbackSuggestions(fileName, fileType) {
    const lowerName = fileName.toLowerCase();
    const lowerType = fileType.toLowerCase();

    let suggestions = {
      colorMode: "mono",
      sides: "single",
      copies: 1,
      paperSize: "A4",
      binding: "none",
      quality: "standard",
      recommendation: "Standard print settings",
      estimatedPrice: 20,
    };

    // Image files - suggest color
    if (
      lowerType.includes("image") ||
      lowerType.includes("png") ||
      lowerType.includes("jpg") ||
      lowerType.includes("jpeg")
    ) {
      suggestions.colorMode = "color";
      suggestions.quality = "high";
      suggestions.estimatedPrice = 30;
      suggestions.recommendation =
        "Image file detected - color printing recommended";
    }

    // PDF files
    if (lowerType.includes("pdf")) {
      suggestions.sides = "duplex";
      suggestions.recommendation =
        "PDF document - double-sided printing recommended";
    }

    // Word documents
    if (
      lowerType.includes("word") ||
      lowerType.includes("docx") ||
      lowerType.includes("doc")
    ) {
      suggestions.sides = "duplex";
      suggestions.binding = "staple";
      suggestions.recommendation =
        "Document file - double-sided with staple recommended";
    }

    // Presentation files
    if (
      lowerType.includes("powerpoint") ||
      lowerType.includes("ppt") ||
      lowerName.includes("slide")
    ) {
      suggestions.colorMode = "color";
      suggestions.copies = 1;
      suggestions.binding = "staple";
      suggestions.estimatedPrice = 40;
      suggestions.recommendation =
        "Presentation detected - color with multiple slides per page recommended";
    }

    // Resume/CV
    if (lowerName.includes("resume") || lowerName.includes("cv")) {
      suggestions.colorMode = "color";
      suggestions.quality = "high";
      suggestions.paperSize = "A4";
      suggestions.binding = "none";
      suggestions.estimatedPrice = 25;
      suggestions.recommendation =
        "Resume/CV - high-quality color printing recommended";
    }

    // Reports
    if (lowerName.includes("report") || lowerName.includes("lab")) {
      suggestions.sides = "duplex";
      suggestions.binding = "staple";
      suggestions.recommendation =
        "Report detected - double-sided with staple recommended";
    }

    return { success: true, suggestions };
  }
}

// Create singleton instance
window.aiService = new AIService();
