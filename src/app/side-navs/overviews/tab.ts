import { DockableTabs } from '@youwol/fv-tabs'
import { attr$ } from '@youwol/flux-view'
import { AppState } from '../../app.state'

/**
 * @category View
 */
export class Tab extends DockableTabs.Tab {
    constructor({ state }: { state: AppState }) {
        super({
            id: 'Overviews',
            title: 'Overviews',
            icon: '',
            content: () => {
                return {
                    class: 'p-2 fv-pointer',
                    style: {
                        width: '300px',
                    },
                    children: [
                        {
                            class: attr$(
                                state.selectedItem$,
                                (item): string => {
                                    return item.type == 'Overview.Dashboard'
                                        ? 'fv-text-focus'
                                        : ''
                                },
                                {
                                    wrapper: (d) =>
                                        `${d} d-flex align-items-center`,
                                },
                            ),
                            children: [
                                {
                                    class: 'fas fa-th-large fv-pointer',
                                },
                                { class: 'mx-2' },
                                {
                                    innerText: 'Dashboard',
                                },
                            ],
                            onclick: () => {
                                state.selectDashboard()
                            },
                        },
                    ],
                }
            },
        })
    }
}
