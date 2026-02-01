// Шапка сайта
(function() {
    const header = document.getElementById('header');
    const burger = document.querySelector('.header__burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');
    const headerLinks = document.querySelectorAll('.header__link');
    
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    function toggleMobileMenu() {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        const isExpanded = burger.classList.contains('active');
        burger.setAttribute('aria-expanded', isExpanded);
        
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    function closeMobileMenu() {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                headerLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', () => {
        handleScroll();
        updateActiveLink();
    });
    
    burger.addEventListener('click', toggleMobileMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !burger.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    handleScroll();
    updateActiveLink();
})();


// Анимации при появлении элементов на экране + счетчики в hero
(function() {
    const animatedElements = document.querySelectorAll(`
        .service-card,
        .review-card,
        .gallery__item,
        .contact-item,
        .about__feature
    `);
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                observer.unobserve(entry.target);
            }
        });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
    
    const statsNumbers = document.querySelectorAll('.hero__stat-number');
    let hasAnimated = false;
    
    const animateNumbers = () => {
        if (hasAnimated) return;
        
        statsNumbers.forEach(stat => {
            const target = stat.textContent;
            const isPlus = target.includes('+');
            const isPercent = target.includes('%');
            const numericValue = parseInt(target.replace(/\D/g, ''));
            
            if (isNaN(numericValue)) return;
            
            const duration = 2000;
            const steps = 60;
            const increment = numericValue / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                
                let displayValue = Math.floor(current).toString();
                if (isPlus) displayValue += '+';
                if (isPercent) displayValue += '%';
                
                stat.textContent = displayValue;
            }, duration / steps);
        });
        
        hasAnimated = true;
    };

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumbers();
                }
            });
        }, { threshold: 0.3 });
        
        heroObserver.observe(heroSection);
    }

    const cards = document.querySelectorAll('.service-card, .review-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
})();

// Слайдер «до/после» для галереи
(function() {
    const galleryItems = document.querySelectorAll('.gallery__comparison');
    
    galleryItems.forEach(item => {
        const slider = item.querySelector('.gallery__slider');
        const afterImage = item.querySelector('.gallery__image--after');
        
        if (!slider || !afterImage) return;
        
        let isActive = false;
        
        function updateSlider(x) {
            const rect = item.getBoundingClientRect();
            const position = ((x - rect.left) / rect.width) * 100;
            
            const clampedPosition = Math.max(0, Math.min(100, position));
            
            slider.style.left = clampedPosition + '%';
            
            afterImage.style.clipPath = `inset(0 0 0 ${clampedPosition}%)`;
        }
        
        function startDrag(e) {
            isActive = true;
            item.style.cursor = 'ew-resize';
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            updateSlider(clientX);
        }
        
        function drag(e) {
            if (!isActive) return;
            
            e.preventDefault();
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            updateSlider(clientX);
        }
        
        function stopDrag() {
            isActive = false;
            item.style.cursor = 'ew-resize';
        }
        
        slider.addEventListener('mousedown', startDrag);
        item.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        slider.addEventListener('touchstart', startDrag, { passive: true });
        item.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', stopDrag);
        
        item.addEventListener('click', (e) => {
            if (e.target === slider || slider.contains(e.target)) return;
            updateSlider(e.clientX);
        });

        const rect = item.getBoundingClientRect();
        updateSlider(rect.left + rect.width / 2);
    });
    
    const galleryItemsForModal = document.querySelectorAll('.gallery__item');
    
    galleryItemsForModal.forEach((item, index) => {
        item.style.cursor = 'pointer';
        
        item.addEventListener('click', (e) => {
            if (e.target.closest('.gallery__slider')) return;

            console.log('Открыть изображение', index);
        });
    });
})();

// Раскрытие скрытых элементов галереи
(function () {
    const items = document.querySelectorAll('.gallery__item');
    const button = document.getElementById('showMoreGallery');
    const visibleCount = 6;
    let isExpanded = false;

    if (!button || items.length <= visibleCount) return;

    items.forEach((item, index) => {
        if (index >= visibleCount) {
            item.classList.add('is-hidden');
        }
    });

    button.addEventListener('click', () => {
        isExpanded = !isExpanded;

        items.forEach((item, index) => {
            if (index >= visibleCount) {
                if (isExpanded) {
                    item.classList.remove('is-hidden');
                } else {
                    item.classList.add('is-hidden');
                }
            }
        });

        button.textContent = isExpanded ? 'Свернуть' : 'Показать ещё';
    });
})();

// Карусель отзывов
(function() {
    const carousel = document.querySelector('.reviews__carousel');
    if (!carousel) return;
    
    const track = document.querySelector('.reviews__grid');
    const slides = document.querySelectorAll('.review-card');
    const prevBtn = document.querySelector('.reviews__arrow--prev');
    const nextBtn = document.querySelector('.reviews__arrow--next');

    if (!track || !slides.length || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let slidesToShow = 3;

    function getSlidesToShow() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 968) return 2;
        return 3;
    }

    function getSlideWidth() {
        const slide = slides[0];
        const style = window.getComputedStyle(slide);
        const gap = parseInt(window.getComputedStyle(track).gap) || 0;
        return slide.offsetWidth + gap;
    }

    function updateButtons() {
        slidesToShow = getSlidesToShow();
        const maxIndex = Math.max(0, slides.length - slidesToShow);

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }

    function updateCarousel() {
        const slideWidth = getSlideWidth();
        const offset = currentIndex * slideWidth;
        track.style.transform = `translateX(-${offset}px)`;
        updateButtons();
    }

    function nextSlide() {
        slidesToShow = getSlidesToShow();
        const maxIndex = Math.max(0, slides.length - slidesToShow);
        
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slidesToShow = getSlidesToShow();
            const maxIndex = Math.max(0, slides.length - slidesToShow);
            
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            
            updateCarousel();
        }, 250);
    });
    
    const readMoreButtons = document.querySelectorAll('.review-card__readmore');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.review-card');
            const text = card.querySelector('.review-card__text');
            
            if (text.classList.contains('expanded')) {
                text.classList.remove('expanded');
                this.textContent = 'Читать далее';
            } else {
                text.classList.add('expanded');
                this.textContent = 'Свернуть';
            }
        });
    });
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
    
    updateCarousel();
})();