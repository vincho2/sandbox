import { state } from "./state.js";
import { controllerLoadNextTxs } from "./controller.js";
import { el } from "./dom.js";

// -------------------------------------------------------------------------------------------------
// Function to setup observer
// -------------------------------------------------------------------------------------------------
export function setupObserver() {

    // Define observer
    state.observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {

            // Render next transaction
            await controllerLoadNextTxs();
            
        }
    });

    // Activate observer
    state.observer.observe(el.sentinel);
    console.log("observer activated");
}