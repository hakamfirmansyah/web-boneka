/* js/main.js */

// Typing Animation Effect with Loop
const typingText = document.getElementById('typing-text');
const text = 'Boneka Rajut Handmade';
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
        title: 'Amigurumi Character',
        image: 'assets/Boneka Anime deskripsi.JPG',
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
        title: 'Keychain',
        image: 'assets/gantungan kunci deskripsi.jpg',
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
        title: 'Pouch Phone | Phone Bag',
        image: 'assets/pouch phone deskripsi.jpeg',
        description: 'Pouch phone rajut handmade yang fungsional dan stylish. Melindungi smartphone Anda dengan bahan lembut sekaligus menambah gaya personal yang unik.',
        includes: [
            'Pouch phone rajut handmade',
            'Ukuran cocok untuk berbagai smartphone',
            'Bahan benang premium lembut',
            'Desain praktis dengan tali',
            'Melindungi ponsel dari goresan',
            'Dapat digunakan sebagai tas mini'
        ]
    }
};

// Modal Functions
const modal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');

function openDetailModal(productId) {
    const data = productsData[productId];
    if (!data) return;

    let includesHtml = data.includes.map(item => `
        <li class="flex items-start mb-2">
            <i class="fas fa-check text-coklatMuda mt-1 mr-3"></i>
            <span class="text-gray-700">${item}</span>
        </li>
    `).join('');

    modalContent.innerHTML = `
        <div class="md:w-1/2">
            <img src="${data.image}" alt="${data.title}" class="w-full h-full object-cover md:rounded-l-3xl max-h-[400px] md:max-h-full">
        </div>
        <div class="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            <div class="bg-orange-100 text-coklatTua px-3 py-1 rounded-full text-xs font-bold inline-block mb-4 w-max">HANDMADE</div>
            <h3 class="text-3xl font-bold text-coklatTua mb-4">${data.title}</h3>

            <h4 class="font-bold text-gray-800 mb-2">Deskripsi Produk:</h4>
            <p class="text-gray-600 mb-6">${data.description}</p>

            <h4 class="font-bold text-gray-800 mb-3">Detail Produk:</h4>
            <ul class="mb-8">
                ${includesHtml}
            </ul>

            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <a href="https://wa.me/6281929761548?text=Halo%20admin!%20Saya%20tertarik%20dengan%20produk%20${encodeURIComponent(data.title)}" target="_blank" class="bg-green-500 text-putih px-6 py-3 rounded-xl font-bold text-center hover:bg-green-600 transition flex-grow shadow-md">
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