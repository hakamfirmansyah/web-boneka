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
    beruang: {
        title: 'Boneka Beruang Rajut Handmade',
        price: 'Rp 150.000',
        image: 'https://images.unsplash.com/photo-1686151271777-12efa81f65e0?auto=format&fit=crop&q=80&w=800',
        description: 'Boneka beruang rajut yang dibuat dengan penuh cinta dan perhatian pada setiap detail. Cocok sebagai teman bermain anak atau hadiah spesial untuk orang tersayang.',
        includes: [
            'Boneka rajut handmade siap pakai',
            'Tinggi sekitar 25-30 cm',
            'Bahan benang premium lembut dan aman',
            'Isian dakron berkualitas tinggi',
            'Mata boneka safety eyes',
            'Sudah dicuci dan siap dipeluk'
        ],
        buyLink: '#kontak'
    },
    kelinci: {
        title: 'Boneka Kelinci Rajut Handmade',
        price: 'Rp 165.000',
        image: 'https://images.unsplash.com/photo-1682954013913-25fe41e180c0?auto=format&fit=crop&q=80&w=800',
        description: 'Boneka kelinci dengan telinga panjang yang menggemaskan. Setiap detail dirajut dengan teliti untuk menghasilkan boneka berkualitas tinggi yang tahan lama.',
        includes: [
            'Boneka rajut handmade siap pakai',
            'Tinggi sekitar 30-35 cm (termasuk telinga)',
            'Bahan benang premium lembut',
            'Isian dakron padat dan empuk',
            'Mata boneka safety eyes',
            'Sudah dicuci dan siap dipeluk'
        ],
        buyLink: '#kontak'
    },
    kucing: {
        title: 'Gantungan Kunci Kucing Rajut',
        price: 'Rp 35.000',
        image: 'https://images.unsplash.com/photo-1629019317873-3f603b269723?auto=format&fit=crop&q=80&w=800',
        description: 'Gantungan kunci rajut bentuk wajah kucing yang imut dan menggemaskan. Cocok untuk aksesoris tas, kunci, atau sebagai souvenir.',
        includes: [
            'Gantungan kunci rajut handmade',
            'Ukuran sekitar 8-10 cm',
            'Ring gantungan kunci berkualitas',
            'Bahan benang premium',
            'Detail wajah yang lucu',
            'Ringan dan tahan lama'
        ],
        buyLink: '#kontak'
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
            <div class="bg-orange-100 text-coklatTua px-3 py-1 rounded-full text-xs font-bold inline-block mb-4 w-max">BEST SELLER</div>
            <h3 class="text-3xl font-bold text-coklatTua mb-2">${data.title}</h3>
            <p class="text-2xl font-bold text-coklatMuda mb-6">${data.price}</p>

            <h4 class="font-bold text-gray-800 mb-2">Deskripsi Produk:</h4>
            <p class="text-gray-600 mb-6">${data.description}</p>

            <h4 class="font-bold text-gray-800 mb-3">Isi Paket Termasuk:</h4>
            <ul class="mb-8">
                ${includesHtml}
            </ul>

            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <a href="https://wa.me/6287781818202?text=halo%20admin!%20saya%20ingin%20bertanya%20tentang%20produk%20ini." target="_blank" class="bg-coklatTua text-putih px-6 py-3 rounded-xl font-bold text-center hover:bg-opacity-90 transition flex-grow shadow-md">
                    <i class="fab fa-whatsapp mr-2"></i> Tanya Admin
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