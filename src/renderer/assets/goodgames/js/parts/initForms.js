import { $ } from './_utility';

/*------------------------------------------------------------------

  Init AJAX Forms

-------------------------------------------------------------------*/
function initForms() {
    if (typeof $.validator === 'undefined') {
        return;
    }
    const self = this;

    // Validate Khaki Forms
    $('form:not(.nk-form-ajax):not(.nk-mchimp):not([novalidate])').each(function () {
        $(this).validate({
            errorClass: 'nk-error',
            errorElement: 'div',
            errorPlacement(error, element) {
                const $parent = element.parent('.input-group');
                if ($parent.length) {
                    $parent.after(error);
                } else {
                    element.after(error);
                }
                self.debounceResize();
            },
        });
    });
    // ajax form
    $('form.nk-form-ajax:not([novalidate])').each(function () {
        $(this).validate({
            errorClass: 'nk-error',
            errorElement: 'div',
            errorPlacement(error, element) {
                const $parent = element.parent('.input-group');
                if ($parent.length) {
                    $parent.after(error);
                } else {
                    element.after(error);
                }
                self.debounceResize();
            },
            // Submit the form via ajax (see: jQuery Form plugin)
            submitHandler(form) {
                const $responseSuccess = $(form).find('.nk-form-response-success');
                const $responseError = $(form).find('.nk-form-response-error');
                const $form = $(form);

                $.ajax({
                    type: 'POST',
                    url: $form.attr('action'),
                    data: $form.serialize(),
                    success(response) {
                        response = JSON.parse(response);
                        if (response.type && response.type === 'success') {
                            $responseError.hide();
                            $responseSuccess.html(response.response).show();
                            form.reset();
                        } else {
                            $responseSuccess.hide();
                            $responseError.html(response.response).show();
                        }
                        self.debounceResize();
                    },
                    error(response) {
                        $responseSuccess.hide();
                        $responseError.html(response.responseText).show();
                        self.debounceResize();
                    },
                });
            },
        });
    });
}

export { initForms };
