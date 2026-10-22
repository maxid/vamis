import { registerRenderer } from '@vamis/core'
import Page from './renderers/Page.vue'
import Tpl from './renderers/Tpl.vue'
import Container from './renderers/Container.vue'
import Flex from './renderers/Flex.vue'
import Grid from './renderers/Grid.vue'
import Form from './renderers/Form.vue'
import Action from './renderers/Action.vue'
import Dialog from './renderers/Dialog.vue'
import Drawer from './renderers/Drawer.vue'
import Service from './renderers/Service.vue'
import Table from './renderers/Table.vue'
import CRUD from './renderers/CRUD.vue'
import Tabs from './renderers/Tabs.vue'
import Divider from './renderers/Divider.vue'
import Panel from './renderers/Panel.vue'
import Wrapper from './renderers/Wrapper.vue'
import Alert from './renderers/Alert.vue'
import ButtonGroup from './renderers/ButtonGroup.vue'
import ButtonToolbar from './renderers/ButtonToolbar.vue'
import Each from './renderers/Each.vue'
import Wizard from './renderers/Wizard.vue'
import Image from './renderers/Image.vue'
import Images from './renderers/Images.vue'
import Nav from './renderers/Nav.vue'
import Breadcrumb from './renderers/Breadcrumb.vue'
import Collapse from './renderers/Collapse.vue'
import CollapseGroup from './renderers/CollapseGroup.vue'
import Pagination from './renderers/Pagination.vue'
import Card from './renderers/Card.vue'
import Cards from './renderers/Cards.vue'
import List from './renderers/List.vue'
import Chart from './renderers/Chart.vue'
import Progress from './renderers/Progress.vue'
import Status from './renderers/Status.vue'
import Mapping from './renderers/Mapping.vue'
import Link from './renderers/Link.vue'
import Icon from './renderers/Icon.vue'
import Avatar from './renderers/Avatar.vue'
import Steps from './renderers/Steps.vue'
import Spinner from './renderers/Spinner.vue'
import SearchBox from './renderers/SearchBox.vue'
import InputText from './renderers/form/InputText.vue'
import Textarea from './renderers/form/Textarea.vue'
import InputNumber from './renderers/form/InputNumber.vue'
import Select from './renderers/form/Select.vue'
import Checkbox from './renderers/form/Checkbox.vue'
import Checkboxes from './renderers/form/Checkboxes.vue'
import Radios from './renderers/form/Radios.vue'
import Switch from './renderers/form/Switch.vue'
import Hidden from './renderers/form/Hidden.vue'
import Static from './renderers/form/Static.vue'
import InputDate from './renderers/form/InputDate.vue'
import DateRange from './renderers/form/DateRange.vue'
import Combo from './renderers/form/Combo.vue'
import InputTable from './renderers/form/InputTable.vue'
import Transfer from './renderers/form/Transfer.vue'
import InputFile from './renderers/form/InputFile.vue'
import InputImage from './renderers/form/InputImage.vue'
import InputTree from './renderers/form/InputTree.vue'
import TreeSelect from './renderers/form/TreeSelect.vue'
import NestedSelect from './renderers/form/NestedSelect.vue'
// 必须写死 import：playground Vite root 在 playground/，import.meta.glob 扫不到
// packages/vamis/src/extras，table2/crud2 等会整批变成「未知类型」。
import './extras/form'
import './extras/layout'
import './extras/display'
import './extras/crud'
import './extras/rest'

registerRenderer({ type: 'page', component: Page, scope: 'self' })
registerRenderer({ type: 'tpl', alias: ['html', 'plain'], component: Tpl })
registerRenderer({ type: 'container', component: Container })
registerRenderer({ type: 'wrapper', component: Wrapper })
registerRenderer({ type: 'flex', component: Flex })
registerRenderer({ type: 'grid', component: Grid })
registerRenderer({ type: 'form', component: Form, scope: 'self' })
registerRenderer({ type: 'action', alias: ['button', 'submit', 'reset'], component: Action })
registerRenderer({ type: 'dialog', component: Dialog })
registerRenderer({ type: 'drawer', component: Drawer })
registerRenderer({ type: 'service', component: Service, scope: 'self' })
registerRenderer({ type: 'table', alias: ['static-table'], component: Table })
registerRenderer({ type: 'crud', component: CRUD, scope: 'self' })
registerRenderer({ type: 'tabs', component: Tabs })
registerRenderer({ type: 'divider', component: Divider })
registerRenderer({ type: 'panel', component: Panel })
registerRenderer({ type: 'alert', component: Alert })
registerRenderer({ type: 'button-group', component: ButtonGroup })
registerRenderer({ type: 'button-toolbar', component: ButtonToolbar })
registerRenderer({ type: 'each', component: Each })
registerRenderer({ type: 'wizard', component: Wizard })
registerRenderer({ type: 'image', component: Image })
registerRenderer({ type: 'images', component: Images })
registerRenderer({ type: 'nav', component: Nav })
registerRenderer({ type: 'breadcrumb', component: Breadcrumb })
registerRenderer({ type: 'collapse', component: Collapse })
registerRenderer({ type: 'collapse-group', component: CollapseGroup })
registerRenderer({ type: 'pagination', component: Pagination })
registerRenderer({ type: 'card', component: Card })
registerRenderer({ type: 'cards', component: Cards })
registerRenderer({ type: 'list', component: List })
registerRenderer({ type: 'chart', component: Chart })
registerRenderer({ type: 'progress', component: Progress })
registerRenderer({ type: 'status', component: Status })
registerRenderer({ type: 'mapping', component: Mapping })
registerRenderer({ type: 'link', component: Link })
registerRenderer({ type: 'icon', component: Icon })
registerRenderer({ type: 'avatar', component: Avatar })
registerRenderer({ type: 'steps', component: Steps })
registerRenderer({ type: 'spinner', component: Spinner })
registerRenderer({ type: 'search-box', component: SearchBox })

registerRenderer({
  type: 'input-text',
  alias: ['input-email', 'input-password', 'input-url', 'text', 'native-date', 'native-time', 'native-number'],
  component: InputText,
  isFormItem: true,
})
registerRenderer({ type: 'textarea', component: Textarea, isFormItem: true })
registerRenderer({ type: 'input-number', component: InputNumber, isFormItem: true })
registerRenderer({
  type: 'select',
  alias: ['multi-select'],
  component: Select,
  isFormItem: true,
})
registerRenderer({ type: 'checkbox', component: Checkbox, isFormItem: true })
registerRenderer({ type: 'checkboxes', component: Checkboxes, isFormItem: true })
registerRenderer({ type: 'radios', component: Radios, isFormItem: true })
registerRenderer({ type: 'switch', component: Switch, isFormItem: true })
registerRenderer({ type: 'hidden', component: Hidden, isFormItem: true })
registerRenderer({ type: 'static', component: Static, isFormItem: true })
registerRenderer({
  type: 'input-date',
  alias: ['input-datetime', 'input-time'],
  component: InputDate,
  isFormItem: true,
})
registerRenderer({
  type: 'input-date-range',
  alias: ['input-datetime-range'],
  component: DateRange,
  isFormItem: true,
})
registerRenderer({ type: 'combo', component: Combo, isFormItem: true })
registerRenderer({ type: 'input-table', component: InputTable, isFormItem: true })
registerRenderer({ type: 'transfer', component: Transfer, isFormItem: true })
registerRenderer({ type: 'input-file', component: InputFile, isFormItem: true })
registerRenderer({ type: 'input-image', component: InputImage, isFormItem: true })
registerRenderer({ type: 'input-tree', component: InputTree, isFormItem: true })
registerRenderer({ type: 'tree-select', component: TreeSelect, isFormItem: true })
registerRenderer({ type: 'nested-select', component: NestedSelect, isFormItem: true })
