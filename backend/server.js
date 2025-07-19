const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const natural = require('natural');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Supabase bağlantı bilgileri eksik!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

app.post('/api/chatbot', async (req, res) => {
  try {
    console.log('Gelen body:', req.body);
    const soru = req.body && req.body.soru;
    if (!soru) {
      return res.status(400).json({ cevap: 'Soru alanı eksik veya body yanlış formatta gönderildi! (JSON ve {"soru": "..."} şeklinde olmalı)' });
    }
    let cevap = null;
    // Önce tam eşleşme ara
    let { data, error } = await supabase
      .from('chatbot_knowledge')
      .select('answer')
      .eq('question', soru)
      .maybeSingle();
    if (error) throw error;
    if (data && data.answer) {
      cevap = data.answer;
      await supabase.from('chatbot_logs').insert([{ question: soru, answer: cevap }]);
      return res.json({ cevap });
    }
    // Tam eşleşme yoksa, ILIKE ile benzer arama yap
    let { data: likeData, error: likeError } = await supabase
      .from('chatbot_knowledge')
      .select('answer, question')
      .ilike('question', `%${soru}%`)
      .limit(1);
    if (likeError) throw likeError;
    if (likeData && likeData.length) {
      cevap = likeData[0].answer;
      await supabase.from('chatbot_logs').insert([{ question: soru, answer: cevap }]);
      return res.json({ cevap });
    }
    // Levenshtein mesafesi ile en yakın soruyu bul
    let { data: allData, error: allError } = await supabase
      .from('chatbot_knowledge')
      .select('answer, question');
    if (allError) throw allError;
    if (allData && allData.length) {
      let minDist = Infinity;
      let bestMatch = null;
      allData.forEach(item => {
        const dist = natural.LevenshteinDistance(soru.toLowerCase(), item.question.toLowerCase());
        if (dist < minDist) {
          minDist = dist;
          bestMatch = item;
        }
      });
      if (bestMatch && minDist <= Math.max(5, Math.floor(soru.length * 0.4))) {
        cevap = bestMatch.answer;
        await supabase.from('chatbot_logs').insert([{ question: soru, answer: cevap }]);
        return res.json({ cevap });
      }
    }
    // Hiçbir şey bulunamazsa
    cevap = 'Üzgünüm, bu soruya henüz bir cevabım yok.';
    await supabase.from('chatbot_logs').insert([{ question: soru, answer: cevap }]);
    return res.json({ cevap });
  } catch (err) {
    console.error('Genel hata:', err);
    res.status(500).json({ cevap: `Sunucu hatası: ${err.message}` });
    }
});

// Chatbot durumunu kontrol et
app.get('/api/chatbot/status', (req, res) => {
  res.json({ 
    ready: true,
    message: 'Supabase Chatbot hazır',
    model: 'Supabase Only'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Supabase Chatbot çalışıyor! Port: ${PORT}`));