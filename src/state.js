/** State Manager */

import { Fn } from "three/src/nodes/TSL.js";
import { call } from "three/tsl";

class StateManager {
    constructor() {
        this.state = {
            mode: "landing",
            activeSection: null
        }
        this.listeners = [];
    }

    get() {
        return this.state;
    }

    set(newState) {
        const prevState = {...this.state};

        this.state = {
            ...this.state,
            ...newState
        };
        this.notify(prevState);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify(prevState) {
        this.listeners.forEach(fn => fn(this.state, prevState));
    }
}

export const APP_STATE = new StateManager();