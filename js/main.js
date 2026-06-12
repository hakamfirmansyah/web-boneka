/* js/main.js */

// Typing Animation Effect with Loop
const typingText = document.getElementById('typing-text');
const text = 'RAr\'s Crochet';
let index = 0;
let isDeleting = false;

function typeWriter() {
    if (!isDeleting && index < text.length) {
        // Typing forward
        typingText.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
    } else if (!isDeleting && index === text.length) {
        // Wait before deleting
        isDeleting = true;
        setTimeout(typeWriter, 2000);
    } else if (isDeleting && index > 0) {
        // Deleting backward
        typingText.textContent = text.substring(0, index - 1);
        index--;
        setTimeout(typeWriter, 50);
    } else if (isDeleting && index === 0) {
        // Wait before typing again
        isDeleting = false;
        setTimeout(typeWriter, 500);
    }
}

// Start typing animation when page loads
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeWriter, 500);
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('nav-scrolled');
        navbar.classList.replace('h-20', 'h-16'); // make it slightly thinner
    } else {
        navbar.classList.remove('nav-scrolled');
        navbar.classList.replace('h-16', 'h-20');
    }
});

// FAQ Toggle
function toggleFaq(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('i');

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}

// Data Produk untuk Modal
const productsData = {
    keycover: {
        title: 'Key Cover',
        image: 'assets/key cover deskripsi.JPG',
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
        title: 'Amigurumi Character',
        image: 'assets/Boneka Anime deskripsi.JPG',
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
        title: 'Keychain',
        image: 'assets/gantungan kunci deskripsi.jpg',
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
        title: 'Pouch Phone | Phone Bag',
        image: 'assets/pouch phone deskripsi.jpeg',
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
        title: 'Demon Slayer Amigurumi',
        image: 'assets/demon slayer deskripsi.jpeg',
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
        title: 'Dompet TWS Crochet',
        image: 'assets/dompet tws deskripsi.jpeg',
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
};

// Modal Functions
const modal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');

function openDetailModal(productId) {
    const data = productsData[productId];
    if (!data) return;

    // Get current language from language switcher
    const currentLang = window.languageSwitcher ? window.languageSwitcher.getCurrentLang() : 'en';
    const translations = window.languageSwitcher ? window.languageSwitcher.getTranslations() : null;

    // Get translated product data if available
    let description = data.description;
    let includes = data.includes;
    let modalHeaderDesc = 'Product Description:';
    let modalHeaderDetails = 'Product Details:';
    let whatsappText = `Hello admin! I'm interested in the ${data.title} product`;

    if (translations && translations.products[productId]) {
        description = translations.products[productId].description;
        includes = translations.products[productId].includes;
        modalHeaderDesc = translations.modalHeaders.productDescription;
        modalHeaderDetails = translations.modalHeaders.productDetails;
        whatsappText = translations.whatsappMessage.replace('{product}', data.title);
    }

    let includesHtml = includes.map(item => `
        <li class="flex items-start mb-2">
            <i class="fas fa-check text-coklatMuda mt-1 mr-3"></i>
            <span class="text-gray-700">${item}</span>
        </li>
    `).join('');

    modalContent.innerHTML = `
        <div class="md:w-1/2 bg-gradient-to-br from-putih via-cream/40 to-putih flex items-center justify-center p-4 md:p-6 md:rounded-l-3xl">
            <img src="${data.image}" alt="${data.title}" class="w-full max-h-[420px] md:max-h-[560px] object-contain rounded-2xl">
        </div>
        <div class="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            <div class="bg-orange-100 text-coklatTua px-3 py-1 rounded-full text-xs font-bold inline-block mb-4 w-max">HANDMADE</div>
            <h3 class="text-3xl font-bold text-coklatTua mb-4">${data.title}</h3>

            <h4 class="font-bold text-gray-800 mb-2">${modalHeaderDesc}</h4>
            <p class="text-gray-600 mb-6">${description}</p>

            <h4 class="font-bold text-gray-800 mb-3">${modalHeaderDetails}</h4>
            <ul class="mb-8">
                ${includesHtml}
            </ul>

            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <a href="https://wa.me/6281929761548?text=${encodeURIComponent(whatsappText)}" target="_blank" class="bg-green-500 text-putih px-6 py-3 rounded-xl font-bold text-center hover:bg-green-600 transition flex-grow shadow-md">
                    <i class="fab fa-whatsapp mr-2"></i> WhatsApp
                </a>
                <a href="https://www.instagram.com/rarscrochet?igsh=ODVreHV0bzhkcnN6" target="_blank" class="bg-pink-500 text-putih px-6 py-3 rounded-xl font-bold text-center hover:bg-pink-600 transition flex-grow shadow-md">
                    <i class="fab fa-instagram mr-2"></i> Instagram
                </a>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Close modal when clicking outside the content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Gallery Filter
const galleryGrid = document.getElementById('galleryGrid');
const galleryFilterButtons = document.querySelectorAll('.gallery-filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
let galleryFilterTimer;

function setActiveGalleryFilter(activeButton) {
    galleryFilterButtons.forEach(button => {
        button.classList.remove('active', 'bg-coklatTua', 'text-putih');
        button.classList.add('bg-putih', 'text-coklatTua');
    });

    activeButton.classList.add('active', 'bg-coklatTua', 'text-putih');
    activeButton.classList.remove('bg-putih', 'text-coklatTua');
}

function filterGallery(category, withAnimation = false) {
    clearTimeout(galleryFilterTimer);

    const applyFilter = () => {
        let revealIndex = 0;

        galleryItems.forEach(item => {
            const isVisible = item.dataset.category === category;

            item.classList.remove('gallery-reveal');
            item.style.animationDelay = '';
            item.classList.toggle('hidden-by-filter', !isVisible);

            if (isVisible && withAnimation) {
                item.style.animationDelay = `${revealIndex * 90}ms`;
                item.classList.add('gallery-reveal');
                revealIndex++;
            }
        });

        if (galleryGrid) {
            galleryGrid.classList.remove('gallery-switching');
        }
    };

    if (withAnimation && galleryGrid) {
        galleryGrid.classList.add('gallery-switching');
        galleryFilterTimer = setTimeout(applyFilter, 180);
    } else {
        applyFilter();
    }
}

galleryFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('active')) return;

        setActiveGalleryFilter(button);
        filterGallery(button.dataset.filter, true);
    });
});

const initialGalleryFilter = document.querySelector('.gallery-filter-btn.active');
if (initialGalleryFilter) {
    filterGallery(initialGalleryFilter.dataset.filter);
}

// Gallery Preview Modal
const galleryPreviewModal = document.getElementById('galleryPreviewModal');
const galleryPreviewImage = document.getElementById('galleryPreviewImage');
const galleryPreviewTitle = document.getElementById('galleryPreviewTitle');

function openGalleryPreview(item) {
    if (!galleryPreviewModal || !galleryPreviewImage || !galleryPreviewTitle) return;

    const image = item.querySelector('img');
    const title = item.querySelector('.gallery-title')?.textContent || image?.alt || 'Gallery Preview';

    if (!image) return;

    galleryPreviewImage.src = image.src;
    galleryPreviewImage.alt = title;
    galleryPreviewTitle.textContent = title;
    galleryPreviewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeGalleryPreview() {
    if (!galleryPreviewModal) return;

    galleryPreviewModal.classList.add('hidden');
    galleryPreviewImage.src = '';
    document.body.style.overflow = 'auto';
}

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        if (!item.classList.contains('hidden-by-filter')) {
            openGalleryPreview(item);
        }
    });
});

if (galleryPreviewModal) {
    galleryPreviewModal.addEventListener('click', (e) => {
        if (e.target === galleryPreviewModal) {
            closeGalleryPreview();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeGalleryPreview();
    }
});

// Scroll Animation Observer
const scrollAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

// Apply scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Animate all elements with scroll-animate class
    const scrollElements = document.querySelectorAll('.scroll-animate, .fade-in-left, .fade-in-right, .scale-up, .stagger-item');
    scrollElements.forEach(el => {
        scrollAnimationObserver.observe(el);
    });
});

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
    }, 1000); // Show loading for 1 second
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});