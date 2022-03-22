import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Model} from "../../ktbs-api/Model.js";

/**
 * 
 */
class KTBS4LA2TraceSplitDialog extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
        this._resolveTypeSet();
	}

    /**
	 * 
	 */
	_getKtbsResourceClass() {
		return Model;
	}

    /**
	 * 
	 */
	_onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {
            for(let i = 0; i < this._ktbsResource.stylesheets.length; i++) {
                const aStyleSheet = this._ktbsResource.stylesheets[i];

                const splitOption = document.createElement("option");
                splitOption.setAttribute("value", aStyleSheet.name);

                if( 
                        this.hasAttribute("current-stylesheet-name")
                    && (this.getAttribute("current-stylesheet-name") == aStyleSheet.name)
                )
                    splitOption.setAttribute("selected", true);

                splitOption.innerText = aStyleSheet.name;
                this._selectSplit.appendChild(splitOption);

                const displayOption = document.createElement("option");
                displayOption.setAttribute("value", aStyleSheet.name);
                displayOption.innerText = aStyleSheet.name;
                this._selectDisplay.appendChild(displayOption);
            }
        })
		.catch((error) => {});
	}

	/**
	 * 
	 */
	onComponentReady() {
        this._title = this.shadowRoot.querySelector("#title");
        this._selectSplitLabel = this.shadowRoot.querySelector("#select-split-label");
        this._selectSplit = this.shadowRoot.querySelector("#select-split");
        this._selectDisplayLabel = this.shadowRoot.querySelector("#select-display-label");
        this._selectDisplay = this.shadowRoot.querySelector("#select-display");
        this._splitButton = this.shadowRoot.querySelector("#split");
        this._splitButton.addEventListener("click", this._onClickSplitButton.bind(this));
        this._cancelButton = this.shadowRoot.querySelector("#cancel");
        this._cancelButton.addEventListener("click", this._onClickCancelButton.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._title.innerText = this._translateString("Split trace");
        this._selectSplitLabel.innerText = this._translateString("Split from stylesheet");
        this._selectDisplayLabel.innerText = this._translateString("Display with stylesheet");
        this._splitButton.innerText = this._translateString("Split !");
        this._cancelButton.innerText = this._translateString("Cancel");
	}

    /**
     * 
     */
    _onClickSplitButton(event) {
        event.preventDefault();
        event.stopPropagation();

        this.dispatchEvent(
			new CustomEvent("validate-trace-split", {
				bubbles: true,
				cancelable: false,
				composed: true,
				detail : {
					split_stylesheet: this._selectSplit.value,
                    display_styleshhet: this._selectDisplay.value
				}
			})
		);
    }

    /**
     * 
     */
    _onClickCancelButton(event) {
        this.dispatchEvent(
			new CustomEvent("cancel-trace-split", {
				bubbles: true,
				cancelable: false,
				composed: true
			})
		);
    }
}

customElements.define('ktbs4la2-trace-split-dialog', KTBS4LA2TraceSplitDialog);