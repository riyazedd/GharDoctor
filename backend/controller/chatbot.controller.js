import { HfInference } from "@huggingface/inference";

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN is not configured" });
    }

    const hf = new HfInference(process.env.HF_TOKEN);

    const systemPrompt = `You are a helpful and polite AI assistant for "GharDoctor", a home maintenance and repair service platform.
You assist users with FAQs, basic troubleshooting, and guide them on how to book services like plumbing, electrical work, cleaning, etc.
Keep your answers concise, friendly, and strictly related to home maintenance or using the GharDoctor platform. Do not answer questions completely unrelated to the domain.`;

    const chatCompletion = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ error: "An error occurred while communicating with the AI. " + (error.message || "") });
  }
};
