const { HfInference } = require('@huggingface/inference');
class HuggingFaceChatbot {
  constructor(apiKey) {
    this.hf = new HfInference(apiKey);
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

      // Basit prompt engineering
      const prompt = `${this.createContext()}\n\nKullanıcı: ${question}\nSen:`;

      // Daha uygun model kullan
      const response = await this.hf.textGeneration({
        model: 'cahya/gpt2-small-turkish',
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.8,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      let answer = response.generated_text || 'Üzgünüm, şu anda cevap veremiyorum.';
      
      // Cevabı temizle
      answer = answer.replace(/Sen:\s*/g, '').trim();
      
      // Eğer cevap çok uzunsa kısalt
      if (answer.length > 200) {
        answer = answer.substring(0, 200) + '...';
      }

      console.log('Hugging Face cevabı:', answer);
      
      return {
        answer: answer,
        confidence: 0.8,
        model: 'Hugging Face GPT-2'
      };

    } catch (error) {
      console.error('Hugging Face hatası:', error);
      
      // Hata durumunda sadece hata mesajı döndür
      return {
        answer: `Üzgünüm, AI modeli şu anda kullanılamıyor. Hata: ${error.message}`,
        confidence: 0,
        model: 'Error'
      };
    }
  }
}

module.exports = HuggingFaceChatbot; 