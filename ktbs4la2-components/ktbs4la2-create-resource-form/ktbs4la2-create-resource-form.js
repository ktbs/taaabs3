import { ResourceMultiton } from '../../ktbs-api/ResourceMultiton.js';
import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import '../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js';
import '../ktbs4la2-multiple-translations-text-input/ktbs4la2-multiple-translations-text-input.js';
import '../ktbs4la2-resource-picker/ktbs4la2-resource-picker.js';

/**
 * 
 */
class KTBS4LA2CreateResourceForm extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);

		const parentURISetPromise = new Promise((resolve, reject) => {
			this._resolveParentURISet = resolve;
		});

		const parentTypeSetPromise = new Promise((resolve, reject) => {
			this._resolveParentTypeSet = resolve;
		});

		const parentLabelSetPromise = new Promise((resolve, reject) => {
			this._resolveParentLabelSet = resolve;
			this._rejectParentLabelSet = reject;
		});

		Promise.allSettled([parentURISetPromise, parentTypeSetPromise, parentLabelSetPromise])
			.then(this._onParentParametersSet.bind(this));
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
		_observedAttributes.push("parent-uri");
		_observedAttributes.push("parent-type");
		_observedAttributes.push("parent-label");
		return _observedAttributes;
	}

	/**
	 * 
	 */
	_onParentParametersSet() {
		const parentResource = ResourceMultiton.get_resource(this.getAttribute("parent-type"), this.getAttribute("parent-uri"));

		parentResource.get(this._abortController.signal)
			.then(() => {
				const parentElement = document.createElement("ktbs4la2-main-related-resource");
				parentElement.setAttribute("inactive", "true");
				parentElement.setAttribute("scale", ".75");
				parentElement.setAttribute("uri", parentResource.uri.toString());
				parentElement.setAttribute("resource-type", parentResource.type);

				if(parentResource.label)
					parentElement.setAttribute("label", parentResource.label);

				this._componentReady.then(() => {
					this._parentSpan.appendChild(parentElement);
				});

				parentResource.get_root(this._abortController.signal)
					.then((parentRoot) => {
						this._componentReady.then(() => {
							const resourcePickers = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker");

							for(let i = 0; i < resourcePickers.length; i++) {
								resourcePickers[i].setAttribute("root-uri", parentRoot.uri.toString());

								if(parentRoot.label)
									resourcePickers[i].setAttribute("root-label", parentRoot.label);
							}
						});
					});
			});
	}

	/**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

		if((name == "parent-uri") && newValue) {
			this._resolveParentURISet();

			this._componentReady.then(() => {
				this._parentResourcePathSpan.innerText = newValue;
				const resourcePickers = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker");

				for(let i = 0; i < resourcePickers.length; i++) {
					resourcePickers[i].setAttribute("browse-start-uri", this.getAttribute("parent-uri"));
				}
			});
		}
		else if((name == "parent-type") && newValue)
			this._resolveParentTypeSet();
		else if((name == "parent-label") && newValue)
			this._resolveParentLabelSet();
	}

	/**
	 * 
	 */
	onComponentReady() {
		if(!this.hasAttribute("parent-label"))
			this._rejectParentLabelSet();

		this._resourceForm = this.shadowRoot.querySelector("#resource-form");
		this._resourceForm.addEventListener("submit", this._onSubmitResourceForm.bind(this));
		this._parentReminderLabelSpan = this.shadowRoot.querySelector("#parent-reminder-label");
		this._parentSpan = this.shadowRoot.querySelector("#parent");
		this._parentResourcePathSpan = this.shadowRoot.querySelector("#parent-resource-path");
		this._newResourceIdLabel = this.shadowRoot.querySelector("#new-resource-id-label-aligned");
		this._newResourceIdInput = this.shadowRoot.querySelector("#new-resource-id");
		this._hiddenSpanForIdWidth = this.shadowRoot.querySelector("#hidden-span-for-id-width");
		this._newResourceIdInput.addEventListener("input", this._onChangeIdInputValue.bind(this));
		this._newResourceIdInput.addEventListener("focus", this._newResourceIdInput.select.bind(this._newResourceIdInput));
		this._labelLabel = this.shadowRoot.querySelector("#label-label");
		this._labelFormInput = this.shadowRoot.querySelector("#label");
		this._labelFormInput.setAttribute("lang", this._lang);
		this._labelFormInput.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._labelLabel.addEventListener("click", this._onClickLabelLabel.bind(this));
		this._parentMethodLabel = this.shadowRoot.querySelector("#parent-method-label");
		this._parentMethodLabelSpan = this.shadowRoot.querySelector("#parent-method-label-span");
		this._parentMethodPicker = this.shadowRoot.querySelector("#parent-method");
		this._parentMethodPicker.setAttribute("lang", this._lang);
		this._parentMethodPicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._parentMethodPicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._parentMethodLabel.addEventListener("click", this._onClickParentMethodLabel.bind(this));
		this._traceModelLabelSpan = this.shadowRoot.querySelector("#trace-model-label-span");
		this._traceModelLabel = this.shadowRoot.querySelector("#trace-model-label");
		this._traceModelPicker = this.shadowRoot.querySelector("#trace-model");
		this._traceModelPicker.setAttribute("lang", this._lang);
		this._traceModelPicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._traceModelPicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._traceModelLabel.addEventListener("click", this._onClickTraceModelLabel.bind(this));
		this._originLabel = this.shadowRoot.querySelector("#origin-label");
		this._originInput = this.shadowRoot.querySelector("#origin");
		this._originInput.addEventListener("input", this._updateOkButtonState.bind(this));
		this._sourceTraceLabelSpan = this.shadowRoot.querySelector("#source-trace-label-span");
		this._sourceTraceLabel = this.shadowRoot.querySelector("#source-trace-label");
		this._sourceTracePicker = this.shadowRoot.querySelector("#source-trace");
		this._sourceTracePicker.setAttribute("lang", this._lang);
		this._sourceTracePicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._sourceTracePicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._sourceTraceLabel.addEventListener("click", this._onClickSourceTraceLabel.bind(this));
		this._methodLabelSpan = this.shadowRoot.querySelector("#method-label-span");
		this._methodLabel = this.shadowRoot.querySelector("#method-label");
		this._methodPicker = this.shadowRoot.querySelector("#method");
		this._methodPicker.setAttribute("lang", this._lang);
		this._methodPicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._methodPicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._methodLabel.addEventListener("click", this._onClickMethodLabel.bind(this));
		this._parametersLabel = this.shadowRoot.querySelector("#parameters-label");
		this._parametersTextarea = this.shadowRoot.querySelector("#parameters");
		this._parametersTextarea.addEventListener("input", this._updateOkButtonState.bind(this));

		this._title = this.shadowRoot.querySelector("#title");
		const createTypeString = this.getAttribute("create-type");
		let createTypeLabel;

		switch(createTypeString) {
			case "Base" :
				createTypeLabel = "base";
				break;
			case "StoredTrace" :
				createTypeLabel = "stored trace";
				break;
			case "ComputedTrace" :
				createTypeLabel = "computed trace";
				break;
			case "Model" :
				createTypeLabel = "model";
				break;
			case "Method" :
				createTypeLabel = "method";
				break;
		}

		this._title.innerText = this._translateString("Create a new " + createTypeLabel);
		this._okButton = this.shadowRoot.querySelector("#ok");
		this._cancelButton = this.shadowRoot.querySelector("#cancel");
		this._cancelButton.addEventListener("click", this._onClickCancelButton.bind(this));
		const notApplicableSections = this.shadowRoot.querySelectorAll("section:not(.all):not(." + CSS.escape(createTypeString) + ")");

		for(let i = 0; i < notApplicableSections.length; i++)
			notApplicableSections[i].remove();

		this._newResourceIdInput.focus();
	}

	/**
	 * 
	 * @param {*} event 
	 */
	_onChangeIdInputValue(event) {
		this._hiddenSpanForIdWidth.innerText = this._newResourceIdInput.value;
		const textWidth = this._hiddenSpanForIdWidth.offsetWidth;
		let newInputWidth = (textWidth >= 27)?(textWidth + 3):30;
		this._newResourceIdInput.style.width = newInputWidth + "px";
		this._updateOkButtonState();
	}

	/**
	 * 
	 */
	_onClickCancelButton(event) {
		this.dispatchEvent(new CustomEvent("cancel"));
	}

	/**
	 * 
	 */
	_onSubmitResourceForm(event) {
		event.preventDefault();
		const createType = this.getAttribute("create-type");

		let formData = {
			"create-type": createType,
			"parent-type": this.getAttribute("parent-type"),
			"parent-uri": this.getAttribute("parent-uri"),
			"new-resource-id": this._newResourceIdInput.value
		};

		if((createType == "Base") || (createType == "StoredTrace") || (createType == "ComputedTrace"))
			formData["new-resource-id"] = this._newResourceIdInput.value + "/";

		if(this._labelFormInput.value)
			formData["label"] = this._labelFormInput.value;
		
		if(createType == "StoredTrace")
			formData["trace-model"] = this._traceModelPicker.value;

		if((createType == "StoredTrace") || (createType == "ComputedTrace"))
			formData["origin"] = this._originInput.value;

		if(createType == "ComputedTrace") {
			formData["source-trace"] = this._resourceForm["source-trace"].value;
			formData["method"] = this._methodPicker.value;
		}

		if((createType == "Method") || (createType == "ComputedTrace"))
			formData["parameters"] = this._parametersTextarea.value;

		if(createType == "Method")
			formData["parent-method"] = this._parentMethodPicker.value;

		this.dispatchEvent(new CustomEvent("submit", {detail : formData}));
	}

	/**
	 * 
	 */
	_updateOkButtonState(event) {
		this._componentReady.then(() => {
			const createType = this.getAttribute("create-type");

			this._okButton.disabled = !(
					this._newResourceIdInput.checkValidity()
				&&	((createType != "Method") || this._parentMethodPicker.checkValidity())
				&&	((createType != "StoredTrace") || this._traceModelPicker.checkValidity())
				&&	(((createType != "StoredTrace") && (createType != "ComputedTrace")) || this._originInput.checkValidity())
				&&	((createType != "ComputedTrace") || (this._sourceTracePicker.checkValidity() && this._methodPicker.checkValidity()))
				&&	(((createType != "Method") && (createType != "ComputedTrace")) || this._parametersTextarea.checkValidity())
			);
		});
	}

	/**
	 * 
	 */
	_onClickLabelLabel(event) {
		event.preventDefault();
		this._labelFormInput.focus();
	}

	/** 
	 * 
	 */
	_onClickParentMethodLabel(event) {
		event.preventDefault();
		this._parentMethodPicker.focus();
	}

	/**
	 * 
	 */
	_onClickTraceModelLabel(event) {
		event.preventDefault();
		this._traceModelPicker.focus();
	}

	/**
	 * 
	 */
	_onClickSourceTraceLabel(event) {
		event.preventDefault();
		this._sourceTracePicker.focus();
	}

	/**
	 * 
	 */
	_onClickMethodLabel(event) {
		event.preventDefault();
		this._methodPicker.focus();
	}

	/**
	 * 
	 */
	_onTextInputKeyboardEvent(event) {
		if((event.keyCode == 13) && !this._okButton.disabled)
			this._onSubmitResourceForm(event);
	}

	/**
     * 
     */
    _updateStringsTranslation() {
		const createTypeString = this.getAttribute("create-type");
		let createTypeLabel;

		switch(createTypeString) {
			case "Base" :
				createTypeLabel = "base";
				break;
			case "StoredTrace" :
				createTypeLabel = "stored trace";
				break;
			case "ComputedTrace" :
				createTypeLabel = "computed trace";
				break;
			case "Model" :
				createTypeLabel = "model";
				break;
			case "Method" :
				createTypeLabel = "method";
				break;
		}

		this._title.innerText = this._translateString("Create a new " + createTypeLabel);
		
		this._parentReminderLabelSpan.innerText = this._translateString("Create into");
		this._newResourceIdLabel.innerText = this._translateString("ID");
		this._labelLabel.innerText = this._translateString("Label") + " : ";
		this._labelFormInput.setAttribute("placeholder", this._translateString("Label"));
		this._labelFormInput.setAttribute("lang", this._lang);

		if(this._parentMethodLabelSpan)
			this._parentMethodLabelSpan.innerText = this._translateString("Parent method");

		if(this._parentMethodPicker)
			this._parentMethodPicker.setAttribute("lang", this._lang);

		if(this._traceModelLabelSpan)
			this._traceModelLabelSpan.innerText = this._translateString("Model");

		if(this._traceModelPicker)
			this._traceModelPicker.setAttribute("lang", this._lang);

		if(this._originLabel)
			this._originLabel.innerText = this._translateString("Origin") + " : ";

		if(this._originInput)
			this._originInput.setAttribute("placeholder", this._translateString("Origin"));

		if(this._sourceTraceLabelSpan)
			this._sourceTraceLabelSpan.innerText = this._translateString("Source trace");

		if(this._sourceTracePicker)
			this._sourceTracePicker.setAttribute("lang", this._lang);

		if(this._methodLabelSpan)
			this._methodLabelSpan.innerText = this._translateString("Method");

		if(this._methodPicker)
			this._methodPicker.setAttribute("lang", this._lang);

		if(this._parametersLabel)
			this._parametersLabel.innerText = this._translateString("Parameters") + " : ";

		this._okButton.innerText = this._translateString("Create");
		this._cancelButton.innerText = this._translateString("Cancel");
	}
}

customElements.define('ktbs4la2-create-resource-form', KTBS4LA2CreateResourceForm);
