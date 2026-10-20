import { registerRenderer } from '@vamis/core'
import App from '../renderers/layout/App.vue'
import HBox from '../renderers/layout/HBox.vue'
import VBox from '../renderers/layout/VBox.vue'
import Grid2D from '../renderers/layout/Grid2D.vue'
import Portlet from '../renderers/layout/Portlet.vue'
import SwitchContainer from '../renderers/layout/SwitchContainer.vue'
import TooltipWrapper from '../renderers/layout/TooltipWrapper.vue'
import Timeline from '../renderers/layout/Timeline.vue'
import AnchorNav from '../renderers/layout/AnchorNav.vue'
import GridNav from '../renderers/layout/GridNav.vue'
import PaginationWrapper from '../renderers/layout/PaginationWrapper.vue'

registerRenderer({ type: 'app', component: App })
registerRenderer({ type: 'hbox', component: HBox })
registerRenderer({ type: 'vbox', component: VBox })
registerRenderer({ type: 'grid-2d', component: Grid2D })
registerRenderer({ type: 'portlet', component: Portlet })
registerRenderer({ type: 'switch-container', component: SwitchContainer })
registerRenderer({ type: 'tooltip-wrapper', alias: ['tooltip'], component: TooltipWrapper })
registerRenderer({ type: 'timeline', component: Timeline })
registerRenderer({ type: 'anchor-nav', component: AnchorNav })
registerRenderer({ type: 'grid-nav', component: GridNav })
registerRenderer({ type: 'pagination-wrapper', component: PaginationWrapper })
