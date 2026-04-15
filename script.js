// =========================================================
// 交互脚本 - Ivan Meng Portfolio
// =========================================================

// 导航栏滚动变化
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }, { passive: true });

    // 数字滚动动画 (Stats Counter)
    class Counter {
      constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.start = 0;
        this.startTime = null;
        this.isAnimating = false;
      }
      
      easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
      
      animate(timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = timestamp - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const eased = this.easeOutQuart(progress);
        
        const current = Math.floor(eased * (this.target - this.start) + this.start);
        this.element.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame((t) => this.animate(t));
        } else {
          this.element.textContent = this.target;
        }
      }
      
      start() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        requestAnimationFrame((t) => this.animate(t));
      }
    }

    const observerOptions = { threshold: 0.5, rootMargin: '0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.value);
          const counter = new Counter(entry.target, target, 2500);
          counter.start();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-counter]').forEach(el => { observer.observe(el); });