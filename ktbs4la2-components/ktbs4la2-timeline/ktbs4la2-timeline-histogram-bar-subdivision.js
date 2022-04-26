import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

export class KTBS4LA2TimelineHistogramBarSubdivision extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, false, false);
		this._parentTimelineResizeObserver = null;
	}

	/**
	 * 
	 */
	get parentBar() {
		if(!this._parentBar)
			this._parentBar = this.closest("ktbs4la2-timeline-histogram-bar"); 
		
		return this._parentBar;
	}

	/**
	 * 
	 */
	get parentTimeline() {
		return this.parentBar.parentTimeline;
	}

	/**
	 * 
	 */
	get _maxChartAmount() {
		let maxAmount = 0;
		const allBars = this.parentTimeline.querySelectorAll("ktbs4la2-timeline-histogram-bar");

		for(let i = 0; i < allBars.length; i++)
			if(allBars[i].totalAmount > maxAmount)
				maxAmount = allBars[i].totalAmount;

		return maxAmount;
	}

    /**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
        observedAttributes.push("label");
		observedAttributes.push("amount");
		observedAttributes.push("symbol");
		observedAttributes.push("shape");
		observedAttributes.push("color");
		return observedAttributes;
	}

	/**
	 * 
	 */
	_updateHeight() {
		this._componentReady.then(() => {
			if(this.parentBar.normalized)
				this.style.height = ((parseInt(this.getAttribute("amount"), 10) / this.parentBar.totalAmount) * this.parentTimeline.availableHeight) + "px";
			else
				this.style.height = ((parseInt(this.getAttribute("amount"), 10) / this._maxChartAmount) * this.parentTimeline.availableHeight) + "px";
		})
		.catch(() => {});
	}

	/**
	 * 
	 */
    attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "amount") {
			this._updateHeight();
		}
		else if(attributeName == "color") {
			this.style.backgroundColor = newValue;
		}
    }

    /**
	 * 
	 */
	onComponentReady() {
		try {
			this._parentTimelineResizeObserver = new ResizeObserver(this._onResizeParentTimeline.bind(this));
			this._parentTimelineResizeObserver.observe(this.parentTimeline);
		}
		catch(error) {
			this.emitErrorEvent(error);
		}
    }

	/**
	 * 
	 */
	_onResizeParentTimeline(entries, observer) {
		this._updateHeight();
	}

    /**
	 * 
	 */
	get beginTime() {
		return this._beginTime;
	}
	
	/**
	 * 
	 */
	get endTime() {
		if(this._endTime != undefined)
			return this._endTime;
		else
			return this._beginTime;
	}

	/**
	 * 
	 */
	 disconnectedCallback() {
		super.disconnectedCallback();

		if(this._parentTimelineResizeObserver != null)
			this._parentTimelineResizeObserver.disconnect();
	}
}

customElements.define('ktbs4la2-timeline-histogram-bar-subdivision', KTBS4LA2TimelineHistogramBarSubdivision);