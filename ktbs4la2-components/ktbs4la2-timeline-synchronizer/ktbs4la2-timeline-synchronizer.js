import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import "../ktbs4la2-timeline/ktbs4la2-timeline.js";

/**
 * 
 */
export class KTBS4LA2TimelineSynchronizer extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, false, false);
        this._onChildTimelineViewChangeBindedFunction = this._onChildTimelineViewChange.bind(this);
        this._onChildTimelineCursorMoveBindedFunction = this._onChildTimelineCursorMove.bind(this);
        this._timelineNodesObserver = new MutationObserver(this._onTimelineNodesMutation.bind(this));
    }

    /**
	 * 
	 */
	onComponentReady() {
        if(!this.hasAttribute("sync-view")) {
            this.addEventListener("view-change", this._onChildTimelineViewChangeBindedFunction);
            this._timelineNodesObserver.observe(this, {childList: true, subtree: true, attributes: true, attributes: true, attributeFilter: ["begin", "end"]});
            this._synchronizeTimelinesRanges();
        }

        if(!this.hasAttribute("sync-cursor"))
            this.addEventListener("cursor-move", this._onChildTimelineCursorMoveBindedFunction);
    }

    /**
     * 
     * @param {*} mutationRecords 
     * @param {*} observer 
     */
    _onTimelineNodesMutation(mutationRecords, observer) {
        if(this.syncView) {
            let timelineAdded = false;
            let timelineRangeChanged = false;

            for(let i = 0;!(timelineAdded || timelineRangeChanged) && (i < mutationRecords.length); i++) {
                let currentMutationRecord = mutationRecords[i];

                if(currentMutationRecord.type == "childList") {
                    for(let j = 0;(!timelineAdded) && (j < currentMutationRecord.addedNodes.length); j++) {
                        let addedNode = currentMutationRecord.addedNodes[j];
                        
                        if(addedNode.localName == "ktbs4la2-timeline")
                            timelineAdded = true;
                    }
                }
                else if(    (currentMutationRecord.type == "attributes")
                        &&	(currentMutationRecord.target.localName == "ktbs4la2-timeline")
                        &&	(
                                (currentMutationRecord.attributeName == "begin")
                            ||  (currentMutationRecord.attributeName == "end")))
                        timelineRangeChanged = true;
            }
            
            if(timelineAdded || timelineRangeChanged)
                this._synchronizeTimelinesRanges();
        }
    }

    /**
     * 
     */
    get timelines() {
        let timelines = this.querySelectorAll("ktbs4la2-timeline");
        return timelines;
    }

    /**
     * 
     */
    _synchronizeTimelinesRanges() {
        let childTimelines = this.timelines;
        let minBegin = null;
        let maxEnd = null;

        for(let i = 0; i < childTimelines.length; i++) {
            let aTimeline = childTimelines[i];

            if(aTimeline.hasAttribute("begin")) {
                let timelineBegin = parseFloat(aTimeline.getAttribute("begin"), 10);

                if(!isNaN(timelineBegin) && ((minBegin == null) || (minBegin > timelineBegin)))
                    minBegin = timelineBegin;
            }

            if(aTimeline.hasAttribute("end")) {
                let timelineEnd = parseFloat(aTimeline.getAttribute("end"), 10);

                if(!isNaN(timelineEnd) && ((maxEnd == null) || (maxEnd < timelineEnd)))
                    maxEnd = timelineEnd;
            }
        }

        if((minBegin != null) && (maxEnd != null)) {
            for(let i = 0; i < childTimelines.length; i++) {
                let aTimeline = childTimelines[i];

                if(!aTimeline.hasAttribute("begin") || isNaN(parseFloat(aTimeline.getAttribute("begin"), 10)) || (parseFloat(aTimeline.getAttribute("begin"), 10) > minBegin))
                    aTimeline.setAttribute("begin", minBegin);
               
                if(!aTimeline.hasAttribute("end") || isNaN(parseFloat(aTimeline.getAttribute("end"), 10)) || (parseFloat(aTimeline.getAttribute("end"), 10) < maxEnd))
                    aTimeline.setAttribute("end", maxEnd);
            }
        }
    }

    /**
     * 
     */
    get syncView() {
        return !(this.hasAttribute("sync-view") && ((this.getAttribute("sync-view") == "false") || (this.getAttribute("sync-view") == "0")));
    }

    /**
     * 
     */
    set syncView(sync_view) {
        if(sync_view instanceof Boolean) {
            if(sync_view) {
                this.addEventListener("view-change", this._onChildTimelineViewChangeBindedFunction);
                this._timelineNodesObserver.observe(this, {childList: true, subtree: true, attributes: true, attributeFilter: ["begin", "end"]});
                this._synchronizeTimelinesRanges();
            }
            else {
                this.removeEventListener("view-change", this._onChildTimelineViewChangeBindedFunction);
                this._timelineNodesObserver.disconnect();
            }
        }
        else
            throw new TypeError("Parameter sync_view must be a boolean");
    }

    /**
     * 
     */
    get syncCursor() {
        return !(this.hasAttribute("sync-cursor") && ((this.getAttribute("sync-cursor") == "false") || (this.getAttribute("sync-cursor") == "0")));
    }

    /**
     * 
     */
    set syncCursor(sync_cursor) {
        if(sync_cursor instanceof Boolean) {
            if(sync_cursor)
                this.addEventListener("cursor-move", this._onChildTimelineCursorMoveBindedFunction);
            else
                this.removeEventListener("cursor-move", this._onChildTimelineCursorMoveBindedFunction);
        }
        else
            throw new TypeError("Parameter sync_cursor must be a boolean");
    }

    /**
     * 
     */
    _onChildTimelineViewChange(event) {
       if(
                this.syncView
            &&  event.target
            &&  (event.target.localName == "ktbs4la2-timeline")
            &&  event.detail
            &&  event.detail.user_initiated
            &&  !document.fullscreenElement
       ) {
            let newViewBeginTime = event.detail.begin;
            let newZoomLevel = event.detail.zoomLevel;
            let newDivWidth = event.detail.divWidth;

            if(this._syncChildViewsID)
                clearTimeout(this._syncChildViewsID);

            this._syncChildViewsID = setTimeout(() => {
                let childTimelines = this.timelines;

                for(let i = 0; i < childTimelines.length; i++) {
                    let aTimeline = childTimelines[i];

                    if(aTimeline !== event.target) {
                        if(aTimeline.viewBeginTime != newViewBeginTime)
                            aTimeline.setAttribute("view-begin", newViewBeginTime);

                        if(aTimeline.zoomLevel != newZoomLevel)
                            aTimeline.setAttribute("zoom-level", newZoomLevel);

                        if(aTimeline.divWidth != newDivWidth)
                            aTimeline.setAttribute("div-width", newDivWidth);
                    }
                }
                
                this._syncChildViewsID = null;
            });
        }
    }

    /**
     * 
     */
    _onChildTimelineCursorMove(event) {
        if(
                this.syncCursor
            &&  (event.target.localName == "ktbs4la2-timeline")
            &&  !document.fullscreenElement
        ) {
            let cursorTime = event.detail.cursorTime;

            if(this._syncChildCursorsID)
                clearTimeout(this._syncChildCursorsID);

            this._syncChildCursorsID = setTimeout(() => {
                let childTimelines = this.timelines;

                for(let i = 0; i < childTimelines.length; i++) {
                    let aTimeline = childTimelines[i];

                    if((aTimeline !== event.target) && (aTimeline.getAttribute("cursor-time") != cursorTime))
                        aTimeline.setAttribute("cursor-time", cursorTime);
                }

                this._syncChildCursorsID = null;
            });
        }
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let observedAttributes = super.observedAttributes;
		observedAttributes.push("sync-view");
		observedAttributes.push("sync-cursor");
		return observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
        super.attributeChangedCallback(attributeName, oldValue, newValue);
        
        if(attributeName == "sync-view")
            this.syncView = ((newValue != "0") && (newValue != "false"));
        else if(attributeName == "sync-cursor")
            this.syncCursor = ((newValue != "0") && (newValue != "false"));
	}
}

customElements.define('ktbs4la2-timeline-synchronizer', KTBS4LA2TimelineSynchronizer);