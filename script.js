// Header functionality
(function() {
    const header = document.getElementById('header');
    const burger = document.querySelector('.header__burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');
    const headerLinks = document.querySelectorAll('.header__link');
    
    // Scroll effect for header
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Update aria-expanded
        const isExpanded = burger.classList.contains('active');
        burger.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scroll when menu is open
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    // Close mobile menu
    function closeMobileMenu() {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    // Active link highlighting
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
    
    // Event listeners
    window.addEventListener('scroll', () => {
        handleScroll();
        updateActiveLink();
    });
    
    burger.addEventListener('click', toggleMobileMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu on click outside
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !burger.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Initial call
    handleScroll();
    updateActiveLink();
})();


// Scroll animations with Intersection Observer
(function() {
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(`
        .service-card,
        .review-card,
        .gallery__item,
        .contact-item,
        .about__feature
    `);
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // If reduced motion is preferred, don't animate
        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }
    
    // Set initial state
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Intersection Observer options
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Callback function
    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add delay for staggered animation
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    };
    
    // Create observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe elements
    animatedElements.forEach(el => observer.observe(el));
    
    // Stats counter animation
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
            
            const duration = 2000; // 2 seconds
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
    
    // Observe hero section for stats animation
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
    
    // Add hover effect enhancement for cards
    const cards = document.querySelectorAll('.service-card, .review-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
})();



// Gallery before/after slider
(function() {
    const galleryItems = document.querySelectorAll('.gallery__comparison');
    
    galleryItems.forEach(item => {
        const slider = item.querySelector('.gallery__slider');
        const afterImage = item.querySelector('.gallery__image--after');
        
        if (!slider || !afterImage) return;
        
        let isActive = false;
        
        // Функция обновления позиции слайдера
        function updateSlider(x) {
            const rect = item.getBoundingClientRect();
            const position = ((x - rect.left) / rect.width) * 100;
            
            // Ограничиваем от 0 до 100
            const clampedPosition = Math.max(0, Math.min(100, position));
            
            // Обновляем позицию слайдера
            slider.style.left = clampedPosition + '%';
            
            // Обновляем clip-path для изображения "после"
            afterImage.style.clipPath = `inset(0 0 0 ${clampedPosition}%)`;
        }
        
        // Начало перетаскивания
        function startDrag(e) {
            isActive = true;
            item.style.cursor = 'ew-resize';
            
            // Обрабатываем как мышь, так и тач
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            updateSlider(clientX);
        }
        
        // Перетаскивание
        function drag(e) {
            if (!isActive) return;
            
            e.preventDefault();
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            updateSlider(clientX);
        }
        
        // Конец перетаскивания
        function stopDrag() {
            isActive = false;
            item.style.cursor = 'ew-resize';
        }
        
        // События мыши
        slider.addEventListener('mousedown', startDrag);
        item.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        // События тач
        slider.addEventListener('touchstart', startDrag, { passive: true });
        item.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', stopDrag);
        
        // Клик по контейнеру для перемещения слайдера
        item.addEventListener('click', (e) => {
            if (e.target === slider || slider.contains(e.target)) return;
            updateSlider(e.clientX);
        });

        // Начальное состояние
        const rect = item.getBoundingClientRect();
        updateSlider(rect.left + rect.width / 2);
    });
    
    // Полноэкранный просмотр (опционально)
    const galleryItemsForModal = document.querySelectorAll('.gallery__item');
    
    galleryItemsForModal.forEach((item, index) => {
        item.style.cursor = 'pointer';
        
        item.addEventListener('click', (e) => {
            // Проверяем, что клик не на слайдере
            if (e.target.closest('.gallery__slider')) return;
            
            // Здесь можно добавить модальное окно для полноэкранного просмотра
            // Пока просто логируем
            console.log('Открыть изображение', index);
        });
    });
})();


(function () {
    const items = document.querySelectorAll('.gallery__item');
    const button = document.getElementById('showMoreGallery');
    const visibleCount = 6;
    let isExpanded = false; // состояние: раскрыто или свернуто

    if (!button || items.length <= visibleCount) return;

    // Скрываем все, кроме первых 6
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
                    item.classList.remove('is-hidden'); // показываем
                } else {
                    item.classList.add('is-hidden');    // скрываем
                }
            }
        });

        // Меняем текст кнопки
        button.textContent = isExpanded ? 'Свернуть' : 'Показать ещё';
    });
})();





// Reviews carousel
(function() {
    const carousel = document.querySelector('.reviews__carousel');
    if (!carousel) return;
    
    const track = document.querySelector('.reviews__grid');
    const slides = document.querySelectorAll('.review-card');
    const prevBtn = document.querySelector('.reviews__arrow--prev');
    const nextBtn = document.querySelector('.reviews__arrow--next');

    if (!track || !slides.length || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let slidesToShow = 3; // По умолчанию показываем 3 карточки
    
    // Определяем количество видимых слайдов в зависимости от ширины экрана
    function getSlidesToShow() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 968) return 2;
        return 3;
    }
    
    // Получаем ширину одного слайда с учетом gap
    function getSlideWidth() {
        const slide = slides[0];
        const style = window.getComputedStyle(slide);
        const gap = parseInt(window.getComputedStyle(track).gap) || 0;
        return slide.offsetWidth + gap;
    }
    
    // Обновляем состояние кнопок
    function updateButtons() {
        slidesToShow = getSlidesToShow();
        const maxIndex = Math.max(0, slides.length - slidesToShow);
        
        // Отключаем кнопки при достижении границ
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    // Обновляем позицию карусели
    function updateCarousel() {
        const slideWidth = getSlideWidth();
        const offset = currentIndex * slideWidth;
        track.style.transform = `translateX(-${offset}px)`;
        updateButtons();
    }
    
    // Следующий слайд
    function nextSlide() {
        slidesToShow = getSlidesToShow();
        const maxIndex = Math.max(0, slides.length - slidesToShow);
        
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    }
    
    // Предыдущий слайд
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }
    
    // События кнопок
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Обработка изменения размера окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slidesToShow = getSlidesToShow();
            const maxIndex = Math.max(0, slides.length - slidesToShow);
            
            // Если текущий индекс выходит за пределы, корректируем
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            
            updateCarousel();
        }, 250);
    });
    
    // Функция "Читать далее"
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
    
    // Свайп на мобильных устройствах
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
                // Свайп влево - следующий слайд
                nextSlide();
            } else {
                // Свайп вправо - предыдущий слайд
                prevSlide();
            }
        }
    }
    
    // Инициализация
    updateCarousel();
})();