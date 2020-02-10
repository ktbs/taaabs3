import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {KTBS4LA2TimelineSynchronizer} from "../ktbs4la2-timeline-synchronizer/ktbs4la2-timeline-synchronizer.js";
import "../ktbs4la2-trace-timeline/ktbs4la2-trace-timeline.js";

/**
 * 
 */
class KTBS4LA2TraceTimelineSynchronizer extends KTBS4LA2TimelineSynchronizer {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, false, false);
        this._onChildTraceTimelineSetStylesheetBindedFunction = this._onChildTraceTimelineSetStylesheet.bind(this);
    }

    /**
	 * 
	 */
	onComponentReady() {
        super.onComponentReady();

        if(!this.hasAttribute("sync-stylesheets"))
           this.syncStylesheets = true;
    }

    /**
     * 
     */
    get trace_timelines() {
        return this.querySelectorAll("ktbs4la2-trace-timeline");
    }

    /**
     * 
     */
    get syncStylesheets() {
        return !(this.hasAttribute("sync-stylesheets") && ((this.getAttribute("sync-stylesheets") == "false") || (this.getAttribute("sync-stylesheets") == "0")));
    }

    /**
     * 
     */
    set syncStylesheets(sync_stylesheets) {
        if(typeof sync_stylesheets === "boolean") {
            if(sync_stylesheets)
                this.addEventListener("set-stylesheet", this._onChildTraceTimelineSetStylesheetBindedFunction);
            else
                this.removeEventListener("set-stylesheet", this._onChildTraceTimelineSetStylesheetBindedFunction);
        }
        else
            throw new TypeError("Parameter sync_stylesheets must be a boolean");
    }

    /**
     * 
     */
    _onChildTraceTimelineSetStylesheet(event) {
        if((this.syncStylesheets) && (event.target.localName == "ktbs4la2-trace-timeline")) {
            let stylesheetId = event.detail.stylesheetId;
            let childTraceTimelines = this.trace_timelines;

            for(let i = 0; i < childTraceTimelines.length; i++) {
                let aTimeline = childTraceTimelines[i];

                if((aTimeline !== event.target) && (aTimeline.getAttribute("stylesheet") != stylesheetId) && aTimeline.hasStylesheet(stylesheetId))
                    aTimeline.setAttribute("stylesheet", stylesheetId);
            }
        }
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let observedAttributes = super.observedAttributes;
        observedAttributes.push("sync-stylesheets");
		return observedAttributes;
    }
    
    /**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
        super.attributeChangedCallback(attributeName, oldValue, newValue);
        
        if(attributeName == "sync-stylesheets")
            this.syncStylesheets = ((newValue != "0") && (newValue != "false"));
	}
}

customElements.define('ktbs4la2-trace-timeline-synchronizer', KTBS4LA2TraceTimelineSynchronizer);