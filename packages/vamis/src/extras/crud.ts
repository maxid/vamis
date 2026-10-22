import { registerRenderer } from '@vamis/core'
import Operation from '../renderers/data/Operation.vue'
import ColumnToggler from '../renderers/data/ColumnToggler.vue'
import Table2 from '../renderers/data/Table2.vue'
import CRUD2 from '../renderers/data/CRUD2.vue'

registerRenderer({ type: 'operation', component: Operation })
registerRenderer({ type: 'column-toggler', alias: ['columns-toggler'], component: ColumnToggler })
registerRenderer({ type: 'table2', component: Table2 })
registerRenderer({ type: 'crud2', component: CRUD2, scope: 'self' })
