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
        this._onChildTraceTimelineSetViewModeBindedFunction = this._onChildTraceTimelineSetViewMode.bind(this);
        this._onChildTraceTimelineSetHistogramDurationOptionBindedFunction = this._onChildTraceTimelineSetHistogramDurationOption.bind(this);
        this._onChildTraceTimelineSetHistogramNormalizeOptionBindedFunction = this._onChildTraceTimelineSetHistogramNormalizeOption.bind(this);
    }

    /**
	 * 
	 */
	onComponentReady() {
        super.onComponentReady();

        if(!this.hasAttribute("sync-stylesheets"))
           this.syncStylesheets = true;

        if(!this.hasAttribute("sync-viewmodes"))
           this.syncViewModes = true;
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
    get syncViewModes() {
        return !(this.hasAttribute("sync-viewmodes") && ((this.getAttribute("sync-viewmodes") == "false") || (this.getAttribute("sync-viewmodes") == "0")));
    }

    /**
     * 
     */
    set syncViewModes(sync_viewmodes) {
        if(typeof sync_viewmodes === "boolean") {
            if(sync_viewmodes) {
                this.addEventListener("set-viewmode", this._onChildTraceTimelineSetViewModeBindedFunction);
                this.addEventListener("histogram-set-duration-option", this._onChildTraceTimelineSetHistogramDurationOptionBindedFunction);
                this.addEventListener("histogram-set-normalize-option", this._onChildTraceTimelineSetHistogramNormalizeOptionBindedFunction);
            }
            else {
                this.removeEventListener("set-viewmode", this._onChildTraceTimelineSetViewModeBindedFunction);
                this.removeEventListener("histogram-set-duration-option", this._onChildTraceTimelineSetHistogramDurationOptionBindedFunction);
                this.removeEventListener("histogram-set-normalize-option", this._onChildTraceTimelineSetHistogramNormalizeOptionBindedFunction);
            }
        }
        else
            throw new TypeError("Value for property syncViewModes MUST be a boolean");
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
     _onChildTraceTimelineSetViewMode(event) {
        if((this.syncViewModes) && (event.target.localName == "ktbs4la2-trace-timeline")) {
            let viewMode = event.detail.view_mode;
            let childTraceTimelines = this.trace_timelines;

            for(let i = 0; i < childTraceTimelines.length; i++) {
                let aTimeline = childTraceTimelines[i];

                if((aTimeline !== event.target) && (aTimeline.getAttribute("view-mode") != viewMode))
                    aTimeline.setAttribute("view-mode", viewMode);
            }
        }
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let observedAttributes = super.observedAttributes;
        observedAttributes.push("sync-stylesheets");
        observedAttributes.push("sync-viewmodes");
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

    /**
     * 
     */
    _onChildTraceTimelineSetHistogramDurationOption(event) {
        if(
                (this.syncViewModes)
            &&  (event.target.localName == "ktbs4la2-trace-timeline")
            &&  (event.detail)
            &&  (
                        (event.detail.duration === true)
                    ||  (event.detail.duration === false)
            )
        ) {
            let childTraceTimelines = this.trace_timelines;

            for(let i = 0; i < childTraceTimelines.length; i++) {
                let aTimeline = childTraceTimelines[i];

                if((aTimeline !== event.target) && (aTimeline.getAttribute("histogram-duration") != event.detail.duration))
                    aTimeline.setAttribute("histogram-duration", event.detail.duration);
            }
        }
    }
    
    /**
     * 
     */
    _onChildTraceTimelineSetHistogramNormalizeOption(event) {
        if(
                (this.syncViewModes)
            &&  (event.target.localName == "ktbs4la2-trace-timeline")
            &&  (event.detail)
            &&  (
                        (event.detail.normalize === true)
                    ||  (event.detail.normalize === false)
            )
        ) {
            let childTraceTimelines = this.trace_timelines;

            for(let i = 0; i < childTraceTimelines.length; i++) {
                let aTimeline = childTraceTimelines[i];

                if((aTimeline !== event.target) && (aTimeline.getAttribute("histogram-normalize") != event.detail.normalize))
                    aTimeline.setAttribute("histogram-normalize", event.detail.normalize);
            }
        }
    }
}

customElements.define('ktbs4la2-trace-timeline-synchronizer', KTBS4LA2TraceTimelineSynchronizer);