# Geliştirici Notları & Yol Haritası

Merhaba! Bu doküman, kişisel web sitenin geliştirme süreci için bir rehber niteliğindedir. İlk adımları attık, şimdi diğer harika özellikler için plan yapalım.

## ✅ Tamamlananlar (Mevcut Kod)

1.  **"Hakkımda" ve "Projeler" Bölümü Yapısı:**
    -   `index.html` içinde bu bölümler için modern ve genişletilebilir bir yapı oluşturuldu.
    -   Proje kartları; açıklama, teknoloji etiketleri, canlı önizleme ve repo linklerini içerecek şekilde tasarlandı.

2.  **🎨 Retro Tema Seçici:**
    -   `style.css` dosyasında CSS değişkenleri (`:root`) kullanılarak esnek bir tema altyapısı kuruldu.
    -   `Matrix`, `DOS` ve `Commodore 64` için başlangıç temaları eklendi.
    -   `script.js` ile kullanıcının tema seçimi tarayıcının `localStorage`'ına kaydediliyor, böylece siteye tekrar girdiğinde seçimi hatırlanıyor.

3.  **🖼️ CRT Efekti:**
    -   `style.css`'e eklenen `.crt-effect` sınıfı ile tüm sayfa üzerinde hafif bir "eski monitör" efekti oluşturuldu. Bu, sitenin retro atmosferini güçlendiriyor.

---

## 🚧 Planlananlar & Fikirler

1. **Terminal UI Komutlarını Genişlet:**
   - Ziyaretçi defteri (guestbook) komutu ekle: Kullanıcılar terminalden mesaj bırakabilsin.
   - Basit oyunlar (ör: snake, tetris) terminalden başlatılabilsin.
   - Komut geçmişi ve autocomplete desteği ekle.

2. **Blog/Notlar Bölümü:**
   - Markdown dosyalarını otomatik HTML'ye çeviren bir sistem kur (statik veya JS tabanlı).
   - Notlar/bloglar için arama ve filtreleme ekle.

3. **Ziyaretçi Defteri Backend'i:**
   - Firebase, Supabase veya basit bir backend ile mesajları kaydet.
   - Spam ve kötüye kullanıma karşı basit doğrulama ekle.

4. **GitHub Aktivitesi:**
   - Son commit ve repo aktivitelerini terminal veya ana sayfada göster.
   - API limiti ve hata yönetimi için kullanıcıya bilgi ver.

5. **CV & İletişim:**
   - CV'yi .txt ve/veya PDF olarak sun.
   - Basit bir iletişim formu veya mailto linki ekle.

6. **Tema & Kişiselleştirme:**
   - Daha fazla retro tema ekle (ör: Amiga, Apple II, ZX Spectrum).
   - Kullanıcıya özel tema ayarları (renk, font, efekt) sun.

7. **Mobil & Erişilebilirlik:**
   - Mobilde daha iyi deneyim için ek responsive ve dokunmatik iyileştirmeler.
   - Erişilebilirlik (a11y) için kontrast, font boyutu ve klavye navigasyonu desteği.

8. **Performans & Kod Temizliği:**
   - Kodun sadeleştirilmesi ve gereksiz bağımlılıkların kaldırılması.
   - İngilizce dökümantasyon ve açıklamalar ekle.

9. **Easter Egg & Sürprizler:**
   - Terminalde gizli komutlar ve sürpriz mesajlar.
   - ASCII animasyonlar veya efektler.