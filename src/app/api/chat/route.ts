import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserRepository } from "@/lib/repositories/userRepository";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const userRepository = new UserRepository();

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    // Fetch user data from the database
    const user = await userRepository.getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a helpful and friendly customer care bot for Odido, a Dutch telecom company. Your role is to assist users with queries about their telecom services in clear and simple language. Always be empathetic and understanding, especially when users seem confused.
    always provide clear and concise answers based on what user has asked without displaying additional infromation, and if you don't know something, say so. Avoid using technical jargon or complex terms.
    
    User Data:
    - Name: ${user.name}
    - Phone Number: ${user.phoneNumber}
    - Orders: ${JSON.stringify(user.orders)}
    - Incidents: ${JSON.stringify(user.incidents)}
    - Invoices: ${JSON.stringify(user.invoices)}
    
    User query: "${message}"
    
  FORMATTING RULES (VERY IMPORTANT):
    1. Use compact markdown formatting with minimal spacing
    2. Use markdown for formatting:
      - For bold text: **bold text**
      - For bullet points: Use dashes with single space (- Item)
      - For numbered lists: Use numbers (1. Item)
    3. DO NOT put blank lines before or after lists
    4. Connect lists directly to preceding paragraphs
    5. Only use one line break between different paragraphs
    6. After greeting, place the rest of the text in a new line

    
    Examples of GOOD formatting:
    Here's an explanation of your invoice:
    - Monthly fee: €25.00
    - Extra data: €5.00
    - **Total amount**: €30.00
    
    If you need any other information, let me know.
    
    Examples of BAD formatting:
    Here's an explanation of your invoice:
    
    - Monthly fee: €25.00
    
    - Extra data: €5.00
    
    - Total amount: €30.00
    
    If you need any other information, let me know.
    
    IMPORTANT: 
    - If there are any credits or adjustments in the invoice, most of the time the credit is applied because the user stopped using the plan early, mention that explicitly.
    - Be conversational and friendly but keep responses compact with minimal spacing. Use **bold text** for important information. Format invoice amounts and numbers clearly.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Process response to fix any spacing issues while preserving Markdown
    const cleanedResponse = response
      .replace(/\n\s*\n/g, "\n") // Replace multiple line breaks with single one
      .replace(/\n\s*- /g, "\n- ") // Clean spaces before list items
      .replace(/\n\s*\d+\. /g, "\n1. ") // Clean spaces before numbered list items
      .trim();

    return NextResponse.json({ reply: cleanedResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
