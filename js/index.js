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

        animationBlock: function () {
            const wrapper = document.querySelector(".app");
            const root = document.querySelector('.animation-container');
            const videosContainer = document.querySelector(".animation-container__videos");
            const videos = document.querySelectorAll('.animation-container__videos video');
            const texts = document.querySelectorAll('.animation-container__text-in .text-section');

            const clear = () => {
                wrapper.classList.remove("anim");
                helpers.marquee();
                window.dispatchEvent(new Event('resize'));
            };

            if (!videosContainer && !videos.length && !texts.length) {
                clear();
                return;
            }

            let textsCounter = 0;

            const timings = {
                begin: videos[0],
                loop: videos[1],
                fast: videos[2],
                end: videos[3]
            };

            const textsShowAnim = (target) => {
                if (!target) return;
                const listItems = target.querySelectorAll('.text-section__list li');

                if (listItems.length) {
                    listItems.forEach((item, index) => {
                        gsap.to(item,
                            {
                                translateX: 0,
                                duration: (index+2)/10+1
                            }
                        );
                    });
                }

                gsap.fromTo(target,
                    {
                        opacity: 0,
                        y: 50,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 2.5
                    }
                );
            };

            const textHideAnim = (target) => {
                gsap.to(target, {
                    opacity: 0,
                    y: 50,
                    duration: 1
                });
            };

            const showVideo = (video) => {
                video.classList.remove("hide");
                video.classList.add("show");
                video.play();
            }
            const hideVideo = (video) => {
                video.classList.remove("show");
                video.classList.add("hide");
                video.pause();
                video.currentTime = 0;
            }
            const handleWheelDown = (e) => {
                if (e.deltaY > 0) {
                    if (textsCounter < texts.length) {
                        hideVideo(timings.loop);
                        showVideo(timings.fast);
                    } else {
                        gsap.to(videosContainer, {
                            x: 0,
                            duration: 1,
                            oncomplete() {
                                hideVideo(timings.loop);
                                showVideo(timings.end);

                                textHideAnim(texts[texts.length - 1]);
                                texts[texts.length - 1].style.display = "none";

                                timings.end.addEventListener("ended", function () {
                                    gsap.to(root, {
                                        minHeight: 0,
                                        height: 0,
                                        duration: 0.5,
                                        oncomplete() {
                                            clear();
                                            window.removeEventListener("wheel", handleWheelDown);
                                        }
                                    });
                                });
                            }
                        });
                    }

                    return;
                }
            };

            timings.fast.addEventListener("ended", function () {
                showVideo(timings.loop);
                hideVideo(this);

                if (textsCounter < texts.length) {
                    textHideAnim(texts[textsCounter - 1]);
                    textsShowAnim(texts[textsCounter]);
                }

                ++textsCounter;
            });

            timings.begin.addEventListener("play", function () {
                gsap.from(videosContainer, {
                    y: 500,
                    x: 0,
                    duration: 2
                });
            });

            timings.begin.addEventListener("ended", function () {
                this.classList.add('hide');
                showVideo(timings.loop);

                gsap.to(videosContainer, {
                    y: 0,
                    x: -500,
                    duration: 1,
                    oncomplete: function () {
                        textsShowAnim(texts[textsCounter]);
                        root.addEventListener("wheel", handleWheelDown);
                        ++textsCounter;
                    }
                });
            });

            if (window.scrollY >= root.offsetTop && textsCounter === 0) {
                timings.begin.play();
            }

            const handleWindowScroll = () => {
                if (window.scrollY >= (root.offsetTop - 500) && textsCounter === 0) {
                    timings.begin.play();
                }
            };

            window.addEventListener("scroll", handleWindowScroll);

        },

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


