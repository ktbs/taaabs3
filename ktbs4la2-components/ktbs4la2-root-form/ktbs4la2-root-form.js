import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import '../ktbs4la2-resource-uri-input/ktbs4la2-resource-uri-input.js';

/**
 * 
 */
class KTBS4LA2RootForm extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._titleH1 = this.shadowRoot.querySelector("#title");
		this._rootForm = this.shadowRoot.querySelector("#root");
		this._rootForm.addEventListener("submit", this._onSubmit.bind(this));
		this._uriLabel = this.shadowRoot.querySelector("#uri-label");
		this._uriInput = this.shadowRoot.querySelector("#uri");
		this._uriInput.setAttribute("lang", this._lang);
		this._uriInput.addEventListener("input", this._onChangeURIValue.bind(this));
		this._uriInput.addEventListener("keyup", this._onKeyUp.bind(this));
		this._uriLabel.addEventListener("click", this._onClickUriLabel.bind(this));
		this._oldUriInput = this.shadowRoot.querySelector("#old_uri");
		this._labelLabel = this.shadowRoot.querySelector("#label-label");
		this._labelInput = this.shadowRoot.querySelector("#label");
		this._okButton = this.shadowRoot.querySelector("#ok");
		this._cancelButton = this.shadowRoot.querySelector("#cancel");
		this._cancelButton.addEventListener("click", this._onClickCancelButton.bind(this));

		this._uriInput._componentReady.then(() => {
			this._uriInput.focus();
		});
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		this._componentReady.then(() => {
			if(this.getAttribute("uri")) {
				this._uriInput.value = this.getAttribute("uri");
				this._oldUriInput.value = this.getAttribute("uri");
				this._okButton.innerText = this._translateString("Save");
				this._titleH1.innerText = this._translateString("Edit kTBS Root");
			}

			if(this.getAttribute("label"))
				this._labelInput.value = this.getAttribute("label");

			this._updateOkButtonState();
		});
	}

	/**
	 * 
	 * @param {*} event 
	 */
	_onChangeURIValue(event) {
		this._updateOkButtonState();
	}

	/**
	 * 
	 */
	_updateOkButtonState() {
		this._componentReady.then(() => {
			this._okButton.disabled = !this._uriInput.checkValidity();
		});
	}

	/**
	 * 
	 * @param {*} event 
	 */
	_onSubmit(event) {
		event.preventDefault();
		this.dispatchEvent(new CustomEvent("submit", {detail: {uri: this._uriInput.value, old_uri: this._oldUriInput.value, label: this._labelInput.value}}));
	}

	/**
	 * 
	 * @param {*} event 
	 */
	_onClickCancelButton(event) {
		this.dispatchEvent(new CustomEvent("cancel"));
	}

	/**
	 * 
	 */
	_onClickUriLabel(event) {
		event.preventDefault();
		this._uriInput.focus();
	}

	/**
	 * 
	 */
	_onKeyUp(event) {
		if((event.keyCode == 13) && (!this._okButton.disabled))
			this._onSubmit(event);
	}

	/**
     * 
     */
    _updateStringsTranslation() {
        if(this.getAttribute("uri")) {
			this._okButton.innerText = this._translateString("Save");
			this._titleH1.innerText = this._translateString("Edit kTBS Root");
		}
		else {
			this._okButton.innerText = this._translateString("Add") + " !";
			this._titleH1.innerText = this._translateString("Add new kTBS Root");
		}

		this._uriInput.setAttribute("lang", this._lang);
		this._uriLabel.innerText = this._translateString("URI");
		this._labelLabel.innerText = this._translateString("Label") + " : ";
		this._labelInput.setAttribute("placeHolder", this._translateString("Label"));
		this._cancelButton.innerText = this._translateString("Cancel");
    }
}

customElements.define('ktbs4la2-root-form', KTBS4LA2RootForm);
