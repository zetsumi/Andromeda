import { $, $doc } from './_utility';

/* Bootstrap Modal */
function initPluginModal() {
    $doc.on('shown.bs.modal', function () {
        $(this).find('[autofocus]').focus();
    });
}

export { initPluginModal };
