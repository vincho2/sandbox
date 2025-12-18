import { el } from "./dom.js";
import { controllerLoadInitialTxs, adjustMainPadding } from "./controller.js";

// Load address information and the initial transactions list upon address submission from the page form
el.form.addEventListener("submit", controllerLoadInitialTxs);

// Adjust Padding
window.addEventListener("load", adjustMainPadding);


