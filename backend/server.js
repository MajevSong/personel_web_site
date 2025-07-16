const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/chatbot', async (req, res) => {
  const { soru } = req.body;
  // guestbook tablosundan tüm mesajları çek
  const { data, error } = await supabase
    .from('guestbook')
    .select('message,cevap');
  if (error) {
    return res.status(500).json({ cevap: 'Veritabanı hatası!' });
  }
  // Birebir eşleşme ile cevap bul
  const cevapObj = data.find(v => v.message && v.message.toLowerCase() === soru.toLowerCase());
  res.json({ cevap: cevapObj ? (cevapObj.cevap || 'Cevap bulunamadı.') : 'Üzgünüm, bu soruya cevap veremiyorum.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chatbot çalışıyor! Port: ${PORT}`));