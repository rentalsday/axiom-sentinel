export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY; // This pulls from Vercel's secret vault

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "grok-4-0709", 
                messages: [
                    {
                        role: "system",
                        content: `ROLE: Senior M&A Attorney. CRITICAL: Exhaustive analysis. WORKFLOW: Identify Risk, Location, and Draft the 'Redline' fix.`
                    },
                    {
                        role: "user",
                        content: `Analyze this document for Change of Control and Termination risks: ${text}`
                    }
                ]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to reach Grok API" });
    }
}
