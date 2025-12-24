// =======================
// AI CHATBOT SERVICE
// =======================
// Helps users navigate the website and check order history

class ChatbotService {
  constructor() {
    this.apiKey = "YOUR_GEMINI_API_KEY_HERE"; // Same as ai-service
    this.model = "gemini-1.5-flash";
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    this.conversationHistory = [];
  }

  // Get response from chatbot
  async getResponse(message, userContext = {}) {
    try {
      if (!this.apiKey || this.apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        return this.getFallbackResponse(message, userContext);
      }

      const context = `
You are a helpful assistant for PrintAhead, a campus stationery and printing service website.
You help users:
- Navigate the website
- Check their order history
- Understand how to place orders
- Get help with printing services
- Manage their account

Current user context:
${userContext.userId ? `- User ID: ${userContext.userId}` : "- User: Guest"}
${userContext.userEmail ? `- Email: ${userContext.userEmail}` : ""}
${
  userContext.orderCount !== undefined
    ? `- Orders placed: ${userContext.orderCount}`
    : ""
}
${
  userContext.credits !== undefined
    ? `- Print Credits: ₹${userContext.credits}`
    : ""
}

Keep responses brief, friendly, and helpful. If asked about orders, provide general guidance.
For specific order details, direct them to check their order history.
`;

      const prompt = `${context}\n\nUser: ${message}\n\nAssistant:`;

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
            maxOutputTokens: 256,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const data = await response.json();
      let text = "";
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        text = data.candidates[0].content.parts[0].text;
      }

      return { success: true, message: text.trim() };
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      return this.getFallbackResponse(message, userContext);
    }
  }

  // Fallback responses when AI is not available
  getFallbackResponse(message, userContext) {
    const lowerMessage = message.toLowerCase();

    // Navigation help
    if (
      lowerMessage.includes("how to order") ||
      lowerMessage.includes("order") ||
      lowerMessage.includes("buy")
    ) {
      return {
        success: true,
        message:
          "To place an order:\n1. Browse stationery items or upload files for printing\n2. Add items to your cart\n3. Fill in pickup details\n4. Choose payment method\n5. Submit your order!\n\nYou can also use Print Credits for faster checkout.",
      };
    }

    // Order history
    if (
      lowerMessage.includes("order history") ||
      lowerMessage.includes("my orders") ||
      lowerMessage.includes("track")
    ) {
      if (!userContext.userId) {
        return {
          success: true,
          message:
            "Please sign in to view your order history. You can access it from your account page or by clicking on your profile.",
        };
      }
      return {
        success: true,
        message: `You have ${
          userContext.orderCount || 0
        } orders. Click on "My Account" or "Order History" to view all your orders and their status.`,
      };
    }

    // Account help
    if (
      lowerMessage.includes("account") ||
      lowerMessage.includes("profile") ||
      lowerMessage.includes("credits")
    ) {
      if (!userContext.userId) {
        return {
          success: true,
          message:
            "Sign in or create an account to manage your profile, view orders, and use Print Credits.",
        };
      }
      return {
        success: true,
        message: `Your account info:\n- Orders: ${
          userContext.orderCount || 0
        }\n- Print Credits: ₹${
          userContext.credits || 0
        }\n\nVisit "My Account" to manage your profile and wallet.`,
      };
    }

    // Payment help
    if (
      lowerMessage.includes("payment") ||
      lowerMessage.includes("pay") ||
      lowerMessage.includes("card") ||
      lowerMessage.includes("upi")
    ) {
      return {
        success: true,
        message:
          "We accept:\n- Cash on Delivery\n- Card Payment\n- UPI Payment\n- Print Credits (prepaid wallet)\n\nChoose your preferred method at checkout!",
      };
    }

    // General help
    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("what") ||
      lowerMessage.includes("how")
    ) {
      return {
        success: true,
        message:
          "I can help you with:\n- Navigating the website\n- Placing orders\n- Checking order history\n- Payment options\n- Account management\n\nWhat would you like to know?",
      };
    }

    // Default response
    return {
      success: true,
      message:
        "I'm here to help! You can ask me about:\n- How to place orders\n- Order history\n- Payment methods\n- Account management\n- Printing services\n\nWhat can I help you with?",
    };
  }
}

// Create singleton instance
window.chatbotService = new ChatbotService();
