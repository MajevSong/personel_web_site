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

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium', // Alternatif: 'gpt2' veya 'distilgpt2'
        inputs: prompt,
        parameters: {
          max_length: 150,
          temperature: 0.7,
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

      // Fallback cevaplar
      if (!answer || answer.length < 5) {
        answer = this.getFallbackResponse(question);
      }

      console.log('Hugging Face cevabı:', answer);
      
      return {
        answer: answer,
        confidence: 0.8, // Hugging Face için sabit güven skoru
        model: 'Hugging Face'
      };

    } catch (error) {
      console.error('Hugging Face hatası:', error);
      
      // Hata durumunda fallback
      return {
        answer: this.getFallbackResponse(question),
        confidence: 0.5,
        model: 'Fallback'
      };
    }
  }

  // Fallback cevaplar
  getFallbackResponse(question) {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('merhaba') || questionLower.includes('selam')) {
      return 'Merhaba! Ben MajevSong\'un AI asistanıyım. Size nasıl yardımcı olabilirim?';
    } else if (questionLower.includes('nasılsın')) {
      return 'İyiyim, teşekkür ederim! Siz nasılsınız?';
    } else if (questionLower.includes('python') || questionLower.includes('programlama')) {
      return 'Python harika bir programlama dilidir! Web geliştirme, veri analizi ve yapay zeka için çok kullanışlıdır.';
    } else if (questionLower.includes('javascript')) {
      return 'JavaScript web geliştirmenin temelidir. Hem frontend hem backend\'de kullanılabilir.';
    } else if (questionLower.includes('teşekkür')) {
      return 'Rica ederim! Başka bir sorunuz varsa yardımcı olmaktan mutluluk duyarım.';
    } else if (questionLower.includes('adın') || questionLower.includes('kimsin')) {
      return 'Ben MajevSong\'un AI asistanıyım! Programlama ve teknoloji konularında size yardımcı olabilirim.';
    } else {
      return 'Üzgünüm, bu soruya tam olarak cevap veremiyorum. Programlama veya teknoloji ile ilgili bir soru sorabilir misiniz?';
    }
  }
}

module.exports = HuggingFaceChatbot; 