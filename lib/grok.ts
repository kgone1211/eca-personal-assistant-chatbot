// Grok API integration for trend analysis using xAI API

interface GrokTrendAnalysis {
  trendingTopics: Array<{
    topic: string;
    frequency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    trendDirection: 'up' | 'down' | 'stable';
    confidence: number;
  }>;
  coachingPatterns: Array<{
    pattern: string;
    effectiveness: number;
    frequency: number;
    description: string;
  }>;
  clientInsights: Array<{
    insight: string;
    category: 'pain_point' | 'opportunity' | 'success_pattern' | 'risk';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }>;
  recommendations: Array<{
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
    impact: string;
    action: string;
  }>;
}

class GrokClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GROK_API_KEY || '';
    this.baseUrl = 'https://api.x.ai/v1'; // xAI API endpoint
  }

  async analyzeTrends(data: {
    transcripts: Array<{
      content: string;
      callDate: string;
      participants?: string;
      analysis?: any;
    }>;
    trainingBlobs: Array<{
      content: string;
      createdAt: string;
      voiceVersion: number;
    }>;
    insights: Array<{
      type: string;
      title: string;
      description: string;
      severity: string;
      createdAt: string;
    }>;
  }): Promise<GrokTrendAnalysis> {
    if (!this.apiKey) {
      console.warn('Grok API key not found, falling back to OpenAI');
      return this.fallbackToOpenAI(data);
    }

    const prompt = `
    Analyze the following coaching data to identify trends, patterns, and insights:

    TRANSCRIPTS:
    ${data.transcripts.map(t => `Date: ${t.callDate}\nContent: ${t.content.slice(0, 1000)}...`).join('\n\n')}

    TRAINING DATA:
    ${data.trainingBlobs.map(b => `Version: ${b.voiceVersion}\nContent: ${b.content.slice(0, 1000)}...`).join('\n\n')}

    EXISTING INSIGHTS:
    ${data.insights.map(i => `${i.type}: ${i.title} - ${i.description}`).join('\n')}

    Please analyze this data and provide:
    1. Trending topics with frequency and sentiment
    2. Effective coaching patterns
    3. Client insights and pain points
    4. Actionable recommendations

    Format as JSON with the following structure:
    {
      "trendingTopics": [{"topic": "string", "frequency": number, "sentiment": "positive|negative|neutral", "trendDirection": "up|down|stable", "confidence": number}],
      "coachingPatterns": [{"pattern": "string", "effectiveness": number, "frequency": number, "description": "string"}],
      "clientInsights": [{"insight": "string", "category": "pain_point|opportunity|success_pattern|risk", "severity": "low|medium|high|critical", "confidence": number}],
      "recommendations": [{"recommendation": "string", "priority": "low|medium|high", "impact": "string", "action": "string"}]
    }
    `;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are Grok, an expert data analyst specializing in coaching trends and client behavior patterns. Analyze the provided data and return structured JSON insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0].message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error calling Grok API:', error);
      // Fallback to OpenAI if Grok fails
      return this.fallbackToOpenAI(data);
    }
  }

  private async fallbackToOpenAI(data: any): Promise<GrokTrendAnalysis> {
    const { openai } = await import('./openai');
    
    const prompt = `
    Analyze the following coaching data to identify trends, patterns, and insights:

    TRANSCRIPTS:
    ${data.transcripts.map((t: any) => `Date: ${t.callDate}\nContent: ${t.content.slice(0, 1000)}...`).join('\n\n')}

    TRAINING DATA:
    ${data.trainingBlobs.map((b: any) => `Version: ${b.voiceVersion}\nContent: ${b.content.slice(0, 1000)}...`).join('\n\n')}

    EXISTING INSIGHTS:
    ${data.insights.map((i: any) => `${i.type}: ${i.title} - ${i.description}`).join('\n')}

    Please analyze this data and provide:
    1. Trending topics with frequency and sentiment
    2. Effective coaching patterns
    3. Client insights and pain points
    4. Actionable recommendations

    Format as JSON with the following structure:
    {
      "trendingTopics": [{"topic": "string", "frequency": number, "sentiment": "positive|negative|neutral", "trendDirection": "up|down|stable", "confidence": number}],
      "coachingPatterns": [{"pattern": "string", "effectiveness": number, "frequency": number, "description": "string"}],
      "clientInsights": [{"insight": "string", "category": "pain_point|opportunity|success_pattern|risk", "severity": "low|medium|high|critical", "confidence": number}],
      "recommendations": [{"recommendation": "string", "priority": "low|medium|high", "impact": "string", "action": "string"}]
    }
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert data analyst specializing in coaching trends and client behavior patterns. Analyze the provided data and return structured JSON insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message?.content || '{}';
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing trends with OpenAI fallback:', error);
      // Return mock data for development
      return this.getMockTrendAnalysis();
    }
  }

  private getMockTrendAnalysis(): GrokTrendAnalysis {
    return {
      trendingTopics: [
        {
          topic: "Metabolic Health",
          frequency: 85,
          sentiment: "positive",
          trendDirection: "up",
          confidence: 0.92
        },
        {
          topic: "Sleep Optimization",
          frequency: 72,
          sentiment: "positive", 
          trendDirection: "up",
          confidence: 0.88
        },
        {
          topic: "Stress Management",
          frequency: 68,
          sentiment: "neutral",
          trendDirection: "stable",
          confidence: 0.85
        }
      ],
      coachingPatterns: [
        {
          pattern: "Biofeedback-driven protocols",
          effectiveness: 0.94,
          frequency: 45,
          description: "Using metabolic markers to guide client protocols shows highest success rates"
        },
        {
          pattern: "Identity-based behavior change",
          effectiveness: 0.89,
          frequency: 38,
          description: "Framing changes around identity shifts rather than habits leads to better adherence"
        }
      ],
      clientInsights: [
        {
          insight: "Clients struggle most with circadian rhythm consistency",
          category: "pain_point",
          severity: "high",
          confidence: 0.91
        },
        {
          insight: "High-protein breakfast protocols show 3x better compliance",
          category: "success_pattern",
          severity: "medium",
          confidence: 0.87
        }
      ],
      recommendations: [
        {
          recommendation: "Implement circadian rhythm tracking tools",
          priority: "high",
          impact: "Could improve client retention by 25%",
          action: "Add sleep/wake time logging to client dashboard"
        },
        {
          recommendation: "Create protein-focused meal planning templates",
          priority: "medium",
          impact: "Expected to boost protocol adherence by 40%",
          action: "Develop automated meal plan generator"
        }
      ]
    };
  }
}

export const grok = new GrokClient();
export type { GrokTrendAnalysis };
