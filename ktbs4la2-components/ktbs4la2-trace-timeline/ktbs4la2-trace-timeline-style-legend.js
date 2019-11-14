import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

/**
 * 
 */
class KTBS4LA2TraceTimelineStyleLegend extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, false);
    }

    /**
	 * 
	 */
	onComponentReady() {
		this._marker = this.shadowRoot.querySelector("#marker");
        this._label = this.shadowRoot.querySelector("#label");
    }

    /**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
        observedAttributes.push('color');
        observedAttributes.push('symbol');
        observedAttributes.push('rule-id');
		return observedAttributes;
    }
    
    /**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "rule-id") {
            this._componentReady.then(() => {
                this._label.innerText = newValue;
            });
        }
        else if(attributeName == "color") {
            this._componentReady.then(() => {
                if(this.hasAttribute("symbol")) {
					this._marker.style.color = newValue;
					this._marker.style.backgroundColor = "transparent";
				}
				else
					this._marker.style.backgroundColor = newValue;
            });
        }
        else if(attributeName == "symbol")
			this._componentReady.then(() => {
				this._marker.innerHTML = newValue;

				if(newValue)
					this._marker.style.backgroundColor = "transparent";
			});
    }
    
}

customElements.define('ktbs4la2-trace-timeline-style-legend', KTBS4LA2TraceTimelineStyleLegend);