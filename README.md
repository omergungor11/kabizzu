# Kabizzu

Mimarlık ve iç mekân odaklı, Türkçe bir konsept stüdyo sitesi. Krem ve zeytin tonları, büyük serif tipografi ve scroll ile ilerleyen katmanlı görseller üzerine kuruldu.

## Deneyim

- İki sıralı fotoğraf şeridinin tek sırada birleşip merkezde toplandığı açılış animasyonu
- Merkezdeki fotoğraftan tam ekran kapak görseline kesintisiz geçiş ve sıralı metin açılışı
- Açılışta görsel/font yükleme kontrolü; geç düğmesi, Escape, azaltılmış hareket ve hata durumunda otomatik açılma
- Tam ekran kapakta scroll ile derinlik hareketi
- Farklı hızlarda ilerleyen fotoğraf katmanları ve parallax
- Üç konsept mekân arasında geçiş ve açılabilir proje detayları
- Tam ekran menü, sayfa içi gezinme ve süreç akordeonları
- Mobil düzen, klavye erişimi ve azaltılmış hareket tercihi desteği
- Yerel WebP görseller ve yerel font dosyaları

Projeler, fotoğraflar ve metinler bir tasarım konseptini temsil eder. Gerçekleşmiş proje, müşteri veya şirket geçmişi iddiası taşımaz. İletişim formu veya sunucu tarafı veri toplama bulunmaz.

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
  app.js              Scroll, menü ve proje etkileşimleri
  intro.js            Açılış zaman çizelgesi ve güvenli tamamlanma
  intro.css           Yükleme sahnesi ve tam ekran kapak
  assets/             WebP görseller ve fontlar
docs/image-prompts.json  Özgün görsellerin üretim istemleri
licenses/             Üçüncü taraf font lisansları
.openai/hosting.json   Sites yayın ayarı
```

## Kontrol

```sh
node --check dist/app.js
node --check dist/intro.js
node --test scripts/intro.test.mjs
python3 scripts/validate.py
```

Doğrulayıcı; HTML içindeki yerel varlıkları, bağlantı hedeflerini, görsel boyutlarını, CSS varlık yollarını ve yayın girişini kontrol eder. Tarayıcıdaki hareketlerin görsel doğrulamasının yerini tutmaz.

## Referans ve görseller

Görsel yön ve hareket yaklaşımı için [Stanzza](https://stanzza.design/awards) referans alınmıştır. Kabizzu bağımsız bir konsept çalışmasıdır; Stanzza ile bağlantılı değildir. Referans sitenin kaynak kodu, logosu veya fotoğrafları bu repoya alınmamıştır.

Üç iç mekân görseli OpenAI'nin yerleşik Imagegen aracıyla bu proje için üretilmiş ve WebP biçimine dönüştürülmüştür. İstemler `docs/image-prompts.json` dosyasındadır.

## Lisans

Özgün proje kodu ve dokümantasyonu [MIT](LICENSE) lisanslıdır. Proje için üretilen görseller de hak sahibinin lisanslayabildiği ölçüde aynı izinle sunulur. Üçüncü taraf fontlar kendi SIL Open Font License 1.1 koşullarına tabidir. Ayrıntılar: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
