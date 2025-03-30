import { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const { text, source = "pl", target = "en" } = JSON.parse(body);

      if (!text) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing text" }));
        return;
      }

      const prompt = `Translate this from ${source} to ${target}:\n\n"${text}"`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      });
//force redeploy
      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim();

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ translation }));
    } catch (error) {
      console.error("Translation error:", error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
}
