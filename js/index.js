(function () {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(navigator.userAgent);
    const myObj = {
        queue: [],
        init: function () {
            let queue = this.queue;
    
            for (let key in queue) {
                let f = queue[key];
                if (typeof f == 'function') {
                    f();
                }
            }
        }
    };

    const helpers = {
        findAncestor(el, cls) {
            while ((el = el.parentElement) && !el.classList.contains(cls));
            return el;
        },

        clickOutside(selector, activeClass) {
            if (!selector && !activeClass) return;

            document.addEventListener('click', e => {
                if (!e.target.closest(selector)) {
                    const $node = document.querySelector(selector);
                    $node.classList.remove(`${activeClass}`);
                }
            });
        }
    };
    
    
    myObj.queue = {
        imagesLazyLoad: function() {
            let lazyloadImages;    

            if ("IntersectionObserver" in window) {
                lazyloadImages = document.querySelectorAll(".lazy");
                const imageObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            let image = entry.target;
                            image.src = image.dataset.src;
                            image.classList.remove("lazy");
                            imageObserver.unobserve(image);
                        }
                    });
                });

                lazyloadImages.forEach(function(image) {
                    imageObserver.observe(image);
                });
            } else {  
                let lazyloadThrottleTimeout;
                lazyloadImages = document.querySelectorAll(".lazy");

                function lazyload () {
                    if(lazyloadThrottleTimeout) {
                        clearTimeout(lazyloadThrottleTimeout);
                    }    

                    lazyloadThrottleTimeout = setTimeout(function() {
                        const scrollTop = window.scrollY;

                        lazyloadImages.forEach(function(img) {
                            if(img.offsetTop < (window.innerHeight + scrollTop)) {
                                img.src = img.dataset.src;
                                img.classList.remove('lazy');
                            }
                        });
                        if(lazyloadImages.length == 0) { 
                            document.removeEventListener("scroll", lazyload);
                            window.removeEventListener("resize", lazyload);
                            window.removeEventListener("orientationChange", lazyload);
                        }
                    }, 20);
                }

                document.addEventListener("scroll", lazyload);
                window.addEventListener("resize", lazyload);
                window.addEventListener("orientationChange", lazyload);
            }
        },  
        
        headerPanel: function() {
            const headerSelector = ".header";
            const sidePanelSelector = ".sidepanel";
            const menu = document.querySelector(`${headerSelector}__list`);
            const sidePanelLeft = document.querySelector(`${sidePanelSelector}__left`);

            if (sidePanelLeft) {
                sidePanelLeft.innerHTML = `
                    <nav class="${sidePanelSelector.replace('.', '')}__navigation">
                        <ul class="${sidePanelSelector.replace('.', '')}__list">
                            ${menu.innerHTML}                        
                        </ul>
                    </nav>
                `;
            }
        },

        sidePanel: function() {
            const headerSelector = ".header";
            const activeClass = "active";
            const sidePanel = document.querySelector('.sidepanel');
            const burger = document.querySelector(`${headerSelector}__burger`);

            const handleClick = e => {
                const parent = helpers.findAncestor(e.target, headerSelector.replace('.', ''));
                
                sidePanel.classList.toggle(activeClass);
                parent.classList.toggle(activeClass);
                document.documentElement.classList.toggle('locked');
            };

            if (burger) burger.addEventListener('click', handleClick);
        },

        marquee: function() {
            const slideTop = '.abilities__marquee-top';
            const slideBot = '.abilities__marquee-bot';

            if (document.querySelector(slideTop) || document.querySelector(slideBot)) {
                const options = { direction: "rtl", speed: 0.09 };

                new Marquee(slideTop, options);   
                new Marquee(slideBot, {...options, direction: "ltr"});
            }
        },

        masonry: function() {
            const elem = document.querySelector('.team__list');
            const msnry = new Masonry( elem, {
                itemSelector: '.team__item',
                fitWidth: true
            });

            if (isMobile && window.matchMedia("all and (max-width: 480px)").matches) {
                msnry.destroy();
            }
        },

        langSwitcher: function() {
            const parent = ".lang-switcher-js";
            const selector = ".lang-switcher-js__active";
            const activeClass = "opened";
            const $btn = document.querySelector(selector);

            if (!$btn) return;

            const handleClick = (e) => e.target.parentElement.classList.toggle(activeClass);

            helpers.clickOutside(parent, activeClass);
            $btn.addEventListener('click', handleClick);
        },

        teamBlock: function() {
            const selector = "team__item";
            const activeClass = "active";

            const handleClick = e => {
                if (e.target.closest(`.${selector}`)) {
                    if (!e.target.classList.contains(selector)) {
                        const parent = helpers.findAncestor(e.target, selector);

                        parent.classList.toggle(activeClass);
                    } else {
                        e.target.classList.toggle(activeClass);
                    }
                }
            }

            document.addEventListener('click', handleClick);
            
        },

        upBtn: function() {
            const $btn = document.querySelector('.up-btn-js');
            
            if (!$btn) return;

            const handleClick = () => window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            $btn.addEventListener('click', handleClick);
        },

        gsapAnimation: function() {
            const videos = document.querySelectorAll(".animation-container__videos video");

            if (videos.length) {
                videos.forEach((video, index) => {
                    const handleVideoEnd = () => {
                        if (index !== videos.length-1) {
                            video.remove()
                        } else video.play();
                        if (video[index+1]) video[index+1].play();
                    };

                    video.addEventListener('ended', handleVideoEnd);
                });
            }
        }
    };

    const browserScrollWidth = window.innerWidth - document.body.offsetWidth; 
        
    document.documentElement.style.setProperty('--scrollWidth', `${browserScrollWidth}px`);

    myObj.init();
    
}());


