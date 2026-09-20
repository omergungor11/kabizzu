# Kabizzu

Mimarlık ve iç mekân odaklı, Türkçe bir konsept stüdyo sitesi. Krem ve zeytin tonları, büyük serif tipografi ve scroll ile ilerleyen katmanlı görseller üzerine kuruldu.

## Deneyim

- İki sıralı fotoğraf şeridinin tek sırada birleşip merkezde toplandığı açılış animasyonu
- Merkezdeki fotoğraftan tam ekran kapak görseline kesintisiz geçiş ve sıralı metin açılışı
- Açılışta görsel/font yükleme kontrolü; geç düğmesi, Escape, azaltılmış hareket ve hata durumunda otomatik açılma
- Tam ekran kapakta scroll ile derinlik hareketi
- Farklı hızlarda ilerleyen fotoğraf katmanları ve parallax
- Dikey kaydırmayla yatay ilerleyen dört konsept mekân ve açılabilir proje detayları
- Hover ile açılan, dokunma ve klavyeyle de kullanılabilen kompakt menü, Lenis ile yumuşak kaydırma ve sayfa içi gezinme
- Scroll ile siyah-beyazdan renkliye geçen dört süreç satırı, lacivert sahnede sağ alttaki bir kareden büyüyerek açılan sütun biçimli mimarlık kartı ve ardından yatay ilerleyen üç yaklaşım kartı
- Son kartların sabit kaldığı, Hakkımızda bölümünün alttan yükselerek lacivert sahneyi kapattığı scroll geçişi
- Scroll ile sırayla fotoğrafı açılan sayaçlar ve konsept marka şeridi
- Stüdyo metninin yanında soldan gelen, hover sırasında derinlik ve yakınlaşma efekti veren görsel
- Sağda daha küçük ve aşağıda konumlanan, izometrik açılı dördüncü yazı dahil okunabilir dört yazı, kurucu alanı, genişletilebilir SSS
- Demo proje formu, tarih/saat seçimi ve cihazda oluşturulan talep indirmesi
- Mobil düzen, klavye erişimi ve azaltılmış hareket tercihi desteği
- Yerel WebP görseller ve yerel font dosyaları

Projeler, fotoğraflar ve metinler bir tasarım konseptini temsil eder. Gerçekleşmiş proje, müşteri veya şirket geçmişi iddiası taşımaz. Form ve randevu akışları demodur. Veriler sunucuya gönderilmez veya kalıcı depolamaya yazılmaz; pencere kapandığında temizlenir. Gerçek randevu ya da e-posta gönderilmez.

## Yerelde çalıştırma

Python 3 ile, projenin kök klasöründen:

```sh
python3 -m http.server 4317 --bind 127.0.0.1 --directory dist
```

Ardından `http://127.0.0.1:4317` adresini açın. Build veya paket kurulumu gerektirmez. `dist` klasörünü web sunucusunun kökü olarak servis edin; site varlık yolları kökten başlar.

## Dosyalar

```text
dist/
  index.html          Sayfa içeriği ve dialog yapıları
  style.css           Görsel dil, responsive düzen ve geçişler
  app.js              Scroll, menü, dialog ve demo form etkileşimleri
  motion.js           DOM bağımsız scroll geometrisi
  vendor/             Sabit sürümlü Lenis 1.3.26
  intro.js            Açılış zaman çizelgesi ve güvenli tamamlanma
  intro.css           Yükleme sahnesi ve tam ekran kapak
  assets/             WebP görseller, özgün SVG çizimleri ve fontlar
docs/image-prompts.json  Özgün görsellerin üretim istemleri
licenses/             Üçüncü taraf font lisansları
.openai/hosting.json   Sites yayın ayarı
```

## Kontrol

```sh
node --check dist/app.js
node --check dist/intro.js
node --test scripts/*.test.mjs
python3 scripts/validate.py
```

Doğrulayıcı; HTML içindeki yerel varlıkları, bağlantı hedeflerini, görsel boyutlarını, CSS varlık yollarını ve yayın girişini kontrol eder. Tarayıcıdaki hareketlerin görsel doğrulamasının yerini tutmaz.

## Referans ve görseller

Görsel yön ve hareket yaklaşımı için [Stanzza](https://stanzza.design/awards) referans alınmıştır. Kabizzu bağımsız bir konsept çalışmasıdır; Stanzza ile bağlantılı değildir. Referans sitenin kaynak kodu, logosu veya fotoğrafları bu repoya alınmamıştır.

Dört iç mekân görseli, bir mimari çizim ve kurgusal kurucu portresi OpenAI'nin yerleşik Imagegen aracıyla bu proje için üretilmiş ve WebP biçimine dönüştürülmüştür. İstemler `docs/image-prompts.json` dosyasındadır.

## Lisans

Özgün proje kodu ve dokümantasyonu [MIT](LICENSE) lisanslıdır. Proje için üretilen görseller de hak sahibinin lisanslayabildiği ölçüde aynı izinle sunulur. Üçüncü taraf fontlar kendi SIL Open Font License 1.1 koşullarına, Lenis kendi MIT lisansına tabidir. Ayrıntılar: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
