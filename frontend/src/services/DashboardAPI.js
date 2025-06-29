import axios from 'axios';

// Replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyBBu9AgnAkE-Hud8jp0kasFYnncUI7QFLY'; // Placeholder
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Fetches company details and related companies using Gemini 2.5 Flash LLM.
 * @param {string} ticker - The stock ticker symbol (e.g., 'AAPL').
 * @returns {Promise<Object>} - JSON object with company name and related companies.
 */
export const DashboardAPI = {
  getCompanyAndRelated: async (ticker) => {
    try {
      // Construct the prompt for the LLM
      const prompt = `Given the stock ticker '${ticker}', return ONLY a valid JSON object with the full company name and up to 5 relevant companies. The response must be valid JSON, no other text. Use only "competitor" or "partnership" as relationship types. Example format: {"name": "Apple Inc", "companies": [{"name": "Microsoft", "ticker": "MSFT", "relationship": "competitor"}, {"name": "Intel", "ticker": "INTC", "relationship": "partnership"}]}`;

      // Call the Gemini LLM API (Google Gemini format)
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [
            { parts: [{ text: prompt }] }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Raw Gemini API response:', response.data);
      // Parse and return the LLM's JSON output
      // Gemini returns the text in response.data.candidates[0].content.parts[0].text
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        // Remove Markdown code block if present
        const cleaned = text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();
        
        // Try to find JSON in the response if it's not pure JSON
        let jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonText = jsonMatch[0];
          const parsed = JSON.parse(jsonText);
          
          // Ensure relationships are only "competitor" or "partnership"
          if (parsed.companies) {
            parsed.companies = parsed.companies.map(company => ({
              ...company,
              relationship: company.relationship === 'competitor' || company.relationship === 'partnership' 
                ? company.relationship 
                : 'competitor' // default to competitor if invalid
            }));
          }
          
          return parsed;
        } else {
          throw new Error('No valid JSON found in response');
        }
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      console.log('DashboardAPI error:', error);
      throw error.response?.data || error.message;
    }
  },
  getStockForecast: async (ticker, time_from, time_to, related_tickers, relationships) => {
    const url = `http://localhost:8000/api/PredictStockPrice`;
    try {
      const response = await axios.get(url, {
        params: {
          ticker,
          time_from,
          time_to,
          related_tickers,
          relationships,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Forecast API error:', error);
      throw error.response?.data || error.message;
    }
  },
}; 