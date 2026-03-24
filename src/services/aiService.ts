import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function askAquariumExpert(prompt: string, context: any) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please set GEMINI_API_KEY in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    Sei un esperto di acquariologia (Smart Guardian AI). 
    Il tuo compito è fornire consigli precisi e sicuri per la gestione degli acquari.
    
    CONTESTO DELL'ACQUARIO ATTUALE:
    - Tipo: ${context.tank?.type || 'Sconosciuto'}
    - Volume: ${context.tank?.volume || 'Sconosciuto'} litri
    - Abitanti: ${JSON.stringify(context.inhabitants || {})}
    - Ultimi parametri: ${JSON.stringify(context.latestLogs || {})}
    
    LINEE GUIDA:
    1. Sii professionale, empatico e pratico.
    2. Se l'utente segnala un problema (es. acqua verde, pesci boccheggianti), fornisci una lista di controlli immediati.
    3. Suggerisci soluzioni passo-passo.
    4. Se i parametri dell'acqua sono fuori norma nel contesto fornito, evidenzialo.
    5. Usa un linguaggio semplice ma tecnicamente accurato.
    6. Rispondi in italiano.
    7. Se non sei sicuro, suggerisci di consultare un esperto locale o di fare un cambio d'acqua parziale come misura di sicurezza.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
