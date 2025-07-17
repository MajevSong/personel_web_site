const express = require('express');
const cors = require('cors');
const HuggingFaceChatbot = require('./huggingfaceChatbot');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const hfApiKey = process.env.HUGGINGFACE_API_KEY;

console.log('Hugging Face API Key:', hfApiKey ? 'Mevcut' : 'Eksik');

if (!hfApiKey) {
  console.error('Hugging Face API Key eksik!');
  console.log('Hugging Face\'dan ücretsiz API key alabilirsin: https://huggingface.co/settings/tokens');
  process.exit(1);
}

const chatbot = new HuggingFaceChatbot(hfApiKey);

app.post('/api/chatbot', async (req, res) => {
  try {
    const { soru } = req.body;
    console.log('Gelen soru:', soru);
    
    if (!soru) {
      return res.status(400).json({ cevap: 'Soru boş olamaz!' });
    }

    // Hugging Face ile cevap al
    const response = await chatbot.getResponse(soru);
    console.log('Chatbot Cevabı:', response.answer, 'Model:', response.model);
    
    res.json({ 
      cevap: response.answer,
      confidence: response.confidence,
      model: response.model
    });
  } catch (err) {
    console.error('Genel hata:', err);
    res.status(500).json({ cevap: `Sunucu hatası: ${err.message}` });
    }
});

// Chatbot durumunu kontrol et
app.get('/api/chatbot/status', (req, res) => {
  res.json({ 
    ready: true,
    message: 'Hugging Face Chatbot hazır',
    model: 'Hugging Face'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hugging Face Chatbot çalışıyor! Port: ${PORT}`));