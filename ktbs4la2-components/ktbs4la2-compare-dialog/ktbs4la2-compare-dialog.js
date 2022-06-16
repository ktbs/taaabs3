import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {ComputedTrace, StoredTrace} from "../../ktbs-api/Trace.js";

import "../ktbs4la2-multiple-resources-picker/ktbs4la2-multiple-resources-picker.js"

/**
 * 
 */
class KTBS4LA2CompareDialog extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
	}

    /**
     * 
     */
    attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri") {
            this._componentReady.then(() => {
                this._tracesPicker.setAttribute("browse-start-uri", newValue);
            })
            .catch(() => {});
        }
	}

    /**
	 * 
	 */
	_getKtbsResourceClass() {
		if(this.getAttribute("resource-type") == "StoredTrace")
            return StoredTrace;
        else if(this.getAttribute("resource-type") == "ComputedTrace")
            return ComputedTrace;
        else
            return undefined;
	}

    /**
	 * 
	 */
	_onKtbsResourceSyncInSync() {
        this._ktbsResource.get_root(this._abortController.signal, this._ktbsResource.credentials)
            .then((trace_root) => {
                this._componentReady.then(() => {
                    this._tracesPicker.setAttribute("root-uri", trace_root.uri);
                    this._tracesPicker.setAttribute("root-label", trace_root.label);
                })
                .catch((error) => {});
            })
            .catch((error) => {
                this.emitErrorEvent(error);
            });
	}

	/**
	 * 
	 */
	onComponentReady() {
        this._title = this.shadowRoot.querySelector("#title");
        this._tracesPickerLabel = this.shadowRoot.querySelector("#traces-picker-label");
        this._tracesPicker = this.shadowRoot.querySelector("#traces-picker");
        this._tracesPicker.setAttribute("lang", this._lang);
        this._tracesPicker.addEventListener("change", this._onChangeTracePicker.bind(this));
        this._tracesPicker.addEventListener("input", this._onChangeTracePicker.bind(this));
        this._compareButton = this.shadowRoot.querySelector("#compare");
        this._compareButton.addEventListener("click", this._onClickCompareButton.bind(this));
        this._cancelButton = this.shadowRoot.querySelector("#cancel");
        this._cancelButton.addEventListener("click", this._onClickCancelButton.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._title.innerText = this._translateString("Compare traces");
        this._tracesPickerLabel.innerText = this._translateString("Choose which traces to compare with");
        this._tracesPicker.setAttribute("lang", this._lang);
        this._compareButton.innerText = this._translateString("Compare !");
        this._cancelButton.innerText = this._translateString("Cancel");
	}

    /**
     * 
     */
    _onChangeTracePicker(event) {
        for(let i = 0; i < this._tracesPicker.resourcePickers.length; i++) {
            if(this._tracesPicker.resourcePickers[i].value == this.getAttribute("uri")) {
                this._tracesPicker.resourcePickers[i].setCustomValidity(this._translateString("You can't compare a trace with itself"));
                break;
            }
            else
                this._tracesPicker.resourcePickers[i].setCustomValidity("");
        }

        if(this._tracesPicker.checkValidity()) {
            if(this._compareButton.hasAttribute("disabled"))
                this._compareButton.removeAttribute("disabled");
        }
        else
            this._compareButton.setAttribute("disabled", true);
    }

    /**
     * 
     */
    _onClickCompareButton(event) {
        event.preventDefault();
        event.stopPropagation();
        const traces_to_compare = this._tracesPicker.picked_resources;
        traces_to_compare.unshift(this._ktbsResource);

        this.dispatchEvent(
			new CustomEvent("validate-compare", {
				bubbles: true,
				cancelable: false,
				composed: true,
				detail : {
                    traces: traces_to_compare
				}
			})
		);
    }

    /**
     * 
     */
    _onClickCancelButton(event) {
        this.dispatchEvent(
			new CustomEvent("cancel-compare", {
				bubbles: true,
				cancelable: false,
				composed: true
			})
		);
    }
}

customElements.define('ktbs4la2-compare-dialog', KTBS4LA2CompareDialog);