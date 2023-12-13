

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
        
        removeActiveClasses(items, className = 'active') {
            if (items.length) {
                items.forEach(item => item.classList.remove(className));
            }
        },
        
        slice(elements, start, end) {
            let sliced = Array.prototype.slice.call(elements, start, end);
            return sliced;
        },
        
        getHighestElement(arr) {
            let max = 0; 
            
            for (let i = 0; i < arr.length; i++) {
                if (max < arr[i].scrollHeight) {
                    max = arr[i].scrollHeight;
                }
            }
            
            return max;
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
        
        headerPanel: function() {
        
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
        }
    };

    const browserScrollWidth = window.innerWidth - document.body.offsetWidth; 
        
    document.body.style.setProperty('--scrollWidth', `${browserScrollWidth}px`);

    myObj.init();
    
}());


