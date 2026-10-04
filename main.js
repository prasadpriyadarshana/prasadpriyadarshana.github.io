// ===== Theme (set per page via data-theme attribute in HTML) =====
const htmlEl = document.documentElement;

document.addEventListener('DOMContentLoaded', () => {
    initDock();
    initBentoGlow();
    initSmoothScroll();
});

// ===== Dock: active state + hide on scroll down =====
function initDock() {
    const page = document.body.dataset.page;
    if (page) {
        const link = document.querySelector(`.dock-item[data-nav="${page}"]`);
        if (link) link.classList.add('active');
    }

    const wrap = document.getElementById('nav-dock-wrap');
    if (!wrap) return;

    // On inner pages (not the homepage), never hide the dock —
    // it's the primary navigation and should always be reachable
    const isHomepage = document.body.dataset.page === 'home' ||
                       !document.body.dataset.page;

    if (!isHomepage) return;

    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const goingDown = y > lastY && y > 200;
        wrap.classList.toggle('hidden', goingDown);
        lastY = y;
    }, { passive: true });
}

// ===== Bento mouse-follow glow =====
function initBentoGlow() {
    const bento = document.getElementById('bento');
    if (!bento) return;

    const cards = bento.getElementsByClassName('card');

    bento.addEventListener('mousemove', (e) => {
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
    });
}

// ===== Smooth in-page scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href').slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', `#${id}`);
        });
    });
}

// ===== Duplicate marquee tracks for seamless loop =====
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.marquee, .cert-marquee').forEach((wrap) => {
        const track = wrap.querySelector('.marquee-track, .cert-track');
        if (!track) return;
        const clone = track.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        wrap.appendChild(clone);
    });
});
