import { HfInference } from "@huggingface/inference";
import dotenv from 'dotenv';
dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);
const systemPrompt = `You are a helpful assistant.`;

async function test() {
  try {
    const chatCompletion = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Hello!",
        },
      ],
      max_tokens: 500,
    });
    console.log(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    if (error.httpResponse) {
      console.log("BODY", JSON.stringify(error.httpResponse.body, null, 2));
    } else {
      console.error(error);
    }
  }
}
test();
