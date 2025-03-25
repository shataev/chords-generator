import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Полифил Buffer
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

// Полифил global
(window as any).global = window;

const app = createApp(App)
app.mount('#app') 