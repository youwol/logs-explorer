import { VirtualDOM } from '@youwol/flux-view'
import { HttpModels } from '../..'

/**
 * @category View
 */
export class DashboardView implements VirtualDOM {
    /**
     * Immutable DOM Constants
     */
    public readonly class = 'p-2 w-75 mx-auto'
    /**
     * Immutable Constants
     */
    public readonly summary: HttpModels.ResponseSummary
    /**
     * Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: { summary: HttpModels.ResponseSummary }) {
        Object.assign(this, params)
        this.children = [
            {
                children: [
                    {
                        class: 'd-flex align-items-center',
                        children: [
                            {
                                innerText: 'Total test:',
                            },
                            { class: 'mx-2' },
                            {
                                innerText: this.summary.results.length,
                            },
                        ],
                    },
                    {
                        class: 'd-flex align-items-center',
                        children: [
                            {
                                innerText: 'Success rate:',
                            },
                            { class: 'mx-2' },
                            {
                                innerText: `${
                                    Math.floor(
                                        (this.summary.results.filter(
                                            (s) => s.status == 'OK',
                                        ).length /
                                            this.summary.results.length) *
                                            1000,
                                    ) / 10
                                } %`,
                            },
                        ],
                    },
                    {
                        class: 'd-flex align-items-center',
                        children: [
                            {
                                innerText: 'Average duration:',
                            },
                            { class: 'mx-2' },
                            {
                                innerText: `${
                                    this.summary.results.reduce(
                                        (acc, e) => acc + e.duration,
                                        0,
                                    ) / this.summary.results.length
                                } s`,
                            },
                        ],
                    },
                ],
            },
        ]
    }
}
