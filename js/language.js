/* js/language.js - Language Switcher */

// Translation data
const translations = {
    en: {
        // Product descriptions
        products: {
            keycover: {
                description: 'Handmade crochet key cover made with love and attention to detail. Protect your vehicle keys with a unique and adorable style.',
                includes: [
                    'Handmade crochet key cover',
                    'High-quality premium yarn material',
                    'Unique and attractive design',
                    'Suitable for various types of keys',
                    'Durable and easy to clean',
                    'Handmade with perfect details'
                ]
            },
            amigurumi: {
                description: 'Character amigurumi dolls made with detailed and neat crochet techniques. Each character has its own uniqueness and is perfect as a collection or special gift.',
                includes: [
                    'Ready-to-use handmade amigurumi doll',
                    'Height approximately 10-11 cm',
                    'Soft and safe premium yarn material',
                    'High-quality dacron filling',
                    'Neat face and costume details',
                    'Already washed and ready to hug'
                ]
            },
            gantungan: {
                description: 'Handmade crochet keychain with cute and adorable design. Perfect for bag accessories, vehicle keys, or as souvenirs and gifts.',
                includes: [
                    'Handmade crochet keychain',
                    'Size 5x3 cm',
                    'Quality keychain ring',
                    'Durable premium yarn material',
                    'Cute and unique design details',
                    'Lightweight and easy to carry'
                ]
            },
            pouchphone: {
                description: 'Handmade crochet phone pouch with a simple, sweet, and functional sling bag design. Made with textured crochet pattern in cream/off-white color, equipped with flap closure and long strap making it comfortable to use for carrying smartphones on the go.',
                includes: [
                    'Ready-to-use handmade crochet phone pouch',
                    'Sling bag model with long strap',
                    'Soft cream/off-white color that is easy to match',
                    'Textured crochet pattern with neat details',
                    'Equipped with flap closure to secure pouch contents',
                    'Suitable for smartphones, small cash, cards, or light accessories',
                    'Lightweight, practical, and comfortable for daily use',
                    'Custom colors and sizes can be requested via WhatsApp'
                ]
            },
            demonslayer: {
                description: 'Demon Slayer anime character amigurumi doll handmade with detailed costume, facial expressions, hair, and character-specific accessories. Perfect for anime collections, desk decorations, birthday gifts, or custom orders of favorite characters.',
                includes: [
                    'Handmade anime character amigurumi doll',
                    'Inspired by Demon Slayer characters',
                    'Height approximately 15 cm',
                    'Soft premium milk cotton yarn material',
                    'Soft and lightweight dacron filling',
                    'Hair, face, costume, and accessory details are neatly made',
                    'Perfect for collections, decorations, or special gifts',
                    'Custom other anime characters can be requested via WhatsApp'
                ]
            },
            dompettws: {
                description: 'Handmade crochet TWS pouch in soft pink color with a cute and practical small shape. Equipped with flap closure, pearl button accent, and hanging strap making it perfect for storing earbuds/TWS, coins, or small accessories to keep them safe and easy to carry.',
                includes: [
                    'Ready-to-use handmade crochet TWS pouch',
                    'Feminine and cute soft pink color',
                    'Small size, perfect for TWS case or small accessories',
                    'Equipped with flap closure to keep contents secure',
                    'Sweet and elegant pearl button accent',
                    'Practical hanging strap for attaching to bags or pouches',
                    'Premium yarn material with neat and textured crochet',
                    'Custom colors can be requested via WhatsApp'
                ]
            }
        },
        modalHeaders: {
            productDescription: 'Product Description:',
            productDetails: 'Product Details:'
        },
        whatsappMessage: 'Hello admin! I\'m interested in the {product} product',
        testimonials: [
            '"The doll is so cute and neat! The crochet details are smooth and the filling is solid. My child loves it!"',
            '"The quality of the crochet is excellent! The material is soft and the colors are beautiful. Perfect for gifts."',
            '"The crochet doll is adorable! The packaging is neat and delivery is fast. Very satisfied shopping here."'
        ],
        faq: [
            {
                question: 'Are the dolls ready-made or do I have to assemble them myself?',
                answer: 'Our dolls are already finished and ready to use. You don\'t need to assemble or crochet them yourself. Each doll is handmade by our craftsmen with full attention to detail.'
            },
            {
                question: 'How long does shipping take?',
                answer: 'For products in stock, we will process the shipment within 1-2 business days after payment is confirmed. Shipping estimates depend on location and the selected courier service.'
            },
            {
                question: 'Can I request a custom doll?',
                answer: 'Yes, we accept custom orders for dolls with specific designs, colors, or sizes. Please contact our admin via WhatsApp to discuss details and estimated production time.'
            }
        ],
        aboutCards: [
            {
                title: 'Handmade',
                description: 'Manually made with neat crochet details and personal touch.'
            },
            {
                title: 'Custom Order',
                description: 'You can request characters, colors, themes, and sizes according to your needs.'
            },
            {
                title: 'Premium Quality & Nationwide',
                description: 'Using premium yarn and serving orders throughout Indonesia.'
            }
        ],
        aboutDescription: 'Handmade crochet creations for your special moments',
        aboutText1: 'RAr\'s Crochet Handmade provides various crochet products such as custom amigurumi, handmade crochet dolls, crochet keychains, crochet fashion accessories, handmade souvenirs, custom gifts, crochet decorations, and various other premium crochet products.',
        aboutText2: 'We also accept custom orders according to your preferred characters, themes, colors, or needs so that each product feels more personal and memorable.',
        galleryPreviewTitle: 'Gallery Preview',
        galleryPreviewSubtitle: 'RAr\'s Crochet handmade crochet details'
    },
    id: {
        // Product descriptions
        products: {
            keycover: {
                description: 'Key cover rajut handmade yang dibuat dengan penuh cinta dan detail. Melindungi kunci kendaraan Anda dengan gaya yang unik dan menggemaskan.',
                includes: [
                    'Key cover rajut handmade',
                    'Bahan benang premium berkualitas tinggi',
                    'Desain unik dan menarik',
                    'Cocok untuk berbagai jenis kunci',
                    'Tahan lama dan mudah dibersihkan',
                    'Handmade dengan detail sempurna'
                ]
            },
            amigurumi: {
                description: 'Boneka amigurumi karakter yang dibuat dengan teknik rajut detail dan rapi. Setiap karakter memiliki keunikan tersendiri dan cocok sebagai koleksi atau hadiah spesial.',
                includes: [
                    'Boneka amigurumi handmade siap pakai',
                    'Tinggi sekitar 10-11 cm',
                    'Bahan benang premium lembut dan aman',
                    'Isian dakron berkualitas tinggi',
                    'Detail wajah dan kostum yang rapi',
                    'Sudah dicuci dan siap dipeluk'
                ]
            },
            gantungan: {
                description: 'Gantungan kunci rajut handmade dengan desain lucu dan menggemaskan. Cocok untuk aksesoris tas, kunci kendaraan, atau sebagai souvenir dan hadiah.',
                includes: [
                    'Gantungan kunci rajut handmade',
                    'Ukuran 5x3 cm',
                    'Ring gantungan kunci berkualitas',
                    'Bahan benang premium tahan lama',
                    'Detail desain yang lucu dan unik',
                    'Ringan dan mudah dibawa'
                ]
            },
            pouchphone: {
                description: 'Pouch phone rajut handmade dengan desain sling bag yang simple, manis, dan fungsional. Dibuat dengan motif crochet bertekstur warna cream/off-white, dilengkapi flap penutup dan tali panjang sehingga nyaman digunakan untuk membawa smartphone saat bepergian.',
                includes: [
                    'Pouch phone crochet handmade siap pakai',
                    'Model sling bag dengan tali panjang',
                    'Warna cream/off-white yang soft dan mudah dipadukan',
                    'Motif rajut bertekstur dengan detail rapi',
                    'Dilengkapi flap penutup untuk menjaga isi pouch',
                    'Cocok untuk smartphone, uang kecil, kartu, atau aksesori ringan',
                    'Ringan, praktis, dan nyaman digunakan harian',
                    'Custom warna dan ukuran bisa request via WhatsApp'
                ]
            },
            demonslayer: {
                description: 'Boneka amigurumi karakter anime Demon Slayer yang dibuat handmade dengan detail kostum, ekspresi wajah, rambut, dan aksesori khas karakter. Cocok untuk koleksi anime, dekorasi meja, hadiah ulang tahun, atau pesanan custom karakter favorit.',
                includes: [
                    'Boneka amigurumi karakter anime handmade',
                    'Terinspirasi dari karakter Demon Slayer',
                    'Tinggi sekitar 15 cm',
                    'Bahan benang milk cotton premium yang lembut',
                    'Isian dakron empuk dan ringan',
                    'Detail rambut, wajah, kostum, dan aksesori dibuat rapi',
                    'Cocok untuk koleksi, dekorasi, atau hadiah spesial',
                    'Custom karakter anime lain bisa request via WhatsApp'
                ]
            },
            dompettws: {
                description: 'Dompet TWS rajut handmade berwarna pink soft dengan bentuk mungil yang manis dan praktis. Dilengkapi flap penutup, kancing mutiara sebagai aksen, serta tali gantung sehingga cocok untuk menyimpan earbuds/TWS, koin, atau aksesori kecil agar lebih aman dan mudah dibawa.',
                includes: [
                    'Dompet TWS crochet handmade siap pakai',
                    'Warna pink soft yang feminin dan cute',
                    'Ukuran mungil, pas untuk case TWS atau aksesori kecil',
                    'Dilengkapi flap penutup agar isi lebih aman',
                    'Aksen kancing mutiara yang manis dan elegan',
                    'Tali gantung praktis untuk dikaitkan pada tas atau pouch',
                    'Bahan benang premium dengan rajutan rapi dan bertekstur',
                    'Custom warna bisa request via WhatsApp'
                ]
            }
        },
        modalHeaders: {
            productDescription: 'Deskripsi Produk:',
            productDetails: 'Detail Produk:'
        },
        whatsappMessage: 'Halo admin! Saya tertarik dengan produk {product}',
        testimonials: [
            '"Bonekanya lucu banget dan rapih! Detail rajutannya halus dan isian padat. Anak saya langsung suka!"',
            '"Kualitas rajutannya bagus banget! Bahan lembut dan warnanya cantik. Cocok banget buat kado."',
            '"Boneka rajutnya menggemaskan! Packagingnya rapi dan pengiriman cepat. Puas banget belanja di sini."'
        ],
        faq: [
            {
                question: 'Apakah boneka sudah jadi atau harus merakit sendiri?',
                answer: 'Boneka kami sudah dalam bentuk jadi dan siap pakai. Anda tidak perlu merakit atau merajut sendiri. Setiap boneka dibuat dengan tangan (handmade) oleh pengrajin kami dengan penuh perhatian pada detail.'
            },
            {
                question: 'Berapa lama waktu pengiriman?',
                answer: 'Untuk produk yang ready stock, kami akan proses pengiriman dalam 1-2 hari kerja setelah pembayaran dikonfirmasi. Estimasi pengiriman tergantung lokasi dan jasa ekspedisi yang dipilih.'
            },
            {
                question: 'Apakah bisa request custom boneka?',
                answer: 'Ya, kami menerima custom order untuk boneka dengan desain, warna, atau ukuran tertentu. Silakan hubungi admin kami melalui WhatsApp untuk diskusi detail dan estimasi waktu pengerjaan.'
            }
        ],
        aboutCards: [
            {
                title: 'Handmade',
                description: 'Dibuat manual dengan detail rajutan yang rapi dan sentuhan personal.'
            },
            {
                title: 'Custom Order',
                description: 'Bisa request karakter, warna, tema, dan ukuran sesuai kebutuhan Anda.'
            },
            {
                title: 'Premium Quality & Seluruh Indonesia',
                description: 'Menggunakan benang pilihan dan melayani pemesanan ke seluruh Indonesia.'
            }
        ],
        aboutDescription: 'Karya rajut handmade untuk momen spesial Anda',
        aboutText1: 'RAr\'s Crochet Handmade menyediakan berbagai produk rajut seperti amigurumi custom, boneka rajut handmade, gantungan kunci rajut, keychain crochet, aksesoris fashion rajut, souvenir handmade, hadiah custom, dekorasi rajut, dan berbagai produk crochet premium lainnya.',
        aboutText2: 'Kami juga melayani pesanan custom sesuai karakter, tema, warna, atau kebutuhan Anda sehingga setiap produk terasa lebih personal dan berkesan.',
        galleryPreviewTitle: 'Preview Galeri',
        galleryPreviewSubtitle: 'Detail karya rajut handmade RAr\'s Crochet'
    }
};

// Current language state
let currentLang = 'en'; // Default to English

// Initialize language switcher
function initLanguageSwitcher() {
    const langEnBtn = document.getElementById('lang-en');
    const langIdBtn = document.getElementById('lang-id');
    const mobileLangBtn = document.getElementById('mobile-lang-btn');
    const mobileLangOptions = document.querySelectorAll('.mobile-lang-option');

    // Desktop language buttons
    if (langEnBtn) {
        langEnBtn.addEventListener('click', () => switchLanguage('en'));
    }
    if (langIdBtn) {
        langIdBtn.addEventListener('click', () => switchLanguage('id'));
    }

    // Mobile language toggle
    if (mobileLangBtn) {
        mobileLangBtn.addEventListener('click', () => {
            // Toggle between languages
            switchLanguage(currentLang === 'en' ? 'id' : 'en');
        });
    }

    // Mobile language options in menu
    mobileLangOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            switchLanguage(lang);
        });
    });

    // Set initial language
    switchLanguage('en');
}

// Switch language function
function switchLanguage(lang) {
    currentLang = lang;

    // Update active button state (desktop)
    const langEnBtn = document.getElementById('lang-en');
    const langIdBtn = document.getElementById('lang-id');

    if (langEnBtn && langIdBtn) {
        if (lang === 'en') {
            langEnBtn.classList.add('active', 'bg-coklatMuda', 'text-putih');
            langEnBtn.classList.remove('hover:bg-cream');
            langIdBtn.classList.remove('active', 'bg-coklatMuda', 'text-putih');
            langIdBtn.classList.add('hover:bg-cream');
        } else {
            langIdBtn.classList.add('active', 'bg-coklatMuda', 'text-putih');
            langIdBtn.classList.remove('hover:bg-cream');
            langEnBtn.classList.remove('active', 'bg-coklatMuda', 'text-putih');
            langEnBtn.classList.add('hover:bg-cream');
        }
    }

    // Update mobile flag
    const currentFlag = document.getElementById('current-flag');
    if (currentFlag) {
        currentFlag.textContent = lang === 'en' ? '🇬🇧' : '🇮🇩';
    }

    // Update mobile language options
    const mobileLangOptions = document.querySelectorAll('.mobile-lang-option');
    mobileLangOptions.forEach(option => {
        if (option.dataset.lang === lang) {
            option.classList.add('bg-coklatMuda', 'text-putih');
            option.classList.remove('bg-cream');
        } else {
            option.classList.remove('bg-coklatMuda', 'text-putih');
            option.classList.add('bg-cream');
        }
    });

    // Update all translatable elements
    updatePageContent(lang);

    // Update product data for modals
    updateProductData(lang);

    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
}

// Update page content
function updatePageContent(lang) {
    // Update all elements with data-en and data-id attributes
    const translatableElements = document.querySelectorAll('[data-en][data-id]');

    translatableElements.forEach(element => {
        const enText = element.getAttribute('data-en');
        const idText = element.getAttribute('data-id');

        if (lang === 'en') {
            element.textContent = enText;
        } else {
            element.textContent = idText;
        }
    });

    // Update button texts that have inner HTML
    const btnTexts = document.querySelectorAll('.btn-text');
    btnTexts.forEach(btn => {
        const parent = btn.closest('[data-en][data-id]');
        if (parent) {
            const enText = parent.getAttribute('data-en');
            const idText = parent.getAttribute('data-id');
            btn.textContent = lang === 'en' ? enText : idText;
        }
    });

    // Update WhatsApp links
    const waButtons = document.querySelectorAll('[data-wa-en][data-wa-id]');
    waButtons.forEach(btn => {
        const waEn = btn.getAttribute('data-wa-en');
        const waId = btn.getAttribute('data-wa-id');
        const baseUrl = 'https://wa.me/6281929761548?text=';
        btn.href = baseUrl + (lang === 'en' ? waEn : waId);
    });

    // Update testimonials
    updateTestimonials(lang);

    // Update FAQ
    updateFAQ(lang);

    // Update About section
    updateAboutSection(lang);
}

// Update product data for modals
function updateProductData(lang) {
    // This will be called by main.js when opening modal
    window.currentProductLang = lang;
}

// Update testimonials
function updateTestimonials(lang) {
    const testimonialTexts = document.querySelectorAll('.testimonial-text');
    testimonialTexts.forEach((text, index) => {
        if (translations[lang].testimonials[index]) {
            text.textContent = translations[lang].testimonials[index];
        }
    });
}

// Update FAQ
function updateFAQ(lang) {
    const faqButtons = document.querySelectorAll('.faq-question');
    const faqContents = document.querySelectorAll('.faq-content');

    faqButtons.forEach((button, index) => {
        if (translations[lang].faq[index]) {
            button.childNodes[0].textContent = translations[lang].faq[index].question + ' ';
        }
    });

    faqContents.forEach((content, index) => {
        if (translations[lang].faq[index]) {
            content.textContent = translations[lang].faq[index].answer;
        }
    });
}

// Update About section
function updateAboutSection(lang) {
    const aboutDesc = document.querySelector('.about-description');
    const aboutText1 = document.querySelector('.about-text-1');
    const aboutText2 = document.querySelector('.about-text-2');

    if (aboutDesc) aboutDesc.textContent = translations[lang].aboutDescription;
    if (aboutText1) aboutText1.textContent = translations[lang].aboutText1;
    if (aboutText2) aboutText2.textContent = translations[lang].aboutText2;

    // Update about cards
    const aboutCards = document.querySelectorAll('.about-value-card');
    aboutCards.forEach((card, index) => {
        if (translations[lang].aboutCards[index]) {
            const title = card.querySelector('h4');
            const desc = card.querySelector('p');
            if (title) title.textContent = translations[lang].aboutCards[index].title;
            if (desc) desc.textContent = translations[lang].aboutCards[index].description;
        }
    });
}

// Get current translation data
function getCurrentTranslation() {
    return translations[currentLang];
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
} else {
    initLanguageSwitcher();
}

// Export for use in other scripts
window.languageSwitcher = {
    getCurrentLang: () => currentLang,
    getTranslations: getCurrentTranslation,
    switchLanguage: switchLanguage
};
