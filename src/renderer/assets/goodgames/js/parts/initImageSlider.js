import { $, $doc, tween } from './_utility';

/*------------------------------------------------------------------

 Init Image Slider

 -------------------------------------------------------------------*/
function initImageSlider() {
    const $sliders = $('.nk-image-slider');

    // transition animation
    function transitionStart(data, currentSlide, cb) {
        // set new bg
        data.$bgTransition.css({
            'background-image': `url('${currentSlide.image}')`,
        });
        tween.set(data.$bgTransition, {
            scale: 1.4,
            opacity: 0,
        });
        tween.to(data.$bgTransition, 0.5, {
            scale: 1,
            opacity: 1,
            zIndex: -1,
            onComplete() {
                // change default background image
                data.$bg.css({
                    'background-image': `url('${currentSlide.image}')`,
                });
                tween.set(data.$bgTransition, {
                    opacity: 0,
                    zIndex: -2,
                });
            },
        });

        // set new content
        tween.to(data.$contentWrapper, 0.5, {
            opacity: 0,
            onComplete() {
                data.$content.html(currentSlide.content);
                if (currentSlide.content) {
                    tween.to(data.$contentWrapper, 0.5, {
                        opacity: 1,
                    });
                }
                if (cb) {
                    cb();
                }
            },
        });
    }

    // select slide
    let busy = 0;
    function selectSlide($slider, slideNum = false) {
        if (busy) {
            return;
        }
        busy = 1;
        const data = $slider.data('nk-image-slider');

        // get next slide
        if (slideNum === false) {
            slideNum = data.$thumbs.find('.nk-image-slider-thumbs-active').index() + 1;
        }

        let currentSlide = data.slides[slideNum];

        // in there is no selected slide
        if (typeof currentSlide === 'undefined') {
            slideNum = 0;
            currentSlide = data.slides[slideNum];
        }

        // stop autoplay
        data.stopAutoplay();

        // select thumb
        data.selectThumb(slideNum);

        // start transition
        transitionStart(data, currentSlide, () => {
            // update nano
            if (typeof $.fn.nanoScroller !== 'undefined') {
                data.$content.parent('.nano').nanoScroller();
            }

            // run autoplay
            data.runAutoplay();
            busy = 0;
        });
    }

    // convert time for timer format from ms to ceil second
    function convertTime(time) {
        return Math.ceil(time / 1000);
    }

    // prepare each slider
    $sliders.each(function () {
        const $this = $(this);
        const autoplay = parseInt($this.attr('data-autoplay'), 10) || false;
        const slides = [];
        const defaultSlide = 0;

        // parse all slides
        $this.find('.nk-image-slider-item').each(function () {
            const $slide = $(this);
            slides.push({
                image: $slide.find('.nk-image-slider-img').attr('src'),
                thumb: $slide.find('.nk-image-slider-img').attr('data-thumb'),
                content: $slide.find('.nk-image-slider-content').html() || '',
            });
        });

        // no slides
        if (!slides.length) {
            $this.remove();
            return;
        }

        // prepare slider inner template
        let thumbs = '';
        slides.forEach((item, k) => {
            thumbs += `<li class="${k === defaultSlide ? 'nk-image-slider-thumbs-active' : ''}" style="background-image: url('${item.thumb}');"><div class="nk-image-slider-thumbs-overlay"></div></li>`;
        });
        const template = `
            <div class="nk-image-slider-bg" style="background-image: url('${slides[defaultSlide].image}');"></div>
            <div class="nk-image-slider-bg-transition"></div>
            <div class="nk-image-slider-content" style="${slides[defaultSlide].content ? '' : 'opacity: 0;'}">
                <div class="nano">
                    <div class="nano-content">${slides[defaultSlide].content}</div>
                </div>
            </div>
            <div class="nk-image-slider-thumbs">
                <ul>${thumbs}</ul>
            </div>
        `;

        // append template in slider
        $this.append(template);

        // move thumbs cont
        const $thumbs = $this.find('.nk-image-slider-thumbs');
        const $thumbsCont = $thumbs.find('> ul');
        let startX = false;
        let curX = 0;
        let thumbsW = 0;
        let thumbsContW = 0;

        function updateThumbsData() {
            if ($thumbsCont[0]._gsTransform && $thumbsCont[0]._gsTransform.x) {
                curX = $thumbsCont[0]._gsTransform.x;
            } else {
                curX = 0;
            }
            thumbsW = $thumbs.width();
            thumbsContW = $thumbsCont[0].scrollWidth;
        }

        // select current thumb and scroll
        function selectThumb(i) {
            $thumbs.find(`li:eq(${i})`).addClass('nk-image-slider-thumbs-active')
                .siblings().removeClass('nk-image-slider-thumbs-active');

            //
            let $nextItem = $thumbs.find(`li:eq(${i + 1})`);
            if (!$nextItem.length) {
                $nextItem = $thumbs.find(`li:eq(${0})`);
            }

            // scroll nav
            updateThumbsData();
            const nextLeft = $nextItem.position().left;
            if (nextLeft < 0) {
                tween.to($thumbsCont, 0.2, {
                    x: curX - nextLeft,
                });
            } else {
                const nextW = $nextItem.width();
                if (nextLeft + nextW > thumbsW) {
                    tween.to($thumbsCont, 0.2, {
                        x: curX - (nextLeft + nextW - thumbsW),
                    });
                }
            }
        }

        const mc = new Hammer.Manager($thumbs[0]);
        mc.add(new Hammer.Pan({
            pointers: 1,
            threshold: 0,
        }));
        mc.on('pan press', (e) => {
            e.preventDefault();

            // init
            if (startX === false) {
                startX = curX;
                updateThumbsData();
                $thumbs.addClass('is-dragging');
            }

            // move
            if (thumbsContW > thumbsW) {
                curX = Math.min(0, Math.max(e.deltaX + startX, thumbsW - thumbsContW));
                tween.set($thumbsCont, {
                    x: curX,
                });
            }
            if (e.isFinal) {
                $thumbs.removeClass('is-dragging');
                startX = false;
            }
        });

        // setup autoplay
        let autoplayInterval;
        let autoplayStart = new Date();
        let autoplayPaused;
        function stopAutoplay(dontTouchCount = 0) {
            if (!autoplay) {
                return;
            }
            clearInterval(autoplayInterval);
            if (!dontTouchCount) {
                $thumbs.find('.nk-image-slider-thumbs-count').remove();
            }
        }
        function runAutoplay() {
            if (!autoplay) {
                return;
            }
            const $currentThumb = $thumbs.find('.nk-image-slider-thumbs-active');
            let $nextThumb = $currentThumb.next();
            if (!$nextThumb.length) {
                $nextThumb = $thumbs.find('li:eq(0)');
            }

            // remove old timer
            $thumbs.find('.nk-image-slider-thumbs-count').remove();

            // add new timer
            const $timer = $('<div class="nk-image-slider-thumbs-count"></div>').text(convertTime(autoplay));
            $nextThumb.append($timer);

            autoplayStart = +new Date();

            stopAutoplay(1);
            let prevValue = autoplay;
            autoplayInterval = setInterval(() => {
                if (autoplayPaused) {
                    return;
                }
                let currentTime = autoplayStart + autoplay - new Date();

                // fix if counter > autoplay (occurs when you click on thumbnails)
                if (currentTime > autoplay) {
                    autoplayStart = +new Date();
                    currentTime = autoplay;
                }

                // update value on thumbnail when counter was changed
                if (prevValue !== convertTime(currentTime)) {
                    prevValue = convertTime(currentTime);
                    $timer.text(prevValue);
                }

                // stop autoplay and select next slide
                if (currentTime <= 0) {
                    stopAutoplay();
                    selectSlide($this);
                }
            }, 100);
        }
        function pauseAutoplay() {
            autoplayPaused = +new Date();
        }
        function resumeAutoplay() {
            autoplayStart += new Date() - autoplayPaused;
            autoplayPaused = false;
        }

        // save slider data
        const data = {
            slides,
            autoplay,
            $thumbs,
            $thumbsCont,
            $content: $this.find('.nk-image-slider-content .nano-content'),
            $contentWrapper: $this.find('.nk-image-slider-content'),
            $bg: $this.find('.nk-image-slider-bg'),
            $bgTransition: $this.find('.nk-image-slider-bg-transition'),
            runAutoplay,
            stopAutoplay,
            pauseAutoplay,
            resumeAutoplay,
            selectThumb,
        };
        $this.data('nk-image-slider', data);

        // start autoplay
        runAutoplay();
    });

    // click handler
    $doc.on('click', '.nk-image-slider .nk-image-slider-thumbs li:not(.nk-image-slider-thumbs-active)', function () {
        const $li = $(this);
        const $slider = $li.parents('.nk-image-slider:eq(0)');
        selectSlide($slider, $li.index());
    });

    // pause autoplay on mouseenter
    $doc.on('mouseenter', '.nk-image-slider', function () {
        const data = $(this).data('nk-image-slider');
        if (data) {
            data.pauseAutoplay();
        }
    });
    $doc.on('mouseleave', '.nk-image-slider', function () {
        const data = $(this).data('nk-image-slider');
        if (data) {
            data.resumeAutoplay();
        }
    });
}

export { initImageSlider };
