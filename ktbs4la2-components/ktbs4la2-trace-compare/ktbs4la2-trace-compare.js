import {KTBS4LA2TraceTimelineSynchronizer} from "../ktbs4la2-trace-timeline-synchronizer/ktbs4la2-trace-timeline-synchronizer.js";

/**
 * 
 */
class KTBS4LA2TraceCompare extends KTBS4LA2TraceTimelineSynchronizer {

    /**
     * 
     */
    constructor() {
        super(import.meta.url, true);
    }
}

customElements.define('ktbs4la2-trace-compare', KTBS4LA2TraceCompare);