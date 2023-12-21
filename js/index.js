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
        },

        videoAnimation: function(video) {
            let src = video.currentSrc || video.src;
            console.log(video, src);

            /* Make sure the video is 'activated' on iOS */
            function once(el, event, fn, opts) {
            var onceFn = function (e) {
                el.removeEventListener(event, onceFn);
                fn.apply(this, arguments);
            };
            el.addEventListener(event, onceFn, opts);
            return onceFn;
            }

            once(document.documentElement, "touchstart", function (e) {
            video.play();
            video.pause();
            });

            /* ---------------------------------- */
            /* Scroll Control! */

            gsap.registerPlugin(ScrollTrigger);

            let tl = gsap.timeline({
            defaults: { duration: 1 },
            scrollTrigger: {
                trigger: "#container",
                start: "top top",
                end: "bottom bottom",
                scrub: true
            }
            });

            once(video, "loadedmetadata", () => {
            tl.fromTo(
                video,
                {
                currentTime: 0
                },
                {
                currentTime: video.duration || 1
                }
            );
            });

            /* When first coded, the Blobbing was important to ensure the browser wasn't dropping previously played segments, but it doesn't seem to be a problem now. Possibly based on memory availability? */
            setTimeout(function () {
            if (window["fetch"]) {
                fetch(src)
                .then((response) => response.blob())
                .then((response) => {
                    var blobURL = URL.createObjectURL(response);

                    var t = video.currentTime;
                    once(document.documentElement, "touchstart", function (e) {
                    video.play();
                    video.pause();
                    });

                    video.setAttribute("src", blobURL);
                    video.currentTime = t + 0.01;
                });
            }
            }, 1000);
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
            const wrap = document.querySelector('.animation-container');
            const videosWrap = document.querySelector('.animation-container__videos');
            const videos = document.querySelectorAll('.animation-container__videos video');
            const textsWrap = document.querySelector(".animation-container__text");
            const texts = document.querySelectorAll('.text-section');

            const timings = {
                begin: videos[0],
                loop: videos[1],
                fast: videos[2],
                end: videos[3]
            };

            gsap.registerPlugin(ScrollTrigger);

            function setAnimation() {
                texts.forEach((item, index) => {
                    const body = item.querySelector('.text-section__body');
                    const list = item.querySelectorAll('.text-section__list li');
                    gsap.to(item, {
                        translateY: 400,
                        translateX: 0,
                        opacity: 1,
                        duration: 3,
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 70%',
                            end: '80% 50%',
                            scrub: true,
                            onToggle: (self) => {
                                if (self.isActive) {
                                    timings.loop.classList.add('hide');
                                    timings.loop.classList.remove('show');

                                    timings.fast.classList.add('show');
                                    timings.fast.play();

                                    if (index !== texts.length - 1) {
                                        gsap.to(body, {
                                            translateY: "-488px",
                                            duration: 1,
                                            scrollTrigger: {
                                                trigger: item,
                                                start: 'top 70%',
                                                end: '80% 50%',
                                                scrub: true,
                                            }
                                        });
                                    }

                                    if (list.length) {
                                        list.forEach(listItem => {
                                            gsap.to(listItem,
                                                {
                                                    translateX: "0",
                                                    duration: 6,
                                                    scrollTrigger: {
                                                        trigger: item,
                                                        start: 'top 80%',
                                                        end: 'bottom 80%',
                                                        scrub: true,
                                                }
                                            });
                                        });
                                    }

                                    timings.fast.addEventListener('ended', function () {
                                        this.classList.add('hide');
                                        this.classList.remove('show');

                                        timings.loop.classList.remove("hide");
                                        timings.loop.classList.add("show");
                                        timings.loop.play();
                                    });
                                }
                            }
                        },
                    });
                });
            }

            gsap.to(videosWrap, {
                scrollTrigger: {
                    trigger: videosWrap,
                    start: "start start",
                    end: "bottom bottom",
                    pin: true,
                    scrub: 1,
                    onToggle: (self) => {
                        if (self.isActive) {
                            timings.begin.play();

                            timings.begin.addEventListener("ended", function () {
                                this.pause();
                                this.currentTime = 0;
                                this.classList.add('hide');

                                timings.loop.classList.add("show");
                                timings.loop.play();

                                timings.loop.addEventListener("play", function () {
                                    gsap.to(videosWrap, {
                                        x: "-500",
                                        duration: 1
                                    });

                                    setAnimation();
                                });
                            });
                        }
                    }
                }
            });
        }

        // gsapAnimation: function() {
        //     const wrap = document.querySelector('.animation-container');
        //     const textsContainer = document.querySelector('.animation-container__text');
        //     const videosContainer = document.querySelector('.animation-container__videos');
        //     const texts = document.querySelectorAll('.text-section');
        //     const videos = document.querySelectorAll('.animation-container__videos video');

        //     const timings = {
        //         begin: 0,
        //         loop: 1,
        //         fast: 2,
        //         end: 3
        //     };

        //     gsap.registerPlugin(ScrollTrigger);

        //     const animateShowBlock = (bl, duration) => {
        //         bl.classList.add('active');
                
        //         gsap.fromTo(bl, 
        //             {
        //                 opacity: 0,
        //                 y: -50
        //             },
        //             {
        //                 opacity: 1,
        //                 y: 0,
        //                 duration
        //             }
        //         );
        //     };

        //     const animateHideBlock = (bl, duration) => {
        //         bl.classList.remove('active');
        //         gsap.to(bl, 
        //             {
        //                 opacity: 0,
        //                 y: -50,
        //                 duration
        //             }
        //         );
        //     };

        //     if (videos.length && texts.length) {
        //         let textsCounter = 0;

        //         const handleChangeScene = () => {
        //             videos[timings.loop].classList.add('hide');

        //             if (textsCounter < texts.length - 1) {
        //                 videos[timings.fast].classList.remove("hide");
        //                 videos[timings.fast].classList.add("show");
        //                 videos[timings.fast].play();

        //                 animateHideBlock(texts[textsCounter], 2);

        //                 videos[timings.fast].addEventListener('ended', function() {
        //                     if (texts[textsCounter-1]) texts[textsCounter-1].classList.add('hide');
        //                     else texts[textsCounter].classList.add('hide');

        //                     animateShowBlock(texts[textsCounter], 1);

        //                     this.classList.add('hide');
        //                     this.classList.remove('show');
        //                     videos[timings.loop].classList.remove('hide');
        //                     videos[timings.loop].classList.add('show');
        //                     videos[timings.loop].play();
        //                 });
        //             } else {
        //                 textsContainer.remove();
        //                 gsap.to(videosContainer, {
        //                     x: 0,
        //                     y: 0,
        //                     duration: 1
        //                 });

        //                 videos[timings.loop].removeAttribute('loop');
        //                 videos[timings.loop].classList.remove('hide');
        //                 videos[timings.loop].classList.add('show');

        //                 videos[timings.loop].addEventListener('ended', function() {
        //                     videos[timings.loop].classList.add('hide');
        //                     videos[timings.loop].classList.remove('show');
        //                     videos[timings.end].classList.add('show');
        //                     videos[timings.end].play();
        //                 });

        //                 videos[timings.end].addEventListener('ended', function() {
        //                     gsap.to(wrap, {
        //                         height: 0,
        //                         overfloe: "hidden",
        //                         duration:.3,
        //                         immediateRender: false,
        //                         ease:"expo.inOut",
        //                     });
        //                 });
        //             }

        //             ++textsCounter;
        //         };

        //         videos[timings.begin].addEventListener('ended', function() {
        //             gsap.to(videosContainer, {
        //                 x: -500,
        //                 y: 0,
        //                 duration: 1
        //             });

        //             videos[timings.begin].classList.add('hide');
        //             videos[timings.loop].classList.add('show');
        //             videos[timings.loop].play();
        //         });

        //         videos[timings.loop].addEventListener('play', function() {
        //             if (textsCounter < texts.length - 1) {
        //                 animateShowBlock(texts[textsCounter], 1);
        //             }
        //         });

        //         document.addEventListener('click', function(event) {
        //             if (event.target.closest('.text-section')) {
        //                 handleChangeScene();
        //             }
        //         });
        //     }
        // }
    };

    const browserScrollWidth = window.innerWidth - document.body.offsetWidth; 
        
    document.documentElement.style.setProperty('--scrollWidth', `${browserScrollWidth}px`);

    myObj.init();
    
}());


