/* js/main.js */
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
        title: 'Boneka Beruang Rajut DIY',
        price: 'Rp 89.000',
        image: 'https://images.unsplash.com/photo-1686151271777-12efa81f65e0?auto=format&fit=crop&q=80&w=800',
        description: 'Kit rajut lengkap untuk membuat boneka beruang lucu dengan panduan langkah demi langkah yang mudah dipahami. Cocok untuk Anda yang baru pertama kali mencoba dunia merajut.',
        includes: [
            '2 gulung benang rajut premium (Coklat & Putih)',
            'Hakpen ukuran 3.0mm',
            'Satu kantong dakron kualitas tinggi',
            'Sepasang mata boneka safety eyes',
            'Jarum tapestry untuk menjahit',
            'Buku panduan cetak & link video tutorial'
        ],
        buyLink: '#kontak'
    },
    kelinci: {
        title: 'Boneka Kelinci Rajut DIY',
        price: 'Rp 95.000',
        image: 'https://images.unsplash.com/photo-1682954013913-25fe41e180c0?auto=format&fit=crop&q=80&w=800',
        description: 'Kit DIY untuk membuat boneka kelinci dengan telinga panjang yang imut. Desainnya detail, sangat cocok sebagai hadiah untuk orang-orang tersayang.',
        includes: [
            '2 gulung benang rajut premium (Pink & Putih)',
            'Hakpen ukuran 3.0mm',
            'Satu kantong dakron kualitas tinggi',
            'Sepasang mata boneka safety eyes',
            'Jarum tapestry untuk menjahit',
            'Buku panduan cetak & link video tutorial'
        ],
        buyLink: '#kontak'
    },
    kucing: {
        title: 'Gantungan Kunci Kucing DIY',
        price: 'Rp 45.000',
        image: 'https://images.unsplash.com/photo-1629019317873-3f603b269723?auto=format&fit=crop&q=80&w=800',
        description: 'Proyek mungil yang cepat diselesaikan. Kit ini berisi bahan untuk membuat gantungan kunci bentuk wajah kucing yang sangat menggemaskan.',
        includes: [
            '1 gulung benang rajut ukuran kecil',
            'Hakpen ukuran 2.5mm',
            'Ring gantungan kunci',
            'Sepasang mata boneka kecil',
            'Jarum tapestry & dakron secukupnya',
            'Lembar panduan sederhana'
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