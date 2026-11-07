
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env")
});

async function chatWithAI(req, res) {
  try {
    const { message } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid message under 5000 characters."
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: "Groq API key is missing from backend/.env."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: `You are SETU AI Assistant, an administrative
support assistant for a healthcare clinic referral platform.

Your responsibilities:
- Explain referral workflows.
- Prepare referral summaries.
- Identify missing administrative information.
- Create checklists for human review.
- Explain general healthcare coordination.

Safety rules:
- Never diagnose or prescribe treatment.
- Never make clinical decisions.
- Never claim a doctor approved something.
- Never invent patient information.
- Clearly label suggestions as AI-generated.
- A qualified healthcare professional must verify
  all clinical information.
- This is a development prototype.
- Ask users to use fictional test information only.
- Do not request real patient information.

AI assists. Human verifies. Doctor decides.`
            },
            {
              role: "user",
              content: message.trim()
            }
          ],
          temperature: 0.4,
          max_completion_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GROQ API ERROR:", {
        status: response.status,
        error: data.error || data
      });

      return res.status(502).json({
        success: false,
        message: "Groq AI request failed. Check the backend terminal."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "Groq returned an empty response."
      });
    }

    return res.status(200).json({
      success: true,
      reply,
      mode: "live_ai",
      disclaimer: "AI-generated suggestions. Human verification required."
    });

  } catch (error) {
    console.error("SETU GROQ ERROR:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to connect to Groq AI. Check the backend terminal."
    });
  }
}

module.exports = { chatWithAI };
