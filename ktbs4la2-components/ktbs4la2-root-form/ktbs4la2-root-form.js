import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

class KTBS4LA2RootForm extends TemplatedHTMLElement {
	constructor() {
		super(import.meta.url, true);
	}

	onComponentReady() {
		this.titleH1 = this.shadowRoot.querySelector("#title");
		this.rootForm = this.shadowRoot.querySelector("#root");
		this.rootForm.addEventListener("submit", this.onSubmit.bind(this));
		this.uriInput = this.shadowRoot.querySelector("#uri");
		this.uriInput.addEventListener("input", this.onChangeURIValue.bind(this));
		this.oldUriInput = this.shadowRoot.querySelector("#old_uri");
		this.labelInput = this.shadowRoot.querySelector("#label");
		this.okButton = this.shadowRoot.querySelector("#ok");
		this.cancelButton = this.shadowRoot.querySelector("#cancel");
		this.cancelButton.addEventListener("click", this.onClickCancelButton.bind(this));
		this.updateOkButtonState();
	}

	connectedCallback() {
		super.connectedCallback();

		this._componentReady.then(() => {
			if(this.getAttribute("uri")) {
				this.uriInput.value = this.getAttribute("uri");
				this.oldUriInput.value = this.getAttribute("uri");
				this.okButton.innerText = this._translateString("Save");
				this.titleH1.innerText = this._translateString("Edit kTBS Root");
			}

			if(this.getAttribute("label"))
				this.labelInput.value = this.getAttribute("label");

			this.updateOkButtonState();
		});
	}

	onChangeURIValue(event) {
		this.updateOkButtonState();
	}

	updateOkButtonState() {
		if(this.uriInput.checkValidity())
			this.okButton.disabled = false;
		else
			this.okButton.disabled = true;
	}

	onSubmit(event) {
		event.preventDefault();
		this.dispatchEvent(new CustomEvent("submit", {detail: {uri: this.uriInput.value, old_uri: this.oldUriInput.value, label: this.labelInput.value}}));
	}

	onClickCancelButton(event) {
		this.dispatchEvent(new CustomEvent("cancel"));
	}
}

customElements.define('ktbs4la2-root-form', KTBS4LA2RootForm);
