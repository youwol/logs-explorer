import { DockableTabs } from '@youwol/fv-tabs'
import { NodeCategory, NodeProjectBase, RunNode } from './nodes'
import { ImmutableTree } from '@youwol/fv-tree'
import { AppState } from '../../app.state'
import { VirtualDOM } from '@youwol/flux-view'

/**
 * @category View
 */
export class Tab extends DockableTabs.Tab {
    constructor({ state }: { state: AppState }) {
        super({
            id: 'Test-suites',
            title: 'Test-suites',
            icon: '',
            content: () => {
                const explorerView = new ImmutableTree.View({
                    state: state.logsExplorerState,
                    headerView: (state, node) => new NodeView({ state, node }),
                })
                return {
                    style: {
                        width: '300px',
                    },
                    class: 'h-100',
                    children: [
                        {
                            class: 'h-100 overflow-auto px-2',
                            children: [explorerView],
                        },
                    ],
                }
            },
        })
    }
}

/**
 * @category View
 */
export class NodeView implements VirtualDOM {
    /**
     * @group Factories
     */
    static NodeTypeFactory: Record<NodeCategory, string> = {
        Node: '',
        Project: 'fas fa-rocket-launch',
        RunNode: 'fas fa-play',
        ErrorNode: 'fas fa-times fv-text-error',
    }

    /**
     * @group Immutable Constants
     */
    public readonly node: NodeProjectBase

    /**
     * @group Immutable DOM Constants
     */
    public readonly class: string =
        'w-100 d-flex align-items-center my-1 fv-pointer'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: {
        state: ImmutableTree.State<NodeProjectBase>
        node: NodeProjectBase
    }) {
        Object.assign(this, params)
        if (this.node instanceof RunNode && this.node.data.status == 'KO') {
            this.class += ' fv-text-error'
        }
        this.children = [
            { class: `${NodeView.NodeTypeFactory[this.node.category]} mx-1` },
            { innerText: this.node.name },
        ]
    }
}
