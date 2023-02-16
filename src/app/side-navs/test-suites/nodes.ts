import { ImmutableTree } from '@youwol/fv-tree'
import { HttpModels, AppModels } from '../../'
export type NodeCategory = 'Node' | 'Project' | 'RunNode' | 'ErrorNode'

/**
 * @category Nodes
 */
export abstract class NodeProjectBase extends ImmutableTree.Node {
    /**
     * @group Immutable Constants
     */
    public readonly name: string

    /**
     * @group Immutable Constants
     */
    public readonly category: NodeCategory = 'Node'

    protected constructor({
        id,
        name,
        children,
    }: {
        id: string
        name: string
        children?: NodeProjectBase[]
    }) {
        super({ id, children })
        this.name = name
    }
}

/**
 * @category Nodes
 */
export class ProjectNode extends NodeProjectBase {
    /**
     * @group Immutable Constants
     */
    public readonly category: NodeCategory = 'Project'

    constructor(params: { id: string; name: string; children }) {
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
export class RunNode
    extends NodeProjectBase
    implements AppModels.SideNavSelectableTrait
{
    /**
     * @group AppModels.SideNavSelectableTrait
     */
    public readonly type = 'TestSuites.Run'
    /**
     * @group AppModels.SideNavSelectableTrait
     */
    public readonly data: HttpModels.ResponseResult
    /**
     * @group Immutable Constants
     */
    public readonly category: NodeCategory = 'RunNode'

    public readonly status: 'OK' | 'KO'

    constructor(params: {
        id: string
        name: string
        data: HttpModels.ResponseResult
        children?: ErrorNode[]
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
export class ErrorNode
    extends NodeProjectBase
    implements AppModels.SideNavSelectableTrait
{
    /**
     * @group AppModels.SideNavSelectableTrait
     */
    public readonly type = 'TestSuites.TestError'
    /**
     * @group AppModels.SideNavSelectableTrait
     */
    public readonly data: HttpModels.ResponseError
    /**
     * @group Immutable Constants
     */
    public readonly category: NodeCategory = 'ErrorNode'

    public readonly error: HttpModels.ResponseError

    constructor(params: {
        id: string
        data: HttpModels.ResponseError
        name: string
    }) {
        super({
            id: params.id,
            name: params.name,
        })
        Object.assign(this, params)
    }
}

export function createProjectRootNode(summary: HttpModels.ResponseSummary) {
    return new ProjectNode({
        id: 'Tests',
        name: 'Tests',
        children: summary.results.map((result, i) => {
            return new RunNode({
                id: `${i}`,
                name: `${result.title}@${result.executionDate}`,
                data: result,
                children: (result.errors || []).map((error) => {
                    return new ErrorNode({
                        id: error.name.join('#'),
                        name: error.name.join('#'),
                        data: error,
                    })
                }),
            })
        }),
    })
}
