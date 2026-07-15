(function () {
    function setHeaderHeightVar() {
        const header = document.querySelector('header');
        if (header) {
            document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
        }
    }
    setHeaderHeightVar();
    window.addEventListener('resize', setHeaderHeightVar);
})();

// Scroll-spy: highlights the active folder-tab in the nav
// as the corresponding section enters view.
(function () {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    function setActive(id) {
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.nav === id);
        });
    }

    function onScroll() {
        let currentId = sections[0].id;
        const scrollPos = window.pageYOffset + 200;

        sections.forEach((section) => {
            if (scrollPos >= section.offsetTop) {
                currentId = section.id;
            }
        });

        // The +200 look-ahead can never be satisfied for the last section
        // once the page has no more room to scroll into — so treat "at the
        // bottom of the page" as "the last section is active" explicitly.
        const atBottom = window.innerHeight + window.pageYOffset
            >= document.documentElement.scrollHeight - 2;
        if (atBottom) {
            currentId = sections[sections.length - 1].id;
        }

        setActive(currentId);
    }

    // Activate a tab the instant it's clicked, rather than waiting for the
    // smooth-scroll to finish and the scroll listener to catch up. A short
    // lock afterwards stops onScroll from overriding the choice mid-scroll.
    let lockTimer = null;
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            setActive(link.dataset.nav);
            window.clearTimeout(lockTimer);
            lockTimer = window.setTimeout(() => { lockTimer = null; }, 700);
        });
    });

    window.addEventListener('scroll', () => {
        if (lockTimer === null) onScroll();
    }, { passive: true });

    onScroll();
})();

// Build the email and phone links at runtime from obfuscated values,
// rather than printing the real address/number anywhere in the HTML
// source. This defeats simple scrapers that regex the page for
// email-shaped or phone-number-shaped text; it isn't bulletproof against
// a scraper that executes JS, but that's a much smaller class of bot.
// Real visitors still get working mailto:/tel: links.
(function () {
    const emailLink = document.getElementById('contact-email');
    if (emailLink && emailLink.dataset.enc) {
        // stored reversed; un-reverse to recover the real address
        const address = emailLink.dataset.enc.split('').reverse().join('');
        emailLink.href = `mailto:${address}`;
        emailLink.textContent = address;
    }

    const phoneLink = document.getElementById('contact-phone');
    if (phoneLink && phoneLink.dataset.enc) {
        // stored reversed with each digit shifted +5 (mod 10, self-inverse)
        const reversed = phoneLink.dataset.enc.split('').reverse().join('');
        const num = reversed.split('').map((d) => (parseInt(d, 10) + 5) % 10).join('');
        const cc = phoneLink.dataset.cc;
        phoneLink.href = `tel:+${cc}${num}`;
        phoneLink.textContent = `+${cc} ${num.slice(0, 3)} ${num.slice(3)}`;
    }
})();

// Play the lichen "growth" animation once, the first time its section
// scrolls into view — not on every scroll, so it reads as a one-time
// reveal rather than a looping distraction.
(function () {
    const mark = document.querySelector('.section-mark');
    if (!mark || !('IntersectionObserver' in window)) {
        if (mark) mark.classList.add('is-visible');
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                mark.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    observer.observe(mark);
})();