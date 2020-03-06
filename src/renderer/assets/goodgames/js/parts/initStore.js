import { $, $doc } from './_utility';

/*------------------------------------------------------------------

  Init Store

-------------------------------------------------------------------*/
function initStore() {
    const self = this;

    // scroll to ratings
    $doc.on('click', 'a.nk-product-rating', function (e) {
        const isHash = this.hash;
        if (isHash) {
            const $hashBlock = $(isHash).parents('.nk-tabs:eq(0)');
            if ($hashBlock.length) {
                self.scrollTo($hashBlock);
            }
            $('.nk-tabs').find(`[data-toggle="tab"][href="${isHash}"]`).click();
        }
        e.preventDefault();
    });
}

export { initStore };
