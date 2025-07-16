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

    // guestbook tablosundan sadece message kolonunu çek
    const { data, error } = await supabase
      .from('guestbook')
      .select('message');
    
    if (error) {
      console.error('Supabase hatası:', error);
      return res.status(500).json({ cevap: `Veritabanı hatası: ${error.message}` });
    }

    console.log('Çekilen veri sayısı:', data ? data.length : 0);
    
    // Basit cevap sistemi
    const soruLower = soru.toLowerCase();
    let cevap = 'Üzgünüm, bu soruya cevap veremiyorum.';
    
    if (soruLower.includes('merhaba') || soruLower.includes('selam')) {
      cevap = 'Merhaba! Size nasıl yardımcı olabilirim?';
    } else if (soruLower.includes('nasılsın')) {
      cevap = 'İyiyim, teşekkür ederim! Siz nasılsınız?';
    } else if (soruLower.includes('python') || soruLower.includes('programlama')) {
      cevap = 'Python harika bir programlama dilidir! Öğrenmek ister misiniz?';
    } else if (soruLower.includes('teşekkür')) {
      cevap = 'Rica ederim! Başka bir sorunuz var mı?';
    } else if (soruLower.includes('hava') || soruLower.includes('hava durumu')) {
      cevap = 'Benim için hava her zaman kod gibi güzel! 😊';
    } else if (soruLower.includes('adın') || soruLower.includes('kimsin')) {
      cevap = 'Ben MajevSong\'un chatbot\'uyum! Size yardımcı olmaya çalışıyorum.';
    }
    
    console.log('Cevap:', cevap);
    res.json({ cevap });
  } catch (err) {
    console.error('Genel hata:', err);
    res.status(500).json({ cevap: `Sunucu hatası: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chatbot çalışıyor! Port: ${PORT}`));