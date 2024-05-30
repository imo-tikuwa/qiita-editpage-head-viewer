import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/mira/theme.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import './style.css'

import Popup from './Popup.vue'

createApp(Popup).use(PrimeVue).mount('#app')
