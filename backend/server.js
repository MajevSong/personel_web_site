const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chatbot', (req, res) => {
  const { soru } = req.body;
  const veri = JSON.parse(fs.readFileSync('../veri.json', 'utf8'));
  const cevapObj = veri.find(v => v.soru.toLowerCase() === soru.toLowerCase());
  res.json({ cevap: cevapObj ? cevapObj.cevap : "Üzgünüm, bu soruya cevap veremiyorum." });
});

app.listen(3000, () => console.log('Chatbot backend 3000 portunda!'));