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
    const commandList = ['help', 'about', 'projects', 'theme', 'clear', 'guestbook', 'contact', 'notes', 'snake', 'github', 'theme custom', 'contrast', 'fontsize'];

    // Klavye sesi çalma fonksiyonu (her tuş için yeni Audio nesnesi ile daha senkron)
    const playKeystroke = () => {
        const audio = new Audio(keyboardAudio.src);
        audio.currentTime = 0;
        audio.volume = 0.5;
        audio.play().catch(() => {});
    };

    // Tema uygulama fonksiyonu
    function applyTheme(theme) {
        const validThemes = ['matrix', 'dos', 'c64', 'default', 'custom'];
        if (!validThemes.includes(theme)) {
            return false;
        }
        document.body.classList.remove('theme-matrix', 'theme-dos', 'theme-c64');
        // Custom tema ise CSS değişkenlerini ayarla
        if (theme === 'custom') {
            const custom = JSON.parse(localStorage.getItem('customTheme') || '{}');
            document.documentElement.style.setProperty('--bg-color', custom.bg || '#1a1a1a');
            document.documentElement.style.setProperty('--text-color', custom.text || '#00ff00');
            document.documentElement.style.setProperty('--header-color', custom.header || '#00dd00');
            document.documentElement.style.setProperty('--link-color', custom.link || '#00ffaa');
            document.documentElement.style.setProperty('--border-color', custom.border || '#005500');
            document.documentElement.style.setProperty('--font-family', custom.font || 'Courier New, monospace');
            // CRT efekti
            document.querySelector('.crt-effect').style.display = (custom.crt !== false) ? 'block' : 'none';
        } else {
            // Diğer temalar için class ekle
            document.documentElement.removeAttribute('style');
            document.querySelector('.crt-effect').style.display = 'block';
            if (theme !== 'default') {
                document.body.classList.add(`theme-${theme}`);
            }
        }
        localStorage.setItem('theme', theme);
        return true;
    }

    // Supabase bağlantısı (CDN ile)
    const SUPABASE_URL = window.ENV && window.ENV.SUPABASE_URL;
    const SUPABASE_ANON_KEY = window.ENV && window.ENV.SUPABASE_ANON_KEY;
    let supabase = null;
    if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    async function addGuestbookMessage(message) {
      if (!supabase) return { error: 'Supabase yüklenemedi.' };
      const { data, error } = await supabase
        .from('guestbook')
        .insert([{ message }]);
      return { data, error };
    }

    async function listGuestbookMessages() {
      if (!supabase) return { error: 'Supabase yüklenemedi.' };
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    }

    let isAdmin = false;
    let adminLoginAttempts = 0;

    // Admin login fonksiyonu
    async function adminLoginPrompt() {
        // Terminal input ve diğer komutları kilitle
        const promptDiv = document.querySelector('.prompt');
        if (promptDiv) promptDiv.style.display = 'none';
        const origBodyClick = document.body.onclick;
        document.body.onclick = null;
        return new Promise((resolve) => {
            const loginDiv = document.createElement('div');
            loginDiv.innerHTML = `
                <div style="max-width:340px;margin:40px auto;padding:32px 24px;background:rgba(20,40,20,0.97);border:2px solid var(--border-color,#0f0);border-radius:12px;box-shadow:0 0 24px #000;">
                    <h2 style="text-align:center;color:var(--header-color,#0f0);margin-bottom:18px;">🔒 Admin Girişi</h2>
                    <form id="admin-login-form" style="display:flex;flex-direction:column;gap:14px;">
                        <label style="font-size:1.1em;">Kullanıcı Adı
                            <input type="text" name="username" required autocomplete="off" style="width:100%;padding:8px 10px;font-size:1.1em;border-radius:6px;border:1px solid var(--border-color,#0f0);background:#181c18;color:var(--text-color,#0f0);margin-top:4px;" />
                        </label>
                        <label style="font-size:1.1em;">Şifre
                            <input type="password" name="password" required autocomplete="off" style="width:100%;padding:8px 10px;font-size:1.1em;border-radius:6px;border:1px solid var(--border-color,#0f0);background:#181c18;color:var(--text-color,#0f0);margin-top:4px;letter-spacing:2px;" />
                        </label>
                        <button type="submit" style="margin-top:10px;padding:10px 0;font-size:1.1em;background:var(--border-color,#0f0);color:var(--bg-color,#111);border:none;border-radius:6px;cursor:pointer;">Giriş Yap</button>
                    </form>
                    <div id="admin-login-msg" style="margin-top:16px;text-align:center;color:#f55;font-weight:bold;"></div>
                </div>
            `;
            consoleOutput.appendChild(loginDiv);
            const form = loginDiv.querySelector('#admin-login-form');
            const msgDiv = loginDiv.querySelector('#admin-login-msg');
            form.username.focus();
            form.onsubmit = async function(e) {
                e.preventDefault();
                const username = form.username.value.trim();
                const password = form.password.value.trim();
                // Supabase'den admin kontrolü
                if (!supabase) {
                    msgDiv.textContent = 'Supabase bağlantı hatası.';
                    return;
                }
                const { data, error } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('username', username)
                    .eq('password', password)
                    .maybeSingle();
                if (error) {
                    msgDiv.textContent = 'Giriş sırasında hata oluştu.';
                } else if (data) {
                    msgDiv.style.color = '#0f0';
                    msgDiv.textContent = 'Giriş başarılı! Admin paneli açılıyor...';
                    isAdmin = true;
                    setTimeout(() => {
                        loginDiv.remove();
                        if (promptDiv) promptDiv.style.display = '';
                        document.body.onclick = origBodyClick;
                        adminLoginAttempts = 0;
                        showAdminPanel();
                    }, 1000);
                    resolve(true);
                } else {
                    adminLoginAttempts++;
                    msgDiv.textContent = `Hatalı kullanıcı adı veya şifre. (${adminLoginAttempts}/3)`;
                    if (adminLoginAttempts >= 3) {
                        msgDiv.textContent = 'Çok fazla hatalı giriş! Siteye erişiminiz engellendi.';
                        setTimeout(() => {
                            window.location.href = 'https://www.google.com';
                        }, 1200);
                    }
                }
            };
        });
    }

    function showAdminPanel() {
        if (document.getElementById('admin-panel')) return; // Panel zaten açıksa tekrar açma
        const panel = document.createElement('div');
        panel.id = 'admin-panel';
        panel.innerHTML = `
            <div style="border:2px solid var(--border-color,#0f0);padding:16px;margin:16px 0;background:rgba(0,255,0,0.05);border-radius:12px;box-shadow:0 4px 24px 0 rgba(0,0,0,0.15);max-width:350px;">
                <h3 style='margin-top:0;font-size:1.15em;'>Admin Panel</h3>
                <button id="admin-logout-btn" style="margin-bottom:8px;">Çıkış Yap</button>
                <button id="admin-refresh-guestbook" style="margin-bottom:8px;">Guestbook Mesajlarını Yenile</button>
                <div id="admin-guestbook-list" style="margin-bottom:10px;">Yükleniyor...</div>
                <div id="chatbot-panel" style="margin-top:12px;padding:12px 8px 8px 8px;background:rgba(0,0,0,0.08);border-radius:8px;box-shadow:0 2px 8px 0 rgba(0,0,0,0.08);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <h4 style="margin:0;font-size:1em;">🤖 Chatbot</h4>
                    <button id="chatbot-close" style="background:#e74c3c;color:#fff;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:0.9em;">Kapat</button>
                  </div>
                  <div style="display:flex;gap:6px;align-items:center;">
                    <input type="text" id="chatbot-question" placeholder="Sorunuzu yazın..." style="flex:1;padding:6px 8px;border:1.2px solid var(--border-color,#0f0);border-radius:5px;font-size:0.97em;background:#181818;color:var(--text-color);outline:none;transition:border 0.2s;min-width:0;">
                    <button id="chatbot-send" style="padding:6px 12px;background:var(--header-color,#0f0);color:#222;border:none;border-radius:5px;font-weight:bold;cursor:pointer;font-size:0.97em;transition:background 0.2s;">Sor</button>
                  </div>
                  <div id="chatbot-answer" style="margin-top:10px;color:var(--text-color);min-height:20px;font-size:0.97em;"></div>
                </div>
                <div id="admin-chatbot-knowledge" style="margin-top:18px;padding:10px 6px 6px 6px;background:rgba(0,0,0,0.08);border-radius:8px;box-shadow:0 2px 8px 0 rgba(0,0,0,0.08);">
                  <h4 style="margin:0 0 8px 0;font-size:1em;">📚 Chatbot Bilgi Yönetimi</h4>
                  <form id="add-knowledge-form" style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
                    <input type="text" id="knowledge-question" placeholder="Soru" required style="padding:6px 8px;border-radius:4px;border:1px solid var(--border-color,#0f0);background:#181818;color:var(--text-color);">
                    <textarea id="knowledge-answer" placeholder="Cevap" required rows="2" style="padding:6px 8px;border-radius:4px;border:1px solid var(--border-color,#0f0);background:#181818;color:var(--text-color);"></textarea>
                    <button type="submit" style="padding:6px 0;background:var(--header-color,#0f0);color:#222;border:none;border-radius:4px;font-weight:bold;cursor:pointer;">Ekle</button>
                  </form>
                  <div id="knowledge-list">Yükleniyor...</div>
                </div>
            </div>
        `;
        consoleOutput.appendChild(panel);
        document.getElementById('admin-logout-btn').onclick = () => {
            isAdmin = false;
            panel.remove();
            const out = document.createElement('div');
            out.innerHTML = '<p>Admin oturumu kapatıldı.</p>';
            consoleOutput.appendChild(out);
        };
        document.getElementById('admin-refresh-guestbook').onclick = loadAdminGuestbookList;
        loadAdminGuestbookList();
        // Chatbot event handler (önceki kodun devamı)
        const chatbotInput = document.getElementById('chatbot-question');
        const chatbotSend = document.getElementById('chatbot-send');
        const chatbotAnswer = document.getElementById('chatbot-answer');
        const chatbotClose = document.getElementById('chatbot-close');
        // Chatbot açıldığında terminal prompt'unu gizle
        const promptElement = document.querySelector('.prompt');
        if (promptElement) {
          promptElement.style.visibility = 'hidden';
        }
        // chatbotInput.focus(); // Otomatik odak kaldırıldı
        chatbotSend.onclick = async () => {
          const soru = chatbotInput.value.trim();
          if (!soru) {
            chatbotAnswer.textContent = "Lütfen bir soru yazın.";
            chatbotInput.focus();
            return;
          }
          chatbotAnswer.textContent = "Yanıt bekleniyor...";
          chatbotInput.disabled = true;
          chatbotSend.disabled = true;
          try {
            const response = await fetch(getApiBaseUrl() + '/api/chatbot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ soru })
            });
            const data = await response.json();
            chatbotAnswer.textContent = data.cevap;
          } catch (e) {
            chatbotAnswer.textContent = "Bağlantı hatası!";
          }
          chatbotInput.disabled = false;
          chatbotSend.disabled = false;
          chatbotInput.value = '';
          setTimeout(() => chatbotInput.focus(), 50);
        };
        chatbotInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') chatbotSend.click();
        });
        chatbotClose.onclick = () => {
          document.getElementById('chatbot-panel').remove();
          // Chatbot kapatıldığında terminal prompt'u tekrar göster
          const promptElement = document.querySelector('.prompt');
          if (promptElement) {
            promptElement.style.visibility = 'visible';
            document.getElementById('terminal-input').focus();
          }
        };
        // Chatbot Bilgi Yönetimi
        loadKnowledgeList();
        document.getElementById('add-knowledge-form').onsubmit = async function(e) {
          e.preventDefault();
          const question = document.getElementById('knowledge-question').value.trim();
          const answer = document.getElementById('knowledge-answer').value.trim();
          if (!question || !answer) return;
          const { error } = await supabase
            .from('chatbot_knowledge')
            .insert([{ question, answer }]);
          if (!error) {
            document.getElementById('knowledge-question').value = '';
            document.getElementById('knowledge-answer').value = '';
            loadKnowledgeList();
          } else {
            alert('Kayıt eklenemedi!');
          }
        };
        async function loadKnowledgeList() {
          const listDiv = document.getElementById('knowledge-list');
          listDiv.innerHTML = 'Yükleniyor...';
          const { data, error } = await supabase
            .from('chatbot_knowledge')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) {
            listDiv.innerHTML = '<p>Hata oluştu.</p>';
          } else if (data && data.length) {
            listDiv.innerHTML = '<ul style="padding-left:0;list-style:none;">' + data.map(k => `
              <li style="margin-bottom:8px;background:rgba(0,255,0,0.04);padding:6px 4px;border-radius:6px;">
                <b>Soru:</b> <span style="color:#0f0;">${k.question}</span><br>
                <b>Cevap:</b> <span style="color:#fff;">${k.answer}</span><br>
                <button data-id="${k.id}" class="edit-knowledge-btn" style="margin-right:6px;">Düzenle</button>
                <button data-id="${k.id}" class="delete-knowledge-btn">Sil</button>
              </li>`).join('') + '</ul>';
            // Silme
            listDiv.querySelectorAll('.delete-knowledge-btn').forEach(btn => {
              btn.onclick = async function() {
                const id = btn.getAttribute('data-id');
                btn.disabled = true;
                btn.textContent = 'Siliniyor...';
                const { error } = await supabase
                  .from('chatbot_knowledge')
                  .delete()
                  .eq('id', id);
                if (!error) {
                  btn.parentElement.remove();
                } else {
                  btn.textContent = 'Hata';
                }
              };
            });
            // Düzenleme
            listDiv.querySelectorAll('.edit-knowledge-btn').forEach(btn => {
              btn.onclick = function() {
                const id = btn.getAttribute('data-id');
                const item = data.find(k => k.id == id);
                if (!item) return;
                document.getElementById('knowledge-question').value = item.question;
                document.getElementById('knowledge-answer').value = item.answer;
                // Güncelleme için submit fonksiyonunu değiştir
                document.getElementById('add-knowledge-form').onsubmit = async function(e) {
                  e.preventDefault();
                  const newQ = document.getElementById('knowledge-question').value.trim();
                  const newA = document.getElementById('knowledge-answer').value.trim();
                  if (!newQ || !newA) return;
                  const { error } = await supabase
                    .from('chatbot_knowledge')
                    .update({ question: newQ, answer: newA, updated_at: new Date().toISOString() })
                    .eq('id', id);
                  if (!error) {
                    document.getElementById('knowledge-question').value = '';
                    document.getElementById('knowledge-answer').value = '';
                    loadKnowledgeList();
                    // Submit fonksiyonunu tekrar eklemeye çevir
                    document.getElementById('add-knowledge-form').onsubmit = arguments.callee.caller;
                  } else {
                    alert('Güncelleme başarısız!');
                  }
                };
              };
            });
          } else {
            listDiv.innerHTML = '<p>Henüz kayıt yok.</p>';
          }
        }
    }

    async function loadAdminGuestbookList() {
        const listDiv = document.getElementById('admin-guestbook-list');
        if (!listDiv) return;
        listDiv.innerHTML = 'Yükleniyor...';
        const { data, error } = await listGuestbookMessages();
        if (error) {
            listDiv.innerHTML = '<p>Hata oluştu.</p>';
        } else if (data && data.length) {
            listDiv.innerHTML = '<ul>' + data.map(m => `<li>${m.message} <span style="color:gray;font-size:0.8em;">${new Date(m.created_at).toLocaleString()}</span> <button data-id="${m.id}" class="admin-delete-btn">Sil</button></li>`).join('') + '</ul>';
            // Silme butonlarına event ekle
            listDiv.querySelectorAll('.admin-delete-btn').forEach(btn => {
                btn.onclick = async function() {
                    const id = btn.getAttribute('data-id');
                    btn.disabled = true;
                    btn.textContent = 'Siliniyor...';
                    const { error } = await deleteGuestbookMessage(id);
                    if (!error) {
                        btn.parentElement.remove();
                    } else {
                        btn.textContent = 'Hata';
                    }
                };
            });
        } else {
            listDiv.innerHTML = '<p>Henüz mesaj yok.</p>';
        }
    }

    async function deleteGuestbookMessage(id) {
        if (!supabase) return { error: 'Supabase yok' };
        const { error } = await supabase
            .from('guestbook')
            .delete()
            .eq('id', id);
        return { error };
    }

    // Komut işleme fonksiyonu
    function processCommand(command) {
        const output = document.createElement('div');
        const [cmd, ...args] = command.split(' ');

        if (cmd in commands && cmd !== 'notes') {
            output.innerHTML = commands[cmd];
        } else if (cmd === 'notes') {
            if (args[0] === 'view' && args[1]) {
                const idx = parseInt(args[1], 10) - 1;
                if (!isNaN(idx) && notesData[idx]) {
                    output.innerHTML = `<div class='note-detail'>${notesData[idx].content}<div style='color:gray;font-size:0.9em;'>${notesData[idx].date}</div></div>`;
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
                "Code is like humor. When you have to explain it, it’s bad."
            ];
            const msg = fortunes[Math.floor(Math.random() * fortunes.length)];
            output.innerHTML = `<p><em>${msg}</em></p>`;
        } else if (cmd === 'clear') {
            consoleOutput.innerHTML = '';
            return;
        } else if (cmd === 'guestbook' && args[0] === 'add') {
            const msg = args.slice(1).join(' ');
            if (!msg) {
                output.innerHTML = '<p>Mesaj boş olamaz.</p>';
            } else {
                output.innerHTML = '<p>Mesaj ekleniyor...</p>';
                consoleOutput.appendChild(output);
                addGuestbookMessage(msg).then(({ error }) => {
                    output.innerHTML = error ? '<p>Hata oluştu.</p>' : '<p>Mesaj kaydedildi!</p>';
                });
                return;
            }
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
        } else if (cmd === 'admin' && args[0] === 'login') {
            if (isAdmin || document.getElementById('admin-panel')) {
                output.innerHTML = '<p>Zaten admin yetkiniz var. Admin paneli açık.</p>';
                consoleOutput.appendChild(output);
                return;
            }
            output.innerHTML = '<p>Admin girişi başlatılıyor...</p>';
            consoleOutput.appendChild(output);
            adminLoginPrompt();
            return;
        } else if (cmd === 'chatbot') {
          const msg = args.join(' ');
          if (!msg) {
            output.innerHTML = '<p>Lütfen bir soru yazın. Örnek: chatbot Merhaba</p>';
            consoleOutput.appendChild(output);
            return;
          }
          output.innerHTML = '<p>Yanıt bekleniyor...</p>';
          consoleOutput.appendChild(output);
          fetch(getApiBaseUrl() + '/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ soru: msg })
          })
            .then(r => r.json())
            .then(data => { output.innerHTML = `<p>${data.cevap}</p>`; setTimeout(() => document.getElementById('terminal-input')?.focus(), 50); })
            .catch(() => { output.innerHTML = '<p>Bağlantı hatası!</p>'; });
          return;
        } else if (command.trim() !== '') {
            output.innerHTML = `<p>'${command}' is not recognized as an internal or external command.</p>`;
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

    // GitHub aktivitesi çekme fonksiyonu
    function fetchGithubActivity(outputDiv) {
        const username = 'MajevSong'; // Buraya kendi GitHub kullanıcı adını yazabilirsin
        fetch(`https://api.github.com/users/${username}/repos?sort=pushed`)
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data)) throw new Error('API limiti veya hata');
                const latest = data.slice(0, 5);
                outputDiv.innerHTML = `<p><strong>Son GitHub Repo Aktiviteleri:</strong></p><ul>` +
                    latest.map(repo => `<li><a href='${repo.html_url}' target='_blank'>${repo.name}</a> <span style='color:gray;font-size:0.9em;'>(${repo.pushed_at.slice(0,10)})</span></li>`).join('') +
                    `</ul>`;
            })
            .catch(() => {
                outputDiv.innerHTML = `<p>GitHub API limiti aşıldı veya bir hata oluştu. Daha sonra tekrar deneyin.</p>`;
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

    // Matrix yağmuru animasyonu (easter egg)
    function startMatrixRain() {
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
        setTimeout(() => {
            clearInterval(interval);
            canvas.remove();
        }, 3500);
    }

    // Ortama göre API adresini belirle
    function getApiBaseUrl() {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      return 'https://personel-web-site.onrender.com';
    }

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
});

