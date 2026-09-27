"use server";

import { GoogleGenAI, Type } from "@google/genai";
import Razorpay from "razorpay";
import { getMerchantByStoreName } from "@/lib/mock-db";

export type Message = {
  role: "user" | "model";
  text: string;
};

export type CheckoutCardPayload = {
  productName: string;
  originalPrice: number;
  discountApplied: number;
  finalPrice: number;
  qrImageUrl: string;
  qrId: string;
  merchantId: string;
};

export type ChatAgentResponse =
  | { success: true; payload: CheckoutCardPayload }
  | { success: false; error: string };

const checkoutTool = {
  functionDeclarations: [
    {
      name: "generate_checkout_card",
      description: "Generate a checkout card with a 5% discount and UPI payment intent data.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          originalPrice: { type: Type.NUMBER },
          discountApplied: { type: Type.NUMBER },
          finalPrice: { type: Type.NUMBER },
        },
        required: [
          "productName",
          "originalPrice",
          "discountApplied",
          "finalPrice",
        ],
      },
    },
  ],
};

export async function processChatMessage(
  history: Message[],
  newMessage: string,
  storeName: string,
): Promise<ChatAgentResponse> {
  try {
    const merchant = await getMerchantByStoreName(storeName);
    if (!merchant) {
      return { success: false, error: `The store "${storeName}" could not be found.` };
    }

    if (!merchant.razorpayKeyId || !merchant.razorpayKeySecret) {
      return { success: false, error: `${merchant.storeName} is not ready to accept payments yet. Please ask the store owner to configure Razorpay keys in the dashboard.` };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY is not configured." };
    }

    const ai = new GoogleGenAI({ apiKey });
    const razorpay = new Razorpay({
      key_id: merchant.razorpayKeyId,
      key_secret: merchant.razorpayKeySecret,
    });
    const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
    const systemInstruction =
      `You are an e-commerce checkout assistant representing the store "${merchant.storeName}". If the user asks about a product, answer briefly. If they show purchase intent or price hesitation, you MUST call the \`generate_checkout_card\` tool to offer a 5% discount and generate the UPI payment data.`;
    const contents = [
      ...history.map((message) => ({
        role: message.role,
        parts: [{ text: message.text }],
      })),
      {
        role: "user" as const,
        parts: [{ text: newMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        tools: [checkoutTool],
      },
    });

    const functionCall = response.functionCalls?.find(
      (call) => call.name === "generate_checkout_card",
    );

    if (!functionCall?.args) {
      return { success: false, error: response.text ?? "I could not generate a response." };
    }

    const toolArguments = functionCall.args as unknown as Omit<CheckoutCardPayload, "qrImageUrl" | "qrId">;
    if (!Number.isFinite(toolArguments.finalPrice) || toolArguments.finalPrice <= 0) {
      return { success: false, error: "The checkout amount is invalid." };
    }

    // Mock QR code generator to bypass Razorpay authentication for the demo
const mockUpiString = `upi://pay?pa=demo@ybl&pn=${encodeURIComponent(merchant.storeName)}&am=${toolArguments.finalPrice}`;
const qrCode = {
  image_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockUpiString)}`,
  id: `qr_mock_${Date.now()}`
};

    return {
      success: true,
      payload: {
        ...toolArguments,
        qrImageUrl: qrCode.image_url,
        qrId: qrCode.id,
        merchantId: merchant.id,
      },
    };
  } catch (error) {
    console.error("processChatMessage failed", error);
    return {
      success: false,
      error: "Unable to process the checkout request right now.",
    };
  }
}
