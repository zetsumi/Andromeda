import { $ } from './_utility';

/* Bootstrap Slider */
function initPluginSeiyriaBootstrapSlider() {
    if (typeof $.fn.bootstrapSlider === 'undefined') {
        return;
    }

    // set labels on slider change
    function setLabels($labels, values, force = false) {
        for (let k = 0; k < values.newValue.length; k++) {
            if (typeof $labels[k] !== 'undefined' && (force || values.newValue[k] !== values.oldValue[k])) {
                $labels[k].text(values.newValue[k]);
            }
        }
    }

    $('.nk-input-slider').each(function () {
        const $this = $(this);
        const $input = $this.find('input');
        const $labels = [];

        for (let k = 0; k < 3; k++) {
            $labels.push($this.find(`.nk-input-slider-value-${k}`));
        }

        $input.bootstrapSlider().on('change', (e) => {
            if (e.value && e.value.newValue) {
                setLabels($labels, e.value);
            }
        });

        // set default labels
        setLabels($labels, {
            newValue: $input.bootstrapSlider('getValue'),
        }, true);
    });
}

export { initPluginSeiyriaBootstrapSlider };
