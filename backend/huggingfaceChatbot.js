const fetch = require('node-fetch');

class HuggingFaceChatbot {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.conversationHistory = [];
  }

  // Basit context oluştur
  createContext() {
    return `Sen MajevSong'un kişisel AI asistanısın. Türkçe konuşuyorsun ve programlama, teknoloji konularında uzmansın. 
    Kısa, net ve yardımcı cevaplar ver. Eğer bir konuda emin değilsen, dürüstçe söyle.`;
  }

  // Soruya cevap ver
  async getResponse(question) {
    try {
      console.log('Hugging Face modeline soru gönderiliyor:', question);

      const url = 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct';
      const body = {
        inputs: {
          past_user_inputs: [],
          generated_responses: [],
          text: question
        },
        parameters: {
          max_length: 200,
          temperature: 0.6,
          top_p: 0.95,
          do_sample: true
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API hatası: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let answer = data.generated_text || (data.generated_responses && data.generated_responses[0]) || 'Üzgünüm, cevap alınamadı.';
      answer = answer.replace(/Sen:\s*/g, '').trim();
      if (answer.length > 200) {
        answer = answer.substring(0, 200) + '...';
      }
      console.log('Hugging Face cevabı:', answer);
      return {
        answer: answer,
        confidence: 0.8,
        model: 'Meta-Llama-3-8B-Instruct'
      };
    } catch (error) {
      console.error('Hugging Face hatası:', error);
      return {
        answer: `Üzgünüm, AI modeli şu anda kullanılamıyor. Hata: ${error.message}`,
        confidence: 0,
        model: 'Error'
      };
    }
  }
}

module.exports = HuggingFaceChatbot; 