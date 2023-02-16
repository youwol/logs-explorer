import { VirtualDOM, child$ } from '@youwol/flux-view'
import { AppState } from './app.state'
import { DockableTabs } from '@youwol/fv-tabs'
import { Contents, HttpModels, TopBanner } from '.'

/**
 * @category View
 * @Category Entry Point
 */
export class AppView implements VirtualDOM {
    /**
     * @group States
     */
    public readonly state: AppState

    /**
     * @group Immutable DOM Constants
     */
    public readonly class = 'fv-text-primary w-100 h-100 d-flex flex-column'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: { state: AppState }) {
        Object.assign(this, params)

        const leftSideNavView = new DockableTabs.View({
            state: this.state.leftSideNavState,
            styleOptions: {
                initialPanelSize: '300px',
            },
        })

        this.children = [
            new TopBanner.View(),
            {
                class: 'd-flex flex-grow-1',
                style: { minHeight: '0px' },
                children: [
                    {
                        class: 'h-100',
                        children: [leftSideNavView],
                    },
                    {
                        class: 'flex-grow-1',
                        style: {
                            minWidth: '0px',
                        },
                        children: [
                            child$(this.state.selectedItem$, (item) => {
                                if (item.type == 'TestSuites.TestError') {
                                    return new Contents.TestSuites.TestErrorView(
                                        {
                                            data: item.data as HttpModels.ResponseError,
                                        },
                                    )
                                }
                                if (item.type == 'Overview.Dashboard') {
                                    return new Contents.Overviews.DashboardView(
                                        {
                                            summary:
                                                item.data as HttpModels.ResponseSummary,
                                        },
                                    )
                                }
                                if (item.type == 'TestSuites.Run') {
                                    return new Contents.TestSuites.RunView({
                                        data: item.data as HttpModels.ResponseResult,
                                    })
                                }
                            }),
                        ],
                    },
                ],
            },
        ]
    }
}
