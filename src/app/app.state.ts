import { VirtualDOM } from '@youwol/flux-view'
import { ImmutableTree } from '@youwol/fv-tree'
import { BehaviorSubject } from 'rxjs'
import { DockableTabs } from '@youwol/fv-tabs'
import { AppModels, HttpModels, SideNavs } from '.'
import { filter } from 'rxjs/operators'

/**
 * @category State
 */
export class AppState implements VirtualDOM {
    /**
     * @group Immutable Constants
     */
    public readonly summary: HttpModels.ResponseSummary

    /**
     * @group States
     */
    public readonly logsExplorerState: ImmutableTree.State<SideNavs.TestSuites.NodeProjectBase>

    /**
     * @group States
     */
    public readonly leftSideNavState: DockableTabs.State

    /**
     * @group Observables
     */
    public readonly selectedItem$: BehaviorSubject<AppModels.SideNavSelectableTrait>

    constructor(params: { summary: HttpModels.ResponseSummary }) {
        Object.assign(this, params)
        this.selectedItem$ =
            new BehaviorSubject<AppModels.SideNavSelectableTrait>({
                type: 'Overview.Dashboard',
                data: this.summary,
            })

        const rootNode = SideNavs.TestSuites.createProjectRootNode(this.summary)
        this.logsExplorerState =
            new ImmutableTree.State<SideNavs.TestSuites.NodeProjectBase>({
                rootNode,
                expandedNodes: ['Tests'],
            })

        this.logsExplorerState.selectedNode$
            .pipe(
                filter(
                    (node) =>
                        node instanceof SideNavs.TestSuites.ErrorNode ||
                        node instanceof SideNavs.TestSuites.RunNode,
                ),
            )
            .subscribe((item: SideNavs.TestSuites.ErrorNode) => {
                this.selectedItem$.next(item)
            })
        this.leftSideNavState = new DockableTabs.State({
            disposition: 'left',
            viewState$: new BehaviorSubject<DockableTabs.DisplayMode>('pined'),
            tabs$: new BehaviorSubject([
                new SideNavs.Overviews.Tab({ state: this }),
                new SideNavs.TestSuites.Tab({ state: this }),
            ]),
            selected$: new BehaviorSubject<string>('Overviews'),
        })
    }

    selectDashboard() {
        this.selectedItem$.next({
            type: 'Overview.Dashboard',
            data: this.summary,
        })
    }
}
