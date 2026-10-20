import { registerRenderer } from '@vamis/core'
import Video from '../renderers/display/Video.vue'
import Audio from '../renderers/display/Audio.vue'
import IFrame from '../renderers/display/IFrame.vue'
import Carousel from '../renderers/display/Carousel.vue'
import Slider from '../renderers/display/Slider.vue'
import Markdown from '../renderers/display/Markdown.vue'
import Code from '../renderers/display/Code.vue'
import Json from '../renderers/display/Json.vue'
import QRCode from '../renderers/display/QRCode.vue'
import BarCode from '../renderers/display/BarCode.vue'
import Calendar from '../renderers/display/Calendar.vue'
import Sparkline from '../renderers/display/Sparkline.vue'
import OfficeViewer from '../renderers/display/OfficeViewer.vue'
import PdfViewer from '../renderers/display/PdfViewer.vue'

registerRenderer({ type: 'video', component: Video })
registerRenderer({ type: 'audio', component: Audio })
registerRenderer({ type: 'iframe', component: IFrame })
registerRenderer({ type: 'carousel', component: Carousel })
registerRenderer({ type: 'slider', component: Slider })
registerRenderer({ type: 'markdown', component: Markdown })
registerRenderer({ type: 'code', component: Code })
registerRenderer({ type: 'json', alias: ['static-json'], component: Json })
registerRenderer({ type: 'qrcode', alias: ['qr-code'], component: QRCode })
registerRenderer({ type: 'barcode', component: BarCode })
registerRenderer({ type: 'calendar', component: Calendar })
registerRenderer({ type: 'sparkline', component: Sparkline })
registerRenderer({ type: 'office-viewer', component: OfficeViewer })
registerRenderer({ type: 'pdf-viewer', component: PdfViewer })
