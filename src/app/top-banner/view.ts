import { TopBannerView as TopBannerBaseView } from '@youwol/os-top-banner'

/**
 * @category View
 */
export class View extends TopBannerBaseView {
    constructor() {
        super({
            innerView: {
                class: 'd-flex w-100 justify-content-center my-auto align-items-center',
                children: [
                    {
                        innerHTML:
                            '<i>"The wage of sin is debugging"</i> <b>Ron Jeffries</b>',
                    },
                ],
            },
        })
    }
}
