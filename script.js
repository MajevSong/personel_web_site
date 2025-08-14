/*
MajevSong OS // Retro Terminal Web Uygulaması
- Komut tabanlı terminal arayüzü
- Tema, not, guestbook, oyun, chatbot, github entegrasyonu
- Mobil ve erişilebilirlik desteği
*/

// --- Matrix Arka Plan Yağmuru (her zaman aktif) ---
let matrixBgCanvas, matrixBgCtx, matrixBgInterval;
let matrixBgDensity = 32; // Kolon sayısı (yoğunluk)
let matrixBgSpeed = 50;   // Animasyon hızı (ms)

function startMatrixBgRain() {
    if (document.getElementById('matrix-bg-canvas')) return;
    matrixBgCanvas = document.createElement('canvas');
    matrixBgCanvas.id = 'matrix-bg-canvas';
    matrixBgCanvas.style.position = 'fixed';
    matrixBgCanvas.style.top = 0;
    matrixBgCanvas.style.left = 0;
    matrixBgCanvas.style.width = '100vw';
    matrixBgCanvas.style.height = '100vh';
    matrixBgCanvas.style.pointerEvents = 'none';
    matrixBgCanvas.style.zIndex = 1;
    document.body.appendChild(matrixBgCanvas);
    matrixBgCtx = matrixBgCanvas.getContext('2d');
    resizeMatrixBgCanvas();
    window.addEventListener('resize', resizeMatrixBgCanvas);
    let cols = Math.floor(matrixBgCanvas.width / matrixBgDensity);
    let drops = Array(cols).fill(1);
    function drawMatrixBg() {
        matrixBgCtx.fillStyle = 'rgba(0,0,0,0.08)';
        matrixBgCtx.fillRect(0,0,matrixBgCanvas.width,matrixBgCanvas.height);
        matrixBgCtx.font = '18px monospace';
        matrixBgCtx.fillStyle = '#0f0';
        for(let i=0;i<drops.length;i++){
            const text = String.fromCharCode(0x30A0 + Math.random()*96);
            matrixBgCtx.fillText(text, i*matrixBgDensity, drops[i]*20);
            if(drops[i]*20 > matrixBgCanvas.height && Math.random() > 0.975) drops[i]=0;
            drops[i]++;
        }
    }
    matrixBgInterval = setInterval(drawMatrixBg, matrixBgSpeed);
}
function resizeMatrixBgCanvas() {
    if (!matrixBgCanvas) return;
    matrixBgCanvas.width = window.innerWidth;
    matrixBgCanvas.height = window.innerHeight;
}
function stopMatrixBgRain() {
    if (matrixBgInterval) clearInterval(matrixBgInterval);
    if (matrixBgCanvas) matrixBgCanvas.remove();
    window.removeEventListener('resize', resizeMatrixBgCanvas);
}
// Sayfa yüklendiğinde başlat
window.addEventListener('DOMContentLoaded', startMatrixBgRain);

document.addEventListener('DOMContentLoaded', () => {
    const consoleOutput = document.getElementById('console');
    const terminalInput = document.getElementById('terminal-input');
    const promptElement = document.querySelector('.prompt');
    const keyboardAudio = document.getElementById('keyboard-audio');

    // --- Komut ve içerik tanımları ---
    const commands = {
        help: `
            <p>Mevcut Komutlar:</p>
            <ul>
                <li><strong>help</strong>      - Bu yardım menüsünü gösterir.</li>
                <li><strong>about</strong>     - Hakkımda bölümünü gösterir.</li>
                <li><strong>projects</strong>  - Projelerimi listeler.</li>
                <li><strong>notes</strong>     - Blog/notlar bölümünü gösterir.</li>
                <li><strong>notes view &lt;numara&gt;</strong> - Seçili notu görüntüler.</li>
                <li><strong>theme [tema]</strong> - Temayı değiştirir. (Mevcut: matrix, dos, c64, default, custom)</li>
                <li><strong>theme custom</strong> - Kendi renk, font ve efekt ayarlarını yap.</li>
                <li><strong>contrast high|normal</strong> - Kontrastı artırır veya normale döndürür.</li>
                <li><strong>fontsize &lt;px&gt;</strong> - Terminal yazı boyutunu değiştirir.</li>
                <li><strong>clear</strong>     - Konsolu temizler.</li>
                <li><strong>guestbook add &lt;mesaj&gt;</strong> - Ziyaretçi defterine mesaj ekler.</li>
                <li><strong>guestbook list</strong> - Ziyaretçi defterindeki mesajları listeler.</li>
                <li><strong>contact</strong>   - İletişim bilgilerini gösterir.</li>
                <li><strong>snake</strong>     - Terminalde yılan oyununu başlatır.</li>
                <li><strong>github</strong>    - Son GitHub repo aktivitelerini gösterir.</li>
                <li><strong>Komut Geçmişi</strong> - Yukarı/Aşağı ok tuşları ile önceki komutlara eriş.</li>
                <li><strong>Autocomplete</strong> - TAB tuşu ile komutları otomatik tamamla.</li>
                <li><strong>chatbot</strong>   - Chatbot'a soru sorar ve yanıt alırsınız.</li>
            </ul>`,
        about: `<div class="about-content">
            <img src="https://github.com/MajevSong.png" alt="MajevSong GitHub Avatar" class="avatar">
            <p>Merhaba! Ben bir yazılım geliştiriciyim. Kodlamaya [Yıl] yılında [Nasıl başladığınızı anlatan kısa bir hikaye] ile başladım. Özellikle [İlgi alanlarınız, örn: web geliştirme, oyun programlama] konularına meraklıyım. Genellikle [Kullandığınız diller, örn: JavaScript, Python, C#] dillerini kullanıyorum ve sürekli yeni şeyler öğrenmeye çalışıyorum.</p>
        </div>`,
        projects: `<div class="project-list">
            <p><strong>Proje 1:</strong> [Proje Adı] - [Kısa Açıklama] [<a href="#" target="_blank">GitHub</a>] [<a href="#" target="_blank">Canlı</a>]</p>
            <p><strong>Proje 2:</strong> [Proje Adı] - [Kısa Açıklama] [<a href="#" target="_blank">GitHub</a>] [<a href="#" target="_blank">Canlı</a>]</p>
        </div>`,
        contact: `<div class="contact-info">
            <p><strong>E-posta:</strong> <a href="mailto:mucahit.soylemez42@gmail.com">mucahit.soylemez42g@gmail.com</a></p>
            <p><strong>GitHub:</strong> <a href="https://github.com/MajevSong" target="_blank">MajevSong</a></p>
            <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/m%C3%BCcahit-s%C3%B6ylemez-800baa197/" target="_blank">linkedin.com/in/mucahit-soylemez</a></p>
        </div>`,
        notes: null, // Dinamik olarak işleyeceğiz
    };

    // Notlar veri yapısı
    const notesData = [
        {
            title: "Retro Terminal UI Nasıl Yapılır?",
            date: "2024-05-01",
            content: `<h4>Retro Terminal UI Nasıl Yapılır?</h4><p>Terminal UI için HTML, CSS ve JavaScript ile temel yapı kurulur. CRT efekti, tema değişimi ve komut işleme gibi özellikler eklenir. Responsive ve retro bir görünüm için CSS değişkenleri ve medya sorguları kullanılır.</p>`
        },
        {
            title: "JavaScript ile Basit Oyunlar",
            date: "2024-04-15",
            content: `<h4>JavaScript ile Basit Oyunlar</h4><p>Canvas veya DOM tabanlı olarak küçük oyunlar (ör: yılan, tetris) geliştirilebilir. Oyun döngüsü, klavye kontrolleri ve skor tutma gibi temel kavramlar uygulanır.</p>`
        },
        {
            title: "Markdown'dan HTML'ye Dönüşüm",
            date: "2024-03-28",
            content: `<h4>Markdown'dan HTML'ye Dönüşüm</h4><p>Showdown.js veya Marked.js gibi kütüphanelerle markdown dosyalarını dinamik olarak HTML'ye çevirebilirsin. Statik site jeneratörleriyle de otomatik dönüşüm sağlanabilir.</p>`
        }
    ];

    const contentLines = [
        `<pre class="ascii-title">
 __  __       _           _____                      
|  \\/  | ___ | | _____   |  ___|__  _ __ ___ ___ ___ 
| |\/| |/ _ \\| |/ / _ \\  | |_ / _ \\| '__/ _ / __/ __|
| |  | | (_) |   |  __/  |  _| (_) | | |  __\\__ \\__ \\
|_|  |_|\\___/|_|\\_\\___|  |_|  \\___/|_|  \\___|___/___/
        </pre>`,
        " ",
        "MajevSong OS v1.0 [Version 10.0.19042.1165]",
        "(c) MajevSong Corporation. All rights reserved.",
        " ",
        "Welcome, Guest. Type 'help' for a list of commands."
    ];

    // --- Fonksiyonlar ---

    // Komut geçmişi için dizi ve index
    let commandHistory = [];
    let historyIndex = -1;

    // Komut listesi autocomplete için
    const commandList = ['help', 'about', 'projects', 'theme', 'clear', 'guestbook', 'contact', 'notes', 'snake', 'github', 'theme custom', 'contrast', 'fontsize', 'ls', 'cat', 'echo', 'whoami', 'date', 'theme amiga', 'theme apple2', 'theme zxspectrum'];

    // Klavye sesi çalma fonksiyonu (her tuş için yeni Audio nesnesi ile daha senkron)
    const playKeystroke = () => {
        const audio = new Audio(keyboardAudio.src);
        audio.currentTime = 0;
        audio.volume = 0.5;
        audio.play().catch(() => {});
    };

    // Tema uygulama fonksiyonu
    // Seçilen temaya göre body'ye class ekler veya custom tema ise CSS değişkenlerini ayarlar
    const availableThemes = ['default', 'matrix', 'dos', 'c64', 'amiga', 'apple2', 'zxspectrum'];

    function applyTheme(theme) {
      if (!availableThemes.includes(theme)) theme = 'default';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      // Matrix kod yağmuru sadece matrix temasında aktif olsun
      const bgCanvas = document.getElementById('matrix-bg-canvas');
      if (theme === 'matrix') {
        if (!bgCanvas) startMatrixBgRain();
      } else {
        if (bgCanvas) stopMatrixBgRain();
      }
    }

      // Statik veri depoları
      let chatbotData = [];
      let guestbookMessages = [];

      // JSON verilerini yükle
      fetch('veri.json')
        .then(r => r.json())
        .then(data => { chatbotData = data; });
      fetch('guestbook.json')
        .then(r => r.json())
        .then(data => {
          const stored = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
          guestbookMessages = data.concat(stored);
        });

      function addGuestbookMessage(message) {
        const entry = { message, created_at: new Date().toISOString() };
        guestbookMessages.unshift(entry);
        const stored = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
        stored.unshift(entry);
        localStorage.setItem('guestbook_messages', JSON.stringify(stored));
        return Promise.resolve({ error: null });
      }

      function listGuestbookMessages() {
        return Promise.resolve({ data: guestbookMessages, error: null });
      }

    // Komut işleme fonksiyonu
    // Kullanıcıdan gelen komutu analiz eder ve uygun çıktıyı terminale ekler
    function processCommand(command) {
        const output = document.createElement('div');
        const [cmd, ...args] = command.split(' ');

        if (cmd in commands && cmd !== 'notes') {
            output.innerHTML = commands[cmd];
        } else if (cmd === 'ls') {
            output.innerHTML = `<pre>about.txt  projects.txt  notes.md  guestbook.log  README.md</pre>`;
        } else if (cmd === 'cat') {
            const file = args[0];
            if (!file) {
                output.innerHTML = `<p>Kullanım: cat &lt;dosya_adı&gt;</p>`;
            } else if (file === 'about.txt') {
                output.innerHTML = commands.about;
            } else if (file === 'projects.txt') {
                output.innerHTML = commands.projects;
            } else if (file === 'notes.md') {
                output.innerHTML = `<pre>${notesData.map((n, i) => `${i+1}. ${n.title} (${n.date})`).join('\n')}</pre>`;
            } else if (file === 'guestbook.log') {
                output.innerHTML = '<p>Mesajlar yükleniyor...</p>';
                consoleOutput.appendChild(output);
                listGuestbookMessages().then(({ data, error }) => {
                    if (error) {
                        output.innerHTML = '<p>Hata oluştu.</p>';
                    } else if (data && data.length) {
                        output.innerHTML = '<ul>' + data.map(m => `<li>${m.message} <span style="color:gray;font-size:0.8em;">${new Date(m.created_at).toLocaleString()}</span></li>`).join('') + '</ul>';
                    } else {
                        output.innerHTML = '<p>Henüz mesaj yok.</p>';
                    }
                });
                return;
            } else if (file === 'README.md') {
                output.innerHTML = `<pre>MajevSong OS - Retro Terminal Web Uygulaması\nKomutlar için 'help' yazın.</pre>`;
            } else {
                output.innerHTML = `<p>'${file}' bulunamadı.</p>`;
            }
        } else if (cmd === 'echo') {
            output.innerHTML = `<pre>${args.join(' ')}</pre>`;
        } else if (cmd === 'whoami') {
            const role = getCurrentRole();
            output.innerHTML = `<pre>${role.avatar} ${role.name}</pre>`;
        } else if (cmd === 'date') {
            output.innerHTML = `<pre>${new Date().toLocaleString('tr-TR')}</pre>`;
        } else if (cmd === 'notes') {
            if (args[0] === 'view' && args[1]) {
                const idx = parseInt(args[1], 10) - 1;
                if (!isNaN(idx) && notesData[idx]) {
                    // Eğer notun markdown dosyası varsa onu yükle
                    const mdPath = `notes/not${idx+1}.md`;
                    fetch(mdPath)
                        .then(r => r.ok ? r.text() : null)
                        .then(md => {
                            if (md) {
                                const converter = new showdown.Converter();
                                const html = converter.makeHtml(md);
                                output.innerHTML = `<div class='note-detail'>${html}<div style='color:gray;font-size:0.9em;'>${notesData[idx].date}</div></div>`;
                            } else {
                                output.innerHTML = `<div class='note-detail'>${notesData[idx].content}<div style='color:gray;font-size:0.9em;'>${notesData[idx].date}</div></div>`;
                            }
                        });
                    consoleOutput.appendChild(output);
                    return;
                } else {
                    output.innerHTML = `<p>Geçersiz not numarası. 'notes' ile mevcut notları görebilirsin.</p>`;
                }
            } else {
                output.innerHTML = `<div class='notes-list'><p><strong>Blog / Notlar</strong></p><ul>` +
                    notesData.map((n, i) => `<li><strong>${i+1}.</strong> ${n.title} <span style='color:gray;font-size:0.9em;'>(${n.date})</span></li>`).join('') +
                    `</ul><p>Bir notu görüntülemek için: <code>notes view &lt;numara&gt;</code></p></div>`;
            }
        } else if (cmd === 'contrast') {
            const mode = args[0];
            if (mode === 'high') {
                document.body.style.filter = 'contrast(1.5)';
                output.innerHTML = `<p>Yüksek kontrast modu aktif.</p>`;
            } else if (mode === 'normal') {
                document.body.style.filter = '';
                output.innerHTML = `<p>Kontrast normale döndü.</p>`;
            } else {
                output.innerHTML = `<p>Kullanım: contrast high|normal</p>`;
            }
        } else if (cmd === 'fontsize') {
            const size = parseInt(args[0], 10);
            if (!isNaN(size) && size >= 10 && size <= 48) {
                document.body.style.fontSize = size + 'px';
                output.innerHTML = `<p>Yazı boyutu ${size}px olarak ayarlandı.</p>`;
            } else {
                output.innerHTML = `<p>Kullanım: fontsize &lt;px&gt; (10-48 arası bir değer girin)</p>`;
            }
        } else if (cmd === 'snake') {
            startSnakeGame();
            output.innerHTML = `<p>Yılan oyunu başlatıldı! ESC ile çıkabilirsin.</p>`;
        } else if (cmd === 'github') {
            output.innerHTML = `<p>GitHub aktiviteleri yükleniyor...</p>`;
            consoleOutput.appendChild(output);
            fetchGithubActivity(output);
            return;
        } else if (cmd === 'theme' || cmd === 'tema') {
            if (args.length && availableThemes.includes(args[0])) {
                applyTheme(args[0]);
                output.innerHTML = `<p>Theme changed to <b>${args[0]}</b>.</p>`;
            } else {
                output.innerHTML = `<p>Available themes: ${availableThemes.join(', ')}</p>`;
            }
            consoleOutput.appendChild(output);
            return;
        } else if (cmd === 'theme' && args[0] === 'custom') {
            showCustomThemeForm(output);
        } else if (cmd === 'matrix') {
            startMatrixRain();
            output.innerHTML = `<p>Wake up, Neo...</p>`;
        } else if (cmd === 'fortune') {
            const fortunes = [
                "The best way to get started is to quit talking and begin doing.",
                "Don't let yesterday take up too much of today.",
                "It's not whether you get knocked down, it's whether you get up.",
                "If you are working on something exciting, it will keep you motivated.",
                "Success is not in what you have, but who you are.",
                "Opportunities don't happen, you create them.",
                "Great things never come from comfort zones.",
                "Dream it. Wish it. Do it.",
                "Stay hungry. Stay foolish.",
                "Code is like humor. When you have to explain it, it's bad."
            ];
            const msg = fortunes[Math.floor(Math.random() * fortunes.length)];
            output.innerHTML = `<p><em>${msg}</em></p>`;
        } else if (cmd === 'redpill') {
            showPillAnimation('red');
            return;
        } else if (cmd === 'bluepill') {
            showPillAnimation('blue');
            return;
        } else if (cmd === 'oracle') {
            const oracles = [
                'There is no spoon.',
                'You have to let it all go, Neo. Fear, doubt, and disbelief.',
                'The Matrix cannot tell you who you are.',
                'Everything that has a beginning has an end.',
                "You're here because you know something. What you know you can't explain."
            ];
            const msg = oracles[Math.floor(Math.random() * oracles.length)];
            output.innerHTML = `<p><em>Oracle: "${msg}"</em></p>`;
        } else if (cmd === 'followthewhiterabbit') {
            showWhiteRabbit(false);
            output.innerHTML = `<p style='color:#0ff;'>You followed the white rabbit. Welcome to the adventure!</p>`;
        } else if (cmd === 'trinity') {
            output.innerHTML = `<pre style='color:#fff;'>
   /\\_/\\
  ( o.o )
   > ^ <   Trinity is watching you.
 </pre>`;
        } else if (cmd === 'zion') {
            output.innerHTML = `<pre style='color:#0f0;'>
   Z I O N
  /------\\
 |  O  O  |
 |   --   |
  \\____//
 The last human city.
 </pre>`;
        } else if (cmd === 'asciiart') {
            output.innerHTML = `<pre style='color:#0ff;'>
   __  __       _        _
  |  \\/  | __ _| |_ _ __(_)_ __   __ _
  | |\\/| |/ _ | __| '__| | '_ \\ / _ |
  | |  | | (_| | |_| |  | | | | | (_| |
  |_|  |_|\\__,_|\\__|_|  |_|_| |_|\\__, |
                                 |___/
 </pre>`;
        } else if (cmd === 'agent') {
            const agentMsgs = [
                'Mr. Anderson...',
                'Do you hear that, Mr. Anderson? That is the sound of inevitability.',
                "You can't win. It's pointless to keep fighting.",
                'The purpose of life is to end.',
                "I'm going to enjoy watching you die, Mr. Anderson."
            ];
            const msg = agentMsgs[Math.floor(Math.random() * agentMsgs.length)];
            output.innerHTML = `<p><span style='color:#0ff;'>Agent Smith:</span> ${msg}</p>`;
        } else if (cmd === 'clear') {
            consoleOutput.innerHTML = '';
            return;
        } else if (cmd === 'guestbook' && args[0] === 'add') {
            const msg = args.slice(1).join(' ');
            // Rate limit kontrolü (1dk)
            const lastTime = localStorage.getItem('guestbook_last_msg_time');
            const now = Date.now();
            if (lastTime && now - parseInt(lastTime, 10) < 60000) {
                output.innerHTML = '<p>Çok hızlı mesaj gönderiyorsun! Lütfen 1 dakika bekle.</p>';
                consoleOutput.appendChild(output);
                return;
            }
            if (!msg) {
                output.innerHTML = '<p>Mesaj boş olamaz.</p>';
                consoleOutput.appendChild(output);
                return;
            }
            // Basit captcha sorusu oluştur
            const a = Math.floor(Math.random()*10)+1;
            const b = Math.floor(Math.random()*10)+1;
            const captchaDiv = document.createElement('div');
            captchaDiv.innerHTML = `<form id='captcha-form'><label>${a} + ${b} = ? <input type='number' id='captcha-answer' required style='width:60px;'></label> <button type='submit'>Gönder</button></form><div id='captcha-msg' style='color:red;margin-top:6px;'></div>`;
            consoleOutput.appendChild(captchaDiv);
            document.getElementById('captcha-answer').focus();
            document.getElementById('captcha-form').onsubmit = function(e) {
                e.preventDefault();
                const val = parseInt(document.getElementById('captcha-answer').value, 10);
                if (val === a + b) {
                    captchaDiv.innerHTML = '<p>Mesaj ekleniyor...</p>';
                    addGuestbookMessage(msg).then(({ error }) => {
                        captchaDiv.innerHTML = error ? '<p>Hata oluştu.</p>' : '<p>Mesaj kaydedildi!</p>';
                        if (!error) localStorage.setItem('guestbook_last_msg_time', Date.now().toString());
                    });
                } else {
                    document.getElementById('captcha-msg').textContent = 'Yanlış cevap! Lütfen tekrar deneyin.';
                    document.getElementById('captcha-answer').value = '';
                    document.getElementById('captcha-answer').focus();
                }
            };
            return;
        } else if (cmd === 'guestbook' && args[0] === 'list') {
            output.innerHTML = '<p>Mesajlar yükleniyor...</p>';
            consoleOutput.appendChild(output);
            listGuestbookMessages().then(({ data, error }) => {
                if (error) {
                    output.innerHTML = '<p>Hata oluştu.</p>';
                } else if (data && data.length) {
                    output.innerHTML = '<ul>' + data.map(m => `<li>${m.message} <span style="color:gray;font-size:0.8em;">${new Date(m.created_at).toLocaleString()}</span></li>`).join('') + '</ul>';
                } else {
                    output.innerHTML = '<p>Henüz mesaj yok.</p>';
                }
            });
            return;
        } else if (cmd === 'chatbot') {
          const msg = args.join(' ');
          if (!msg) {
            output.innerHTML = '<p>Lütfen bir soru yazın. Örnek: chatbot Merhaba</p>';
            consoleOutput.appendChild(output);
            return;
          }
          const entry = chatbotData.find(q => q.soru.toLowerCase() === msg.toLowerCase());
          output.innerHTML = `<p>${entry ? entry.cevap : 'Üzgünüm, bu soruya henüz bir cevabım yok.'}</p>`;
          consoleOutput.appendChild(output);
          return;
        } else if (cmd === 'dodge' || cmd === 'matrixgame') {
            startMatrixDodgeGame();
            output.innerHTML = `<p>Matrix Dodge the Bullets oyunu başlatıldı! Ok tuşları ile kaç, ESC ile çık.</p>`;
            consoleOutput.appendChild(output);
            return;
        } else if (command.trim() !== '') {
            output.innerHTML = `<p>'${command}' is not recognized as an internal or external command.</p>`;
            // %30 ihtimalle glitch efekti uygula
            if (Math.random() < 0.3) {
                output.classList.add('glitch');
                output.addEventListener('animationend', function handler() {
                    output.classList.remove('glitch');
                    output.removeEventListener('animationend', handler);
                });
            }
        } else if (cmd === 'matrixlore' || cmd === 'matrixinfo') {
            const lore = matrixLoreList[Math.floor(Math.random() * matrixLoreList.length)];
            output.innerHTML = `<h4>${lore.title}</h4><p>${lore.content}</p>`;
        } else if (cmd === 'matrixreplik' || cmd === 'matrixquote') {
            const quote = matrixQuotes[Math.floor(Math.random() * matrixQuotes.length)];
            output.innerHTML = `<p><em>"${quote}"</em></p>`;
        } else if (cmd === 'matrixclock' || cmd === 'clock') {
            output.innerHTML = getMatrixClockHtml();
            // Saat animasyonu için 5 saniye boyunca güncelle
            let t = 0;
            const interval = setInterval(() => {
                output.innerHTML = getMatrixClockHtml();
                t++;
                if (t > 5) clearInterval(interval);
            }, 1000);
        } else if (cmd === 'matrixglitch' || cmd === 'systemfailure') {
            output.innerHTML = `<span style='color:#f00;font-weight:bold;'>SYSTEM FAILURE</span>`;
            document.body.classList.add('glitch');
            setTimeout(() => document.body.classList.remove('glitch'), 1200);
        }
        consoleOutput.appendChild(output);
    }

    // Basit Snake oyunu fonksiyonu
    function startSnakeGame() {
        if (document.getElementById('snake-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'snake-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'var(--bg-color, #111)';
        modal.style.border = '2px solid var(--border-color, #00ff00)';
        modal.style.zIndex = 9999;
        modal.style.padding = '16px';
        modal.style.boxShadow = '0 0 32px #000';
        modal.innerHTML = `<canvas id="snake-canvas" width="320" height="320" style="display:block;background:#222;margin:0 auto;"></canvas><div id="snake-score" style="text-align:center;color:var(--text-color,#0f0);margin-top:8px;"></div><div style='text-align:center;color:gray;font-size:0.9em;'>ESC ile çık</div><button id='snake-exit-btn' style='display:none;margin:12px auto 0 auto;padding:8px 18px;font-size:1.1em;background:var(--border-color,#0f0);color:var(--bg-color,#111);border:none;border-radius:6px;cursor:pointer;width:90%;max-width:220px;'>Kapat</button>`;
        document.body.appendChild(modal);

        const canvas = document.getElementById('snake-canvas');
        const ctx = canvas.getContext('2d');
        const box = 20;
        let snake = [{x:8, y:8}];
        let direction = 'RIGHT';
        let food = {x: Math.floor(Math.random()*16), y: Math.floor(Math.random()*16)};
        let score = 0;
        let gameOver = false;
        let interval;

        function draw() {
            ctx.fillStyle = '#222';
            ctx.fillRect(0,0,320,320);
            // Draw snake
            for(let i=0;i<snake.length;i++){
                ctx.fillStyle = i===0 ? '#0f0' : '#6f6';
                ctx.fillRect(snake[i].x*box, snake[i].y*box, box-2, box-2);
            }
            // Draw food
            ctx.fillStyle = '#f00';
            ctx.fillRect(food.x*box, food.y*box, box-2, box-2);
        }

        function update() {
            if(gameOver) return;
            let head = {x: snake[0].x, y: snake[0].y};
            if(direction==='LEFT') head.x--;
            if(direction==='RIGHT') head.x++;
            if(direction==='UP') head.y--;
            if(direction==='DOWN') head.y++;
            // Duvara veya kendine çarpma
            if(head.x<0||head.x>15||head.y<0||head.y>15||snake.some((s,i)=>i>0&&s.x===head.x&&s.y===head.y)){
                gameOver = true;
                document.getElementById('snake-score').innerHTML = `<b>Oyun Bitti! Skor: ${score}</b>`;
                clearInterval(interval);
                return;
            }
            snake.unshift(head);
            // Yem yediyse
            if(head.x===food.x&&head.y===food.y){
                score++;
                document.getElementById('snake-score').innerText = `Skor: ${score}`;
                food = {x: Math.floor(Math.random()*16), y: Math.floor(Math.random()*16)};
            }else{
                snake.pop();
            }
            draw();
        }
        draw();
        document.getElementById('snake-score').innerText = `Skor: ${score}`;
        interval = setInterval(update, 120);

        function keyHandler(e){
            if(['ArrowLeft','a','A'].includes(e.key) && direction!=='RIGHT') direction='LEFT';
            else if(['ArrowUp','w','W'].includes(e.key) && direction!=='DOWN') direction='UP';
            else if(['ArrowRight','d','D'].includes(e.key) && direction!=='LEFT') direction='RIGHT';
            else if(['ArrowDown','s','S'].includes(e.key) && direction!=='UP') direction='DOWN';
            else if(e.key==='Escape') closeSnake();
        }
        window.addEventListener('keydown', keyHandler);
        function closeSnake(){
            clearInterval(interval);
            window.removeEventListener('keydown', keyHandler);
            modal.remove();
        }
        // Mobilde "Kapat" butonunu göster
        const exitBtn = document.getElementById('snake-exit-btn');
        if (window.innerWidth < 800) {
            exitBtn.style.display = 'block';
        }
        exitBtn.addEventListener('click', closeSnake);
    }

    // --- Matrix Dodge the Bullets Mini Oyun ---
    function startMatrixDodgeGame() {
        if (document.getElementById('matrix-dodge-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'matrix-dodge-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'rgba(10,20,10,0.98)';
        modal.style.border = '2px solid var(--border-color, #00ff00)';
        modal.style.zIndex = 10000;
        modal.style.padding = '16px';
        modal.style.boxShadow = '0 0 32px #000';
        modal.innerHTML = `<canvas id="matrix-dodge-canvas" width="320" height="400" style="display:block;background:#111;margin:0 auto;"></canvas><div id="matrix-dodge-score" style="text-align:center;color:var(--text-color,#0f0);margin-top:8px;"></div><div style='text-align:center;color:gray;font-size:0.9em;'>ESC ile çık</div><button id='matrix-dodge-exit-btn' style='display:none;margin:12px auto 0 auto;padding:8px 18px;font-size:1.1em;background:var(--border-color,#0f0);color:var(--bg-color,#111);border:none;border-radius:6px;cursor:pointer;width:90%;max-width:220px;'>Kapat</button>`;
        document.body.appendChild(modal);

        const canvas = document.getElementById('matrix-dodge-canvas');
        const ctx = canvas.getContext('2d');
        const playerW = 32, playerH = 16;
        let playerX = canvas.width/2 - playerW/2;
        const playerY = canvas.height - playerH - 10;
        let left = false, right = false;
        let bullets = [];
        let score = 0;
        let gameOver = false;
        let interval;
        let speed = 2;
        let spawnRate = 30; // Kaç frame'de bir yeni mermi
        let frame = 0;
        function drawPlayer() {
            ctx.save();
            ctx.fillStyle = '#0ff';
            ctx.font = 'bold 18px monospace';
            ctx.fillText('NEO', playerX, playerY+playerH);
            ctx.restore();
        }
        function drawBullets() {
            ctx.save();
            ctx.font = '18px monospace';
            bullets.forEach(b => {
                ctx.fillStyle = '#0f0';
                ctx.fillText(b.char, b.x, b.y);
            });
            ctx.restore();
        }
        function updateBullets() {
            bullets.forEach(b => b.y += speed);
            bullets = bullets.filter(b => b.y < canvas.height);
        }
        function spawnBullet() {
            const chars = ['0','1','ア','ネ','シ','ミ','リ','E','A','O','N','X','Z','M'];
            const char = Math.random()<0.1 ? (Math.random()<0.5 ? 'WAKE UP, NEO' : 'SYSTEM FAILURE') : chars[Math.floor(Math.random()*chars.length)];
            const x = Math.random() * (canvas.width - 24);
            bullets.push({x, y: 0, char});
        }
        function checkCollision() {
            for (let b of bullets) {
                if (b.char.length > 2) {
                    // Mesajlar için geniş alan kontrolü
                    if (b.y + 18 > playerY && b.y < playerY + playerH && b.x < playerX + playerW + 60 && b.x + 120 > playerX) {
                        return true;
                    }
                } else {
                    if (b.y + 18 > playerY && b.y < playerY + playerH && b.x < playerX + playerW && b.x + 18 > playerX) {
                        return true;
                    }
                }
            }
            return false;
        }
        function draw() {
            ctx.fillStyle = '#111';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            // Matrix kod yağmuru efekti
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.font = '18px monospace';
            for(let i=0;i<canvas.width;i+=20){
                for(let j=0;j<canvas.height;j+=40){
                    ctx.fillStyle = '#0f0';
                    ctx.fillText(String.fromCharCode(0x30A0 + Math.random()*96), i, j);
                }
            }
            ctx.restore();
            drawPlayer();
            drawBullets();
        }
        function update() {
            if(gameOver) return;
            if(left) playerX -= 5;
            if(right) playerX += 5;
            if(playerX < 0) playerX = 0;
            if(playerX > canvas.width-playerW) playerX = canvas.width-playerW;
            if(frame % spawnRate === 0) spawnBullet();
            updateBullets();
            if (checkCollision()) {
                gameOver = true;
                document.getElementById('matrix-dodge-score').innerHTML = `<b>Oyun Bitti! Skor: ${score}</b>`;
                clearInterval(interval);
                setTimeout(() => {
                    const out = document.createElement('div');
                    out.innerHTML = `<p>Matrix Dodge the Bullets skorun: <b>${score}</b></p>`;
                    consoleOutput.appendChild(out);
                    window.scrollTo(0, document.body.scrollHeight);
                }, 500);
                return;
            }
            score++;
            document.getElementById('matrix-dodge-score').innerText = `Skor: ${score}`;
            draw();
            frame++;
        }
        draw();
        document.getElementById('matrix-dodge-score').innerText = `Skor: ${score}`;
        interval = setInterval(update, 30);
        function keyHandler(e){
            if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') left=true;
            else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') right=true;
            else if(e.key==='Escape') closeGame();
        }
        function keyUpHandler(e){
            if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') left=false;
            else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') right=false;
        }
        window.addEventListener('keydown', keyHandler);
        window.addEventListener('keyup', keyUpHandler);
        function closeGame(){
            clearInterval(interval);
            window.removeEventListener('keydown', keyHandler);
            window.removeEventListener('keyup', keyUpHandler);
            modal.remove();
        }
        // Mobilde "Kapat" butonunu göster
        const exitBtn = document.getElementById('matrix-dodge-exit-btn');
        if (window.innerWidth < 800) {
            exitBtn.style.display = 'block';
        }
        exitBtn.addEventListener('click', closeGame);
    }

    // GitHub aktivitesi çekme fonksiyonu
    // Son commit, açık issue ve pull request'leri getirir, hata durumunda kullanıcıyı bilgilendirir
    function fetchGithubActivity(outputDiv) {
        const username = 'MajevSong'; // Buraya kendi GitHub kullanıcı adını yazabilirsin
        fetch(`https://api.github.com/users/${username}/repos?sort=pushed`)
            .then(r => r.json())
            .then(async data => {
                if (!Array.isArray(data)) throw new Error('API limiti veya hata');
                const latest = data.slice(0, 5);
                // Her repo için son commit mesajını çek
                const repoCommits = await Promise.all(latest.map(async repo => {
                    try {
                        const commitRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`);
                        const commitData = await commitRes.json();
                        const commit = Array.isArray(commitData) && commitData[0] ? commitData[0] : null;
                        return {
                            name: repo.name,
                            url: repo.html_url,
                            pushed_at: repo.pushed_at,
                            commitMsg: commit ? commit.commit.message : 'Commit bulunamadı',
                            commitDate: commit ? commit.commit.author.date : '',
                            commitUrl: commit ? commit.html_url : repo.html_url
                        };
                    } catch {
                        return {
                            name: repo.name,
                            url: repo.html_url,
                            pushed_at: repo.pushed_at,
                            commitMsg: 'Commit alınamadı',
                            commitDate: '',
                            commitUrl: repo.html_url
                        };
                    }
                }));
                // Son 3 açık issue ve pull request'i getir
                const mainRepo = latest[0]?.name || '';
                let issues = [], pulls = [];
                if (mainRepo) {
                    try {
                        const issuesRes = await fetch(`https://api.github.com/repos/${username}/${mainRepo}/issues?state=open&per_page=3`);
                        const issuesData = await issuesRes.json();
                        issues = Array.isArray(issuesData) ? issuesData.filter(i => !i.pull_request) : [];
                        const pullsRes = await fetch(`https://api.github.com/repos/${username}/${mainRepo}/pulls?state=open&per_page=3`);
                        const pullsData = await pullsRes.json();
                        pulls = Array.isArray(pullsData) ? pullsData : [];
                    } catch {}
                }
                outputDiv.innerHTML = `<p><strong>Son GitHub Repo Aktiviteleri:</strong></p><ul>` +
                    repoCommits.map(r => `<li><a href='${r.url}' target='_blank'>${r.name}</a><br><span style='color:gray;font-size:0.9em;'>${r.pushed_at.slice(0,10)}</span><br><span style='color:#ffb900;font-size:0.97em;'>${r.commitMsg}</span><br><span style='color:gray;font-size:0.9em;'>${r.commitDate ? new Date(r.commitDate).toLocaleString('tr-TR') : ''}</span></li>`).join('') +
                    `</ul>` +
                    (issues.length ? `<p><strong>Açık Issue'lar:</strong></p><ul>` + issues.map(i => `<li><a href='${i.html_url}' target='_blank'>#${i.number}: ${i.title}</a> <span style='color:gray;font-size:0.9em;'>${new Date(i.created_at).toLocaleString('tr-TR')}</span></li>`).join('') + `</ul>` : '') +
                    (pulls.length ? `<p><strong>Açık Pull Request'ler:</strong></p><ul>` + pulls.map(p => `<li><a href='${p.html_url}' target='_blank'>#${p.number}: ${p.title}</a> <span style='color:gray;font-size:0.9em;'>${new Date(p.created_at).toLocaleString('tr-TR')}</span></li>`).join('') + `</ul>` : '');
            })
            .catch((e) => {
                outputDiv.innerHTML = `<p>GitHub API limiti aşıldı veya bir hata oluştu.<br>Hata: ${e.message || e}</p><p>Daha sonra tekrar deneyin veya <a href='https://github.com/${username}' target='_blank'>GitHub profilimi</a> ziyaret edin.</p>`;
            });
    }

    // Kişiselleştirilmiş tema formu
    function showCustomThemeForm(outputDiv) {
        outputDiv.innerHTML = `
        <form id='custom-theme-form' style='display:flex;flex-direction:column;gap:8px;'>
            <label>Arka Plan Rengi: <input type='color' name='bg' value='#1a1a1a'></label>
            <label>Yazı Rengi: <input type='color' name='text' value='#00ff00'></label>
            <label>Başlık Rengi: <input type='color' name='header' value='#00dd00'></label>
            <label>Link Rengi: <input type='color' name='link' value='#00ffaa'></label>
            <label>Sınır Rengi: <input type='color' name='border' value='#005500'></label>
            <label>Font: <input type='text' name='font' value='Courier New, monospace'></label>
            <label>CRT Efekti: <input type='checkbox' name='crt' checked></label>
            <button type='submit'>Uygula</button>
        </form>
        <div style='color:gray;font-size:0.9em;'>Seçimlerin kaydedilecek ve sayfa yenilendiğinde korunacak.</div>
        `;
        const form = outputDiv.querySelector('#custom-theme-form');
        form.onsubmit = function(e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            const customTheme = {
                bg: data.bg,
                text: data.text,
                header: data.header,
                link: data.link,
                border: data.border,
                font: data.font,
                crt: form.crt.checked
            };
            localStorage.setItem('customTheme', JSON.stringify(customTheme));
            applyTheme('custom');
            outputDiv.innerHTML = `<p>Kişisel temanız uygulandı!</p>`;
        };
    }

    // --- Otomatik Matrix Komutu (10 sn işlem yoksa, hareket gelene kadar devam) ---
    let idleTimer = null;
    let isIdleMatrixActive = false;
    function startIdleMatrix() {
        if (!isIdleMatrixActive) {
            isIdleMatrixActive = true;
            if (idleTimer) clearTimeout(idleTimer); // Idle animasyon başlarken timer'ı durdur
            startMatrixRain(true); // idle için özel flag
        }
    }
    function stopIdleMatrix() {
        if (isIdleMatrixActive) {
            isIdleMatrixActive = false;
            const canvas = document.getElementById('matrix-canvas');
            if (canvas) canvas.remove();
            resetIdleTimer(); // Animasyon kapanınca idle timer tekrar başlasın
        }
    }
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        if (isIdleMatrixActive) return; // Animasyon aktifken timer başlatma
        idleTimer = setTimeout(() => {
            startIdleMatrix();
        }, 10000);
    }
    ['mousemove','keydown','mousedown','touchstart','scroll'].forEach(evt => {
        window.addEventListener(evt, stopIdleMatrix, true); // Hareket olursa animasyon kapanır ve timer başlar
        window.addEventListener(evt, resetIdleTimer, true); // Hareket olursa timer sıfırlanır (animasyon yoksa)
    });
    resetIdleTimer();

    // Matrix yağmuru animasyonu (easter egg)
    // idleMode=true ise, kullanıcı hareket edene kadar canvas ekranda kalır
    function startMatrixRain(idleMode) {
        if (document.getElementById('matrix-canvas')) return;
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = 99999;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const cols = Math.floor(canvas.width / 20);
        const drops = Array(cols).fill(1);
        function drawMatrix() {
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.font = '18px monospace';
            ctx.fillStyle = '#0f0';
            for(let i=0;i<drops.length;i++){
                const text = String.fromCharCode(0x30A0 + Math.random()*96);
                ctx.fillText(text, i*20, drops[i]*20);
                if(drops[i]*20 > canvas.height && Math.random() > 0.975) drops[i]=0;
                drops[i]++;
            }
        }
        let interval = setInterval(drawMatrix, 50);
        if (!idleMode) {
            setTimeout(() => {
                clearInterval(interval);
                canvas.remove();
            }, 3500);
        } else {
            // idle modunda, canvas kullanıcı hareket edene kadar kalır
            const stopOnActivity = () => {
                clearInterval(interval);
                if (canvas) canvas.remove();
                isIdleMatrixActive = false;
                ['mousemove','keydown','mousedown','touchstart','scroll'].forEach(evt => {
                    window.removeEventListener(evt, stopOnActivity, true);
                });
            };
            ['mousemove','keydown','mousedown','touchstart','scroll'].forEach(evt => {
                window.addEventListener(evt, stopOnActivity, true);
            });
        }
    }

    // --- Beyaz Tavşan Animasyonu Fonksiyonu ---
    function showWhiteRabbit(auto) {
        if (document.getElementById('white-rabbit')) return;
        const rabbit = document.createElement('div');
        rabbit.id = 'white-rabbit';
        rabbit.innerHTML = '🐇';
        rabbit.style.position = 'fixed';
        rabbit.style.left = '-60px';
        rabbit.style.bottom = '40px';
        rabbit.style.fontSize = '3rem';
        rabbit.style.zIndex = 10000;
        rabbit.style.transition = 'left 2.5s linear';
        rabbit.style.cursor = 'pointer';
        document.body.appendChild(rabbit);
        setTimeout(() => { rabbit.style.left = 'calc(100vw + 60px)'; }, 100);
        setTimeout(() => { if (rabbit) rabbit.remove(); }, 2700);
        rabbit.onclick = function() {
            rabbit.innerHTML = '✨🐇✨';
            rabbit.style.transition = 'all 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
            rabbit.style.transform = 'scale(1.5) rotate(-20deg)';
            setTimeout(() => { rabbit.remove(); }, 700);
            // Terminale özel mesaj
            const msg = document.createElement('div');
            msg.innerHTML = `<p style='color:#0ff;'>Beyaz tavşanı takip ettin, Neo. Şimdi gerçeklik başlıyor...</p>`;
            consoleOutput.appendChild(msg);
            window.scrollTo(0, document.body.scrollHeight);
        };
    }

    // --- Tavşan Animasyonunu Otomatik Başlat ---
    function scheduleWhiteRabbit() {
        const min = 2 * 60 * 1000; // 2 dakika
        const max = 5 * 60 * 1000; // 5 dakika
        const next = Math.random() * (max - min) + min;
        setTimeout(() => {
            showWhiteRabbit(true);
            scheduleWhiteRabbit();
        }, next);
    }
    scheduleWhiteRabbit();

      // Başlangıç animasyonu
      let lineIndex = 0;
    function printNextLine() {
        if (lineIndex < contentLines.length) {
            consoleOutput.innerHTML += `<div>${contentLines[lineIndex]}</div>`;
            lineIndex++;
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(printNextLine, 100);
        } else {
            promptElement.style.visibility = 'visible';
            terminalInput.focus();
        }
    }

    // --- Event Listeners ---

    // Her tuşa basıldığında ses çal
    document.addEventListener('keydown', playKeystroke);

    // Komut yazarken arada bir prompt'a glitch efekti
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key.length === 1 && Math.random() < 0.10) { // %10 ihtimalle
        promptElement.classList.add('glitch');
        promptElement.addEventListener('animationend', function handler() {
          promptElement.classList.remove('glitch');
          promptElement.removeEventListener('animationend', handler);
        });
      }
    });

    // Erişilebilirlik: input ve output için tabindex ve aria-label
    terminalInput.setAttribute('tabindex', '0');
    terminalInput.setAttribute('aria-label', 'Terminal komut girişi');
    consoleOutput.setAttribute('tabindex', '0');
    consoleOutput.setAttribute('aria-label', 'Terminal çıktısı');

    // Enter tuşuna basıldığında komutu işle
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = terminalInput.value.trim();

            if (command) {
                commandHistory.push(command);
                if (commandHistory.length > 100) commandHistory.shift(); // Maks 100 komut tut
            }
            historyIndex = commandHistory.length;

            const commandEcho = document.createElement('div');
            commandEcho.innerHTML = `<span>C:\\Users\\Guest></span> ${command}`;
            consoleOutput.appendChild(commandEcho);

            processCommand(command.toLowerCase());

            terminalInput.value = '';
            window.scrollTo(0, document.body.scrollHeight);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length && historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
                setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (commandHistory.length && historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
                setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const current = terminalInput.value.trim();
            if (!current) return;
            // Sadece ilk kelimeyi tamamla (komut)
            const [first, ...rest] = current.split(' ');
            const matches = commandList.filter(cmd => cmd.startsWith(first));
            if (matches.length === 1) {
                // Tek eşleşme varsa otomatik tamamla
                terminalInput.value = matches[0] + (rest.length ? ' ' + rest.join(' ') : '');
                setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
            } else if (matches.length > 1) {
                // Çoklu eşleşme varsa ekrana listele
                const output = document.createElement('div');
                output.innerHTML = `<p>Olası komutlar: ${matches.join(', ')}</p>`;
                consoleOutput.appendChild(output);
                window.scrollTo(0, document.body.scrollHeight);
            }
        }
    });

    // Kullanıcı terminal dışına tıklarsa input'a geri odaklan
    document.body.addEventListener('click', () => terminalInput.focus());

    // --- Başlangıç ---
    const savedTheme = localStorage.getItem('theme') || 'default';
    applyTheme(savedTheme);
    printNextLine();

    // --- Rol Seçimi ve Kişiselleştirme ---
    const matrixRoles = [
      {
        key: 'neo',
        name: 'Neo',
        avatar: '😎',
        prompt: 'C:/Users/Neo>',
        color: '#0ff'
      },
      {
        key: 'agent',
        name: 'Agent Smith',
        avatar: '🕶️',
        prompt: 'C:/Matrix/Agent>',
        color: '#f00'
      }
    ];
    function getCurrentRole() {
      const saved = localStorage.getItem('matrixRole');
      return matrixRoles.find(r => r.key === saved) || matrixRoles[0];
    }
    function setRole(roleKey) {
      localStorage.setItem('matrixRole', roleKey);
    }
    function showRoleModal(force) {
      if (document.getElementById('role-modal')) return;
      if (!force && localStorage.getItem('matrixRole')) return;
      const modal = document.createElement('div');
      modal.id = 'role-modal';
      modal.style.position = 'fixed';
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.92)';
      modal.style.zIndex = 100000;
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.innerHTML = `
        <div style="background:#181c18;padding:36px 32px 28px 32px;border-radius:18px;box-shadow:0 0 32px #000;max-width:340px;text-align:center;">
          <h2 style="color:#0f0;margin-bottom:18px;">Welcome to the Matrix!</h2>
          <p style="color:#fff;font-size:1.1em;margin-bottom:18px;">Who do you want to be?</p>
          <button id="role-neo" style="font-size:1.2em;padding:12px 32px;margin:8px 12px 0 0;background:#0f0;color:#111;border:none;border-radius:8px;cursor:pointer;">😎 Neo</button>
          <button id="role-agent" style="font-size:1.2em;padding:12px 32px;margin:8px 0 0 12px;background:#f00;color:#fff;border:none;border-radius:8px;cursor:pointer;">🕶️ Agent Smith</button>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('role-neo').onclick = () => { setRole('neo'); modal.remove(); updatePrompt(); };
      document.getElementById('role-agent').onclick = () => { setRole('agent'); modal.remove(); updatePrompt(); };
    }
    function updatePrompt() {
      const role = getCurrentRole();
      const promptEl = document.querySelector('.prompt span');
      if (promptEl) {
        promptEl.innerHTML = `<span style='color:${role.color}'>${role.prompt}</span>`;
      }
    }
    // Sayfa açılışında rol seçimi modalı göster
    window.addEventListener('DOMContentLoaded', () => {
      showRoleModal();
      setTimeout(updatePrompt, 200);
    });
}); // <--- Burası DOMContentLoaded event handler'ının kapanışı

// --- Kırmızı/Mavi Hap Animasyonu Fonksiyonu ---
function showPillAnimation(color) {
    if (document.getElementById('pill-animation')) return;
    const pill = document.createElement('div');
    pill.id = 'pill-animation';
    pill.style.position = 'fixed';
    pill.style.top = '50%';
    pill.style.left = '50%';
    pill.style.transform = 'translate(-50%, -50%) scale(0.7)';
    pill.style.zIndex = 10001;
    pill.style.transition = 'transform 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
    pill.style.cursor = 'pointer';
    const grad = color === 'red' ? '#ff0033,#ff6666' : '#0099ff,#66ccff';
    const shadow = color === 'red' ? '#ff0033' : '#0099ff';
    const pillStyle = 'width:120px;height:48px;border-radius:30px;background:linear-gradient(90deg,' + grad + ');box-shadow:0 0 32px ' + shadow + '88,0 0 8px #000;display:flex;align-items:center;justify-content:center;animation:pill-glow 1.2s infinite alternate;';
    const pillText = color === 'red' ? 'RED' : 'BLUE';
    const pillMsg = color === 'red' ? 'Gerçekliği seçmek üzeresin...' : 'Her şey eskisi gibi devam edecek...';
    pill.innerHTML = '<div style="' + pillStyle + '"><span style="color:#fff;font-size:1.5em;font-weight:bold;letter-spacing:2px;">' + pillText + '</span></div><div style="margin-top:18px;text-align:center;color:#fff;font-size:1.1em;">' + pillMsg + '</div>';
    document.body.appendChild(pill);
    setTimeout(function(){pill.style.transform='translate(-50%, -50%) scale(1.1)';},50);
    function finishPill() {
        pill.style.transform = 'translate(-50%, -50%) scale(0.7)';
        setTimeout(function(){pill.remove();},400);
        // Tema değişimi ve mesaj
        const output = document.createElement('div');
        if (color === 'red') {
            applyTheme('matrix');
            output.innerHTML = "<p><span style='color:#f00;'>Gerçekliğe hoş geldin, Neo.</span><br>Matrix'in kodları artık seninle.</p>";
            document.body.style.animation = 'glitch 0.5s linear 2';
            setTimeout(function() { document.body.style.animation = ''; }, 1000);
        } else {
            applyTheme('default');
            output.innerHTML = "<p><span style='color:#00f;'>Mavi hapı seçtin. Her şey eskisi gibi devam edecek.</span></p>";
            document.body.style.animation = 'none';
        }
        document.getElementById('console').appendChild(output);
        window.scrollTo(0, document.body.scrollHeight);
    }
    pill.onclick = finishPill;
    setTimeout(finishPill, 3500);
}

// --- Hap animasyonu için ek CSS ---
const pillAnimStyle = document.createElement('style');
pillAnimStyle.innerHTML = `@keyframes pill-glow {0%{box-shadow:0 0 32px #fff4,0 0 8px #000;}100%{box-shadow:0 0 48px #fff8,0 0 16px #000;}}`;
document.head.appendChild(pillAnimStyle);

const matrixLoreList = [
  {
    title: 'Matrix Nedir?',
    content: 'Matrix, insanları gerçek dünyadan koparıp sanal bir gerçeklikte tutan bir simülasyon sistemidir. İnsanlar, makineler tarafından enerji kaynağı olarak kullanılırken, zihinleri Matrix adlı bu sanal dünyada yaşamaktadır.'
  },
  {
    title: 'Neo',
    content: 'Neo (Thomas Anderson), Matrix üçlemesinin ana karakteridir. "Seçilmiş Kişi" olarak Matrix sistemini kırabilecek tek kişidir.'
  },
  {
    title: 'Morpheus',
    content: 'Morpheus, Zion direnişinin liderlerinden biridir ve Neo\'nun gerçek dünyaya uyanmasına yardımcı olur.'
  },
  {
    title: 'Agent Smith',
    content: 'Agent Smith, Matrix\'in ana ajanıdır. Sistemi korumak ve insanları kontrol altında tutmak için programlanmıştır.'
  },
  {
    title: 'Matrix Felsefesi',
    content: 'Matrix, gerçeklik, özgür irade, kader ve insanın doğası gibi felsefi temaları işler. "Gerçek nedir?" sorusu filmin ana temalarından biridir.'
  }
];
const matrixQuotes = [
  'There is no spoon.',
  'Welcome to the real world.',
  'The Matrix has you...',
  'Wake up, Neo.',
  'Unfortunately, no one can be told what the Matrix is. You have to see it for yourself.',
  'I can only show you the door. You\'re the one that has to walk through it.',
  'Free your mind.',
  'Choice. The problem is choice.',
  'Do not try and bend the spoon. That\'s impossible. Instead, only try to realize the truth.',
  'What is real? How do you define real?'
];

// Matrix Clock için yardımcı fonksiyon
function getMatrixClockHtml() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  const date = now.toLocaleDateString('tr-TR');
  return `<div style="font-family:'Courier New',monospace;font-size:2em;color:#0f0;background:#000;padding:18px 32px;border-radius:12px;box-shadow:0 0 24px #0f08;display:inline-block;letter-spacing:0.15em;">${h}:${m}:${s}<br><span style='font-size:0.6em;color:#0ff;'>${date}</span></div>`;
}

// Otomatik Matrix glitch ve sürpriz mesaj fonksiyonu
function scheduleMatrixSurprise() {
  const min = 2 * 60 * 1000; // 2 dakika
  const max = 5 * 60 * 1000; // 5 dakika
  const next = Math.random() * (max - min) + min;
  setTimeout(() => {
    const surpriseType = Math.random();
    if (surpriseType < 0.5) {
      // Glitch/SYSTEM FAILURE efekti
      const output = document.createElement('div');
      output.innerHTML = `<span style='color:#f00;font-weight:bold;'>SYSTEM FAILURE</span>`;
      document.getElementById('console').appendChild(output);
      document.body.classList.add('glitch');
      setTimeout(() => document.body.classList.remove('glitch'), 1200);
    } else {
      // Rastgele Matrix repliği/sürpriz mesaj
      const quote = matrixQuotes[Math.floor(Math.random() * matrixQuotes.length)];
      const output = document.createElement('div');
      output.innerHTML = `<p><em>"${quote}"</em></p>`;
      document.getElementById('console').appendChild(output);
    }
    window.scrollTo(0, document.body.scrollHeight);
    scheduleMatrixSurprise();
  }, next);
}
scheduleMatrixSurprise();

