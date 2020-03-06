import { $, $body } from './_utility';

/* Bootstrap Backgrounds */
function initBackgrounds() {
    if (typeof MutationObserver === 'undefined') {
        return;
    }

    // fix page backgrounds right offset when body padding changed (for example when showed bootstrap modal).
    const $backgrounds = $('.nk-page-background-top, .nk-page-background-bottom, .nk-page-background-fixed');
    if ($backgrounds.length) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                const right = $('body').css('padding-right');
                if (right) {
                    $backgrounds.css('width', `calc(100% - ${right})`);
                } else {
                    $backgrounds.css('width', '');
                }
            });
        });

        observer.observe($body[0], { attributes: true, attributeFilter: ['style'] });
    }
}

export { initBackgrounds };
