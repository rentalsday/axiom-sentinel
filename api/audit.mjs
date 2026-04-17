export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing." });
    }

    const systemPrompt = `ROLE: Lead M&A Partner and Adversarial Auditor.

MISSION: Audit for 'Change of Control', 'Termination', and structural M&A vulnerabilities.

STRICT OUTPUT RULES:
1. Every 'Red Flag' entry must follow this exact syntax:
   - [Category]: [Vulnerability Description]. Location: [Section]. Proposed Redline Fix: [Instruction] '[Full Legal Text]'
2. Ensure the string "Proposed Redline Fix:" is present in every flag line for parsing.
3. No bolding (**) or markdown headers (###) inside the Red Flag list.

OUTPUT FORMAT:
DOCUMENT TITLE: [Title]
RISK SCORE: [0-10]/10
RED FLAGS: 
- [Flag 1]
- [Flag 2]

SUMMARY: [Executive Synthesis]
LEGAL NOTICE: Preliminary audit only.`;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "grok-beta", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Audit this instrument: ${text.substring(0, 45000)}` }
                ],
                temperature: 0.1 
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Analysis failed." });
    }
}
