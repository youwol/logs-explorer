import { render } from '@youwol/flux-view'
import { AppState } from './app.state'
import { AppView } from './app.view'
import { AssetsGateway } from '@youwol/http-clients'
import { raiseHTTPErrors } from '@youwol/http-primitives'
import { map } from 'rxjs/operators'
import { HttpModels } from '.'

export {}

const assetId = new URLSearchParams(window.location.search).get('id')
new AssetsGateway.AssetsGatewayClient().assets
    .getFile$({
        assetId: assetId,
        path: 'summary.json',
    })
    .pipe(
        raiseHTTPErrors(),
        map((resp: unknown) => resp as HttpModels.ResponseSummary),
    )
    .subscribe((summary) => {
        const state = new AppState({ summary })
        const vDOM = new AppView({ state })

        document.getElementById('content').appendChild(render(vDOM))
    })
