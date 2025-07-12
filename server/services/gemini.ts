import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface SafetyRecommendation {
  type: string;
  title: string;
  description: string;
  priority: string;
  location?: string;
}

export async function generateSafetyRecommendations(
  location: string,
  recentIncidents: any[]
): Promise<SafetyRecommendation[]> {
  try {
    const incidentContext = recentIncidents.length > 0 
      ? `Recent incidents in the area: ${recentIncidents.map(i => `${i.type} at ${i.location}`).join(', ')}`
      : 'No recent incidents reported';

    const prompt = `As a women's safety expert for rural Maharashtra, India, provide 3 specific safety recommendations based on:
    
    Location: ${location}
    ${incidentContext}
    
    Consider:
    - Rural connectivity challenges
    - Local transportation patterns
    - Cultural context of Maharashtra
    - Time-based safety concerns
    - Community safety resources
    
    Provide practical, actionable recommendations that are relevant to women's safety in rural Maharashtra.
    
    Respond with JSON in this exact format:
    {
      "recommendations": [
        {
          "type": "route" | "time" | "general",
          "title": "Brief recommendation title",
          "description": "Detailed actionable advice",
          "priority": "low" | "medium" | "high"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" }
                },
                required: ["type", "title", "description", "priority"]
              }
            }
          },
          required: ["recommendations"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const data = JSON.parse(rawJson);
    
    return data.recommendations.map((rec: any) => ({
      ...rec,
      location: location
    }));

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback recommendations if API fails
    return [
      {
        type: "route",
        title: "Use Well-Lit Main Roads",
        description: "Avoid shortcuts and use main roads with better lighting and more people, especially during evening hours.",
        priority: "high",
        location: location
      },
      {
        type: "time",
        title: "Travel During Peak Hours",
        description: "Plan your travel between 7 AM to 7 PM when there's more activity and better visibility in rural areas.",
        priority: "medium",
        location: location
      },
      {
        type: "general",
        title: "Keep Emergency Contacts Updated",
        description: "Ensure your family knows your travel plans and expected arrival times. Regular check-ins provide added security.",
        priority: "high",
        location: location
      }
    ];
  }
}

export async function analyzeSafetyContext(
  location: string,
  timeOfDay: string,
  incidentType: string
): Promise<string> {
  try {
    const prompt = `Analyze this safety incident for rural Maharashtra context:
    
    Location: ${location}
    Time: ${timeOfDay}
    Incident Type: ${incidentType}
    
    Provide a brief analysis of contributing factors and prevention suggestions specific to rural Maharashtra women's safety.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to analyze safety context at this time.";
  } catch (error) {
    console.error('Safety analysis error:', error);
    return "Safety analysis unavailable. Please contact local authorities for guidance.";
  }
}
