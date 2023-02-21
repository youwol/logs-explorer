import { child$, VirtualDOM } from '@youwol/flux-view'
import { HttpModels } from '../..'
import { AssetsGateway } from '@youwol/http-clients'
import { raiseHTTPErrors } from '@youwol/http-primitives'
import { map } from 'rxjs/operators'
import { ImmutableTree, ObjectJs } from '@youwol/fv-tree'

/**
 * @category View
 */
export class TestErrorView implements VirtualDOM {
    /**
     * Immutable DOM Constants
     */
    public readonly class = 'h-100 w-75 mx-auto d-flex flex-column'
    /**
     * Immutable Constants
     */
    public readonly data: HttpModels.ResponseError
    /**
     * Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: { data: HttpModels.ResponseError }) {
        Object.assign(this, params)

        this.children = [
            {
                tag: 'pre',
                class: 'fv-text-primary',
                children: this.data.outputSummary.map((line) => {
                    return {
                        innerText: line,
                    }
                }),
            },
            {
                class: 'flex-grow-1 overflow-auto',
                style: {
                    minHeight: '0px',
                },
                children: [new LogsView({ error: this.data })],
            },
        ]
    }
}

/**
 * @category View
 */
export class LogsView implements VirtualDOM {
    /**
     * Immutable Constants
     */
    public readonly error: HttpModels.ResponseError

    /**
     * Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: { error: HttpModels.ResponseError }) {
        Object.assign(this, params)

        const assetId = new URLSearchParams(window.location.search).get('id')
        const logs$ = new AssetsGateway.AssetsGatewayClient().assets
            .getFile$({
                assetId: assetId,
                path: this.error.logsFile,
            })
            .pipe(
                raiseHTTPErrors(),
                map((resp: unknown) => resp as HttpModels.ResponseNodes),
            )
        this.children = [
            child$(logs$, (logs) => {
                const state = new ImmutableTree.State<BaseNode>({
                    rootNode: createRootNode(logs),
                    expandedNodes: ['root'],
                })

                return new ImmutableTree.View<BaseNode>({
                    state,
                    headerView: (state, node: LogNode) => {
                        if (node instanceof RootLogNode) {
                            return { innerText: node.name }
                        }
                        return node.children
                            ? new NodeView({ node })
                            : new LogView({ node })
                    },
                })
            }),
        ]
    }
}

/**
 * @category Nodes
 */
export class BaseNode extends ImmutableTree.Node {
    /**
     * @group Immutable Constants
     */
    public readonly name: string

    public readonly content: HttpModels.ResponseNode

    constructor(params: { id: string; name: string; children }) {
        super({
            id: params.id,
            children: params.children,
        })
        Object.assign(this, params)
    }
}
/**
 * @category Nodes
 */
export class LogNode extends BaseNode {
    /**
     * @group Immutable Constants
     */
    public readonly t0: number

    constructor(params: {
        id: string
        t0: number
        name: string
        content: HttpModels.ResponseNode
        children
    }) {
        super({
            id: params.id,
            name: params.name,
            children: params.children,
        })
        Object.assign(this, params)
    }
}

/**
 * @category Nodes
 */
export class RootLogNode extends BaseNode {
    /**
     * @group Immutable Constants
     */
    public readonly name: string

    /**
     * @group Immutable Constants
     */
    public readonly t0: number

    constructor(params: { id: string; name: string; children; t0 }) {
        super({
            id: params.id,
            name: params.name,
            children: params.children,
        })
        Object.assign(this, params)
    }
}

function createRootNode(logs: HttpModels.ResponseNodes) {
    const roots = logs.nodes.filter((n) => {
        return n.parentContextId == 'root' && n.labels.includes('Label.STARTED')
    })
    const t0 = roots[0].timestamp
    return new RootLogNode({
        id: 'root',
        t0,
        name: 'Logs',
        children: roots.map((log) => {
            return createLogNode(log, logs.nodes, t0)
        }),
    })
}

function createLogNode(
    log: HttpModels.ResponseNode,
    allLogs: HttpModels.ResponseNode[],
    t0: number,
) {
    const nodes = allLogs
        .filter((l) => l.labels.includes('Label.STARTED'))
        .filter((l) => l.parentContextId == log.contextId)
        .map((log) => createLogNode(log, allLogs, t0))
    const leaf = allLogs
        .filter((l) => !l.labels.includes('Label.STARTED'))
        .filter((l) => l.contextId == log.contextId)
        .map((log) => createLeafNode(log, t0))

    return new LogNode({
        id: log.contextId,
        t0,
        name: log.text,
        content: log,
        children: [...nodes, ...leaf].sort(
            (a, b) => a.content.timestamp - b.content.timestamp,
        ),
    })
}

function createLeafNode(log: HttpModels.ResponseNode, t0: number) {
    return new LogNode({
        id: log.contextId + '_' + log.timestamp,
        t0,
        name: log.text,
        content: log,
        children: undefined,
    })
}
/**
 * @category View
 */
export class NodeView implements VirtualDOM {
    /**
     * @group Immutable Constants
     */
    static ClassSelector = 'node-view'

    /**
     * @group Immutable DOM Constants
     */
    public readonly class = `${NodeView.ClassSelector} d-flex align-items-center fv-pointer my-2 fv-text-primary`

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    /**
     * @group Immutable Constants
     */
    public readonly node: LogNode

    constructor(params: { node: LogNode }) {
        Object.assign(this, params)
        const message = this.node.content

        this.children = [
            new TimeView({ node: this.node }),
            {
                class: message['failed']
                    ? 'fas fa-times fv-text-error mr-2'
                    : 'fas fa-check fv-text-success mr-2',
            },
            new MethodLabelView(message),
            new AttributesView(message.attributes),
        ]
    }
}

/**
 * @category View
 */
export class MethodLabelView {
    /**
     * @group Immutable DOM Constants
     */
    public readonly class = 'd-flex align-items-center mr-3'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(message: HttpModels.ResponseNode) {
        this.children = [
            {
                class: 'd-flex flex-align-center px-2',
                children: message.labels
                    .filter((label) => labelMethodIcons[label])
                    .map((label) => {
                        return {
                            class: labelMethodIcons[label] + ' mx-1',
                        }
                    }),
            },
            {
                class: 'mr-3',
                innerText: message.text,
            },
        ]
    }
}

/**
 * @category View
 */
export class AttributesView {
    /**
     * @group Immutable DOM Constants
     */
    public readonly tag = 'table'

    /**
     * @group Immutable DOM Constants
     */
    public readonly class = ''

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    /**
     * @group Immutable DOM Constants
     */
    public readonly style = {
        fontSize: 'small',
        maxWidth: '50%',
    }

    constructor(attributes: { [key: string]: unknown }) {
        this.children = [
            {
                tag: 'tr',
                children: Object.keys(attributes).map((attName) => {
                    return {
                        tag: 'th',
                        class: 'px-2',
                        innerText: attName,
                    }
                }),
            },
            {
                tag: 'tr',
                children: Object.values(attributes).map((value) => {
                    return {
                        tag: 'td',
                        class: 'px-2',
                        innerText: value,
                    }
                }),
            },
        ]
    }
}

export const labelMethodIcons = {
    'Label.ADMIN': 'fas fa-users-cog',
    'Label.API_GATEWAY': 'fas fa-door-open',
    'Label.MIDDLEWARE': 'fas fa-ghost',
    'Label.END_POINT': 'fas fa-microchip',
    'Label.APPLICATION': 'fas fa-play',
    'Label.LOG': 'fas fa-edit',
}
export const labelLogIcons = {
    'Label.LOG_WARNING': 'fas fa-exclamation-circle fv-text-focus',
    'Label.LOG_ERROR': 'fas fa-times fv-text-error',
    'Label.DONE': 'fas fa-flag',
}

/**
 * @category View
 */
export class TimeView implements VirtualDOM {
    /**
     * @group Immutable DOM Constants
     */
    public readonly node: LogNode

    /**
     * @group Immutable DOM Constants
     */
    public readonly class =
        'd-flex align-items-center mx-1 rounded px-1 fv-bg-background-alt'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: { node: LogNode }) {
        Object.assign(this, params)
        this.children = [
            {
                class: 'fas fa-stopwatch',
            },
            {
                class: 'mx-1',
            },
            {
                innerText: `${
                    Math.floor(
                        1e-3 * (this.node.content.timestamp - this.node.t0),
                    ) / 1e3
                }`,
            },
        ]
    }
}

/**
 * @category View
 */
export class LogView implements VirtualDOM {
    /**
     * @group Immutable DOM Constants
     */
    public readonly class = 'd-flex align-items-center fv-pointer'

    /**
     * @group Immutable DOM Constants
     */
    public readonly style = {}

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    /**
     * @group Immutable Constants
     */
    public readonly node: LogNode

    constructor(params: { node: LogNode }) {
        Object.assign(this, params)
        const message = this.node.content
        this.style = message.labels.includes('Label.BASH')
            ? { fontFamily: 'monospace', fontSize: 'x-small' }
            : {}

        this.children = [
            new TimeView({ node: this.node }),
            {
                class: 'd-flex',
                children: [
                    {
                        class: 'd-flex flex-align-center px-2',
                        children: message.labels
                            .filter((label) => labelLogIcons[label])
                            .map((label) => {
                                return {
                                    class: labelLogIcons[label] + ' mx-1',
                                }
                            }),
                    },
                    {
                        innerText: message.text,
                    },
                ],
            },
            message.data && Object.keys(message.data).length > 0
                ? { class: 'mx-2', children: [new DataView(message.data)] }
                : undefined,
        ]
    }
}

/**
 * @category View
 */
export class DataView implements VirtualDOM {
    /**
     * @group Immutable DOM Constants
     */
    public readonly class = 'fv-pointer'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    /**
     * @group Immutable DOM Constants
     */
    public readonly style = {
        fontSize: 'small',
    }

    constructor(data) {
        const treeState = new ObjectJs.State({ title: 'Data', data })
        this.children = [new ObjectJs.View({ state: treeState })]
    }
}
