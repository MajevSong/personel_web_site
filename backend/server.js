const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const ChatbotAI = require('./chatbotAI');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Mevcut' : 'Eksik');
console.log('Supabase Key:', supabaseKey ? 'Mevcut' : 'Eksik');

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const chatbotAI = new ChatbotAI(supabaseUrl, supabaseKey);

// AI modelini başlat
let isModelReady = false;
chatbotAI.loadDataAndTrain().then(success => {
  isModelReady = success;
  console.log('AI Model durumu:', isModelReady ? 'Hazır' : 'Hazır değil');
}).catch(error => {
  console.error('AI Model başlatma hatası:', error);
});

app.post('/api/chatbot', async (req, res) => {
  try {
    const { soru } = req.body;
    console.log('Gelen soru:', soru);
    
    if (!soru) {
      return res.status(400).json({ cevap: 'Soru boş olamaz!' });
    }

    if (!isModelReady) {
      // Basit fallback sistemi
      const soruLower = soru.toLowerCase();
      let fallbackCevap = 'AI modeli henüz hazır değil, lütfen birkaç saniye bekleyin...';
      
      if (soruLower.includes('merhaba') || soruLower.includes('selam')) {
        fallbackCevap = 'Merhaba! AI modeli henüz hazırlanıyor, ama size yardımcı olmaya çalışıyorum!';
      } else if (soruLower.includes('nasılsın')) {
        fallbackCevap = 'İyiyim! AI modeli eğitiliyor, biraz bekleyin lütfen.';
      }
      
      return res.status(503).json({ 
        cevap: fallbackCevap,
        confidence: 0.1
      });
    }

    // AI ile cevap al
    const response = await chatbotAI.getResponse(soru);
    console.log('AI Cevabı:', response.answer, 'Güven:', response.confidence);
    
    res.json({ 
      cevap: response.answer,
      confidence: response.confidence
    });
  } catch (err) {
    console.error('Genel hata:', err);
    res.status(500).json({ cevap: `Sunucu hatası: ${err.message}` });
  }
});

// Model durumunu kontrol et
app.get('/api/chatbot/status', (req, res) => {
  res.json({ 
    ready: isModelReady,
    message: isModelReady ? 'AI Model hazır' : 'AI Model eğitiliyor...'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI Chatbot çalışıyor! Port: ${PORT}`));