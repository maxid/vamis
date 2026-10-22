import { registerRenderer } from '@vamis/core'
import Picker from '../renderers/form/Picker.vue'
import InputTag from '../renderers/form/InputTag.vue'
import InputColor from '../renderers/form/InputColor.vue'
import InputRange from '../renderers/form/InputRange.vue'
import FieldSet from '../renderers/form/FieldSet.vue'
import Group from '../renderers/form/Group.vue'
import InputGroup from '../renderers/form/InputGroup.vue'
import ChainedSelect from '../renderers/form/ChainedSelect.vue'
import InputSubForm from '../renderers/form/InputSubForm.vue'
import InputArray from '../renderers/form/InputArray.vue'
import InputKv from '../renderers/form/InputKv.vue'
import InputRichText from '../renderers/form/InputRichText.vue'
import Editor from '../renderers/form/Editor.vue'
import ConditionBuilder from '../renderers/form/ConditionBuilder.vue'
import DatePart from '../renderers/form/DatePart.vue'
import DatePartRange from '../renderers/form/DatePartRange.vue'

registerRenderer({ type: 'picker', component: Picker, isFormItem: true })
registerRenderer({ type: 'input-tag', component: InputTag, isFormItem: true })
registerRenderer({ type: 'input-color', component: InputColor, isFormItem: true })
registerRenderer({ type: 'input-range', component: InputRange, isFormItem: true })
registerRenderer({ type: 'fieldset', alias: ['fieldSet'], component: FieldSet, isFormItem: true })
registerRenderer({ type: 'group', component: Group })
registerRenderer({ type: 'input-group', component: InputGroup, isFormItem: true })
registerRenderer({ type: 'chained-select', component: ChainedSelect, isFormItem: true })
registerRenderer({ type: 'input-sub-form', component: InputSubForm, isFormItem: true })
registerRenderer({ type: 'input-array', component: InputArray, isFormItem: true })
registerRenderer({ type: 'input-kv', component: InputKv, isFormItem: true })
registerRenderer({ type: 'input-rich-text', component: InputRichText, isFormItem: true })
registerRenderer({
  type: 'editor',
  alias: [
    'bat-editor',
    'c-editor',
    'coffeescript-editor',
    'cpp-editor',
    'csharp-editor',
    'css-editor',
    'dockerfile-editor',
    'fsharp-editor',
    'go-editor',
    'handlebars-editor',
    'html-editor',
    'ini-editor',
    'java-editor',
    'javascript-editor',
    'js-editor',
    'json-editor',
    'less-editor',
    'lua-editor',
    'markdown-editor',
    'msdax-editor',
    'objective-c-editor',
    'php-editor',
    'plaintext-editor',
    'postiats-editor',
    'powershell-editor',
    'pug-editor',
    'python-editor',
    'r-editor',
    'razor-editor',
    'ruby-editor',
    'sb-editor',
    'scss-editor',
    'sol-editor',
    'sql-editor',
    'swift-editor',
    'typescript-editor',
    'ts-editor',
    'vb-editor',
    'xml-editor',
    'yaml-editor',
    'shell-editor',
  ],
  component: Editor,
  isFormItem: true,
})
registerRenderer({ type: 'condition-builder', component: ConditionBuilder, isFormItem: true })
registerRenderer({ type: 'input-month', component: DatePart, isFormItem: true })
registerRenderer({ type: 'input-quarter', component: DatePart, isFormItem: true })
registerRenderer({ type: 'input-year', component: DatePart, isFormItem: true })
registerRenderer({ type: 'input-month-range', component: DatePartRange, isFormItem: true })
registerRenderer({ type: 'input-quarter-range', component: DatePartRange, isFormItem: true })
registerRenderer({ type: 'input-year-range', component: DatePartRange, isFormItem: true })
