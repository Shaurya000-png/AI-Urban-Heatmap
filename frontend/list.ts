async function analyzeWithGemini(prompt: string): Promise<string> {
  try {
    // Debug: Check if API key is available
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error('Error: VITE_GEMINI_API_KEY is not set');
      throw new Error('API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    
    // Use the model that's most likely to work
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest", // Try this model first
      // model: "gemini-pro", // Fallback model
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    try {
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Successfully received response from Gemini API');
      return text;
    } catch (genError) {
      console.error('Error generating content:', genError);
      throw new Error(`Content generation failed: ${genError.message}`);
    }
  } catch (error) {
    console.error('Error in analyzeWithGemini:', {
      error: error.message,
      apiKeyConfigured: !!import.meta.env.VITE_GEMINI_API_KEY
    });
    throw new Error(`Failed to analyze with Gemini: ${error.message}`);
  }
}