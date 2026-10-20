import { registerRenderer } from '@vamis/core'
import Remark from '../renderers/rest/Remark.vue'
import DropdownButton from '../renderers/rest/DropdownButton.vue'
import StaticValue from '../renderers/rest/StaticValue.vue'
import Tag from '../renderers/rest/Tag.vue'
import Property from '../renderers/rest/Property.vue'
import Words from '../renderers/rest/Words.vue'
import Log from '../renderers/rest/Log.vue'
import Tasks from '../renderers/rest/Tasks.vue'
import Shape from '../renderers/rest/Shape.vue'
import Card2 from '../renderers/rest/Card2.vue'
import Control from '../renderers/rest/Control.vue'
import TableView from '../renderers/rest/TableView.vue'
import AmisEmbed from '../renderers/rest/AmisEmbed.vue'
import WebComponent from '../renderers/rest/WebComponent.vue'
import Custom from '../renderers/rest/Custom.vue'
import Radio from '../renderers/form/Radio.vue'
import ButtonGroupSelect from '../renderers/form/ButtonGroupSelect.vue'
import InputRating from '../renderers/form/InputRating.vue'
import Uuid from '../renderers/form/Uuid.vue'
import InputTimeRange from '../renderers/form/InputTimeRange.vue'
import InputKvs from '../renderers/form/InputKvs.vue'
import TransferPicker from '../renderers/form/TransferPicker.vue'
import TabsTransfer from '../renderers/form/TabsTransfer.vue'
import Formula from '../renderers/form/Formula.vue'
import InputRepeat from '../renderers/form/InputRepeat.vue'
import MatrixCheckboxes from '../renderers/form/MatrixCheckboxes.vue'
import ListSelect from '../renderers/form/ListSelect.vue'
import IconPicker from '../renderers/form/IconPicker.vue'
import InputVerificationCode from '../renderers/form/InputVerificationCode.vue'
import InputSignature from '../renderers/form/InputSignature.vue'
import InputCity from '../renderers/form/InputCity.vue'
import ChartRadios from '../renderers/form/ChartRadios.vue'
import JsonSchema from '../renderers/form/JsonSchema.vue'
import DiffEditor from '../renderers/form/DiffEditor.vue'
import LocationPicker from '../renderers/form/LocationPicker.vue'
import InputExcel from '../renderers/form/InputExcel.vue'
import UsersSelect from '../renderers/form/UsersSelect.vue'
import ListItem from '../renderers/rest/ListItem.vue'
import FlexItem from '../renderers/rest/FlexItem.vue'
import TableCell from '../renderers/rest/TableCell.vue'

registerRenderer({ type: 'remark', component: Remark })
registerRenderer({ type: 'dropdown-button', component: DropdownButton })
registerRenderer({ type: 'date', component: StaticValue })
registerRenderer({ type: 'datetime', component: StaticValue })
registerRenderer({ type: 'time', component: StaticValue })
registerRenderer({ type: 'month', component: StaticValue })
registerRenderer({ type: 'number', component: StaticValue })
registerRenderer({ type: 'password', component: StaticValue })
registerRenderer({ type: 'color', component: StaticValue })
registerRenderer({ type: 'multiline-text', component: StaticValue })
registerRenderer({ type: 'date-range', component: StaticValue })
registerRenderer({ type: 'tag', alias: ['tags'], component: Tag })
registerRenderer({ type: 'property', component: Property })
registerRenderer({ type: 'words', component: Words })
registerRenderer({ type: 'log', component: Log })
registerRenderer({ type: 'tasks', component: Tasks })
registerRenderer({ type: 'shape', component: Shape })
registerRenderer({ type: 'card2', component: Card2 })
registerRenderer({ type: 'control', component: Control })
registerRenderer({ type: 'table-view', component: TableView })
registerRenderer({ type: 'amis', component: AmisEmbed })
registerRenderer({ type: 'web-component', component: WebComponent })
registerRenderer({ type: 'custom', component: Custom })

registerRenderer({ type: 'radio', component: Radio, isFormItem: true })
registerRenderer({ type: 'button-group-select', component: ButtonGroupSelect, isFormItem: true })
registerRenderer({ type: 'input-rating', component: InputRating, isFormItem: true })
registerRenderer({ type: 'uuid', component: Uuid, isFormItem: true })
registerRenderer({ type: 'input-time-range', component: InputTimeRange, isFormItem: true })
registerRenderer({ type: 'input-kvs', component: InputKvs, isFormItem: true })
registerRenderer({ type: 'transfer-picker', component: TransferPicker, isFormItem: true })
registerRenderer({
  type: 'tabs-transfer',
  alias: ['tabs-transfer-picker'],
  component: TabsTransfer,
  isFormItem: true,
})
registerRenderer({ type: 'formula', component: Formula, isFormItem: true })
registerRenderer({ type: 'input-formula', component: Formula, isFormItem: true })
registerRenderer({ type: 'input-repeat', component: InputRepeat, isFormItem: true })
registerRenderer({ type: 'matrix-checkboxes', component: MatrixCheckboxes, isFormItem: true })
registerRenderer({ type: 'list-select', component: ListSelect, isFormItem: true })
registerRenderer({ type: 'icon-picker', alias: ['icon-select'], component: IconPicker, isFormItem: true })
registerRenderer({ type: 'input-verification-code', component: InputVerificationCode, isFormItem: true })
registerRenderer({ type: 'input-signature', component: InputSignature, isFormItem: true })
registerRenderer({ type: 'input-city', component: InputCity, isFormItem: true })
registerRenderer({ type: 'chart-radios', component: ChartRadios, isFormItem: true })
registerRenderer({
  type: 'json-schema',
  alias: ['json-schema-editor'],
  component: JsonSchema,
  isFormItem: true,
})
registerRenderer({ type: 'diff-editor', component: DiffEditor, isFormItem: true })
registerRenderer({ type: 'location-picker', component: LocationPicker, isFormItem: true })
registerRenderer({ type: 'input-excel', component: InputExcel, isFormItem: true })
registerRenderer({ type: 'users-select', component: UsersSelect, isFormItem: true })
registerRenderer({ type: 'list-item', component: ListItem })
registerRenderer({ type: 'flex-item', component: FlexItem })
registerRenderer({
  type: 'cell',
  alias: ['table-cell', 'field', 'list-item-field'],
  component: TableCell,
})
