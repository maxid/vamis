import { registerRenderer } from '@varmis/core'
import Page from './renderers/Page.vue'
import Tpl from './renderers/Tpl.vue'
import Container from './renderers/Container.vue'
import Flex from './renderers/Flex.vue'
import Grid from './renderers/Grid.vue'
import Form from './renderers/Form.vue'
import Action from './renderers/Action.vue'
import Dialog from './renderers/Dialog.vue'
import Service from './renderers/Service.vue'
import Table from './renderers/Table.vue'
import CRUD from './renderers/CRUD.vue'
import Tabs from './renderers/Tabs.vue'
import Divider from './renderers/Divider.vue'
import Panel from './renderers/Panel.vue'
import Wrapper from './renderers/Wrapper.vue'
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

registerRenderer({ type: 'page', component: Page })
registerRenderer({ type: 'tpl', alias: ['html', 'plain'], component: Tpl })
registerRenderer({ type: 'container', component: Container })
registerRenderer({ type: 'wrapper', component: Wrapper })
registerRenderer({ type: 'flex', component: Flex })
registerRenderer({ type: 'grid', component: Grid })
registerRenderer({ type: 'form', component: Form, isolateScope: true })
registerRenderer({ type: 'action', alias: ['button', 'submit', 'reset'], component: Action })
registerRenderer({ type: 'dialog', component: Dialog })
registerRenderer({ type: 'service', component: Service, isolateScope: true })
registerRenderer({ type: 'table', alias: ['static-table'], component: Table })
registerRenderer({ type: 'crud', component: CRUD, isolateScope: true })
registerRenderer({ type: 'tabs', component: Tabs })
registerRenderer({ type: 'divider', component: Divider })
registerRenderer({ type: 'panel', component: Panel })

registerRenderer({
  type: 'input-text',
  alias: ['input-email', 'input-password', 'input-url', 'text'],
  component: InputText,
  isFormItem: true,
})
registerRenderer({ type: 'textarea', component: Textarea, isFormItem: true })
registerRenderer({ type: 'input-number', component: InputNumber, isFormItem: true })
registerRenderer({ type: 'select', alias: ['multi-select'], component: Select, isFormItem: true })
registerRenderer({ type: 'checkbox', component: Checkbox, isFormItem: true })
registerRenderer({ type: 'checkboxes', component: Checkboxes, isFormItem: true })
registerRenderer({ type: 'radios', component: Radios, isFormItem: true })
registerRenderer({ type: 'switch', component: Switch, isFormItem: true })
registerRenderer({ type: 'hidden', component: Hidden, isFormItem: true })
registerRenderer({ type: 'static', component: Static, isFormItem: true })
registerRenderer({ type: 'input-date', alias: ['input-datetime'], component: InputDate, isFormItem: true })
