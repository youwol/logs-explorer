import { VirtualDOM, child$ } from '@youwol/flux-view'
import { HttpModels } from '../..'
import { AssetsGateway } from '@youwol/http-clients'
import { raiseHTTPErrors } from '@youwol/http-primitives'
import { map } from 'rxjs/operators'

/**
 * @category View
 */
export class RunView implements VirtualDOM {
    /**
     * Immutable DOM Constants
     */
    public readonly class =
        'h-100 w-75 mx-auto d-flex flex-column  overflow-auto'
    /**
     * Immutable Constants
     */
    public readonly data: HttpModels.ResponseResult
    /**
     * Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: { data: HttpModels.ResponseResult }) {
        Object.assign(this, params)
        const assetId = new URLSearchParams(window.location.search).get('id')
        const fullOutputs$ = new AssetsGateway.AssetsGatewayClient().assets
            .getFile$({
                assetId: assetId,
                path: this.data.fullOutput,
            })
            .pipe(
                raiseHTTPErrors(),
                map((resp: unknown) => resp as string),
            )
        this.children = [
            {
                tag: 'pre',
                class: 'fv-text-primary  mx-auto',
                children: [
                    child$(fullOutputs$, (outputs) => {
                        return {
                            innerText: outputs,
                        }
                    }),
                ],
            },
        ]
    }
}
