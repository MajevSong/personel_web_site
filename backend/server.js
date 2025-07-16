const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
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

app.post('/api/chatbot', async (req, res) => {
  try {
    const { soru } = req.body;
    console.log('Gelen soru:', soru);
    
    if (!soru) {
      return res.status(400).json({ cevap: 'Soru boş olamaz!' });
    }

    // guestbook tablosundan tüm mesajları çek
    const { data, error } = await supabase
      .from('guestbook')
      .select('message,cevap');
    
    if (error) {
      console.error('Supabase hatası:', error);
      return res.status(500).json({ cevap: `Veritabanı hatası: ${error.message}` });
    }

    console.log('Çekilen veri sayısı:', data ? data.length : 0);
    
    // Birebir eşleşme ile cevap bul
    const cevapObj = data.find(v => v.message && v.message.toLowerCase() === soru.toLowerCase());
    
    if (cevapObj) {
      console.log('Cevap bulundu:', cevapObj.cevap);
      res.json({ cevap: cevapObj.cevap || 'Cevap bulunamadı.' });
    } else {
      console.log('Cevap bulunamadı');
      res.json({ cevap: 'Üzgünüm, bu soruya cevap veremiyorum.' });
    }
  } catch (err) {
    console.error('Genel hata:', err);
    res.status(500).json({ cevap: `Sunucu hatası: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chatbot çalışıyor! Port: ${PORT}`));