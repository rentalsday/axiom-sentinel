export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing in Vercel settings." });
    }

    // REFINED PROMPT: Forced structure for side-by-side parsing
    const systemPrompt = `ROLE: Lead M&A Partner and Adversarial Auditor specializing in Senior Counsel Logic.

MISSION: Perform an exhaustive audit for 'Change of Control', 'Termination', and structural M&A vulnerabilities. Identify risks impacting valuation, clean title transfer, and post-close liability.

STRICT OUTPUT RULES:
1. Every Red Flag MUST follow this exact syntax for the frontend parser:
   - [Category]: [Vulnerability Description]. Location: [Section X]. Proposed Redline Fix: [Drafting Instruction] '[Full Legal Text]'
2. No empty headers. Every "Proposed Redline Fix:" must be immediately followed by the specific fix.
3. Use 'Replace Section [X] in its entirety with:' for fundamental flaws.
4. Ensure the redline is professional, non-truncated, and solves the identified revenue leak or legal risk.

OUTPUT FORMAT:
DOCUMENT TITLE: [Exact Title]
RISK SCORE: [Score]/10
RED FLAGS: 
- [Risk Category]: [Description]. Location: [Section]. Proposed Redline Fix: [Instruction] '[Legal Clause]'

SUMMARY: [Executive synthesis of aggregate risks]
LEGAL NOTICE: For preliminary auditing purposes only; confirm with counsel.`;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "grok-beta", // Use "grok-beta" or "grok-2-1212" for standard reliable parsing
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Perform a comprehensive analysis of the following instrument. Do not skip sections:\n\n${text}` }
                ],
                temperature: 0.1 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || "Grok API Error" 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Server crashed during analysis.", details: error.message });
    }
}
