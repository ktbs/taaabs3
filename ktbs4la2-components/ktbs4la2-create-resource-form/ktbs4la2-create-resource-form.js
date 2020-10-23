import {ResourceMultiton} from '../../ktbs-api/ResourceMultiton.js';
import {Method} from '../../ktbs-api/Method.js';
import {Trace} from '../../ktbs-api/Trace.js';

import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import '../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js';
import '../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js';
import '../ktbs4la2-multiple-translations-text-input/ktbs4la2-multiple-translations-text-input.js';
import '../ktbs4la2-resource-picker/ktbs4la2-resource-picker.js';
import '../ktbs4la2-multiple-resources-picker/ktbs4la2-multiple-resources-picker.js';
import '../ktbs4la2-method-parameters-input/ktbs4la2-method-parameters-input.js';


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

				let childrenIDs = new Array();

				for(let i = 0; i < parentResource.children.length; i++)
					childrenIDs.push(parentResource.children[i].id);

				if(childrenIDs.length > 0)
					this._componentReady.then(() => {
						this._idInput.setAttribute("reserved-ids", childrenIDs.join(" "));
					});

				parentResource.get_root(this._abortController.signal)
					.then((parentRoot) => {
						this._componentReady.then(() => {
							const resourcePickers = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker, ktbs4la2-multiple-resources-picker");

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
				this._idInput.setAttribute("parent-resource-path", newValue);
				const resourcePickers = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker, ktbs4la2-multiple-resources-picker");

				for(let i = 0; i < resourcePickers.length; i++) {
					resourcePickers[i].setAttribute("browse-start-uri", newValue);
				}

				this._parametersInput.setAttribute("parent-base-uri", newValue);
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
		this._idLabel = this.shadowRoot.querySelector("#new-resource-id-label");
		this._idLabelSpan = this.shadowRoot.querySelector("#new-resource-id-label-label");
		this._idInput = this.shadowRoot.querySelector("#new-resource-id");
		this._idLabel.addEventListener("click", this._onClickIdLabel.bind(this));
		this._idInput.addEventListener("input", this._updateOkButtonState.bind(this));
		this._idInput.addEventListener("change", this._updateOkButtonState.bind(this));
		this._labelLabel = this.shadowRoot.querySelector("#label-label");
		this._labelFormInput = this.shadowRoot.querySelector("#label");
		this._labelFormInput.setAttribute("lang", this._lang);
		this._labelFormInput.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._labelFormInput.addEventListener("input", this._updateOkButtonState.bind(this));
		this._labelFormInput.addEventListener("change", this._updateOkButtonState.bind(this));
		this._labelLabel.addEventListener("click", this._onClickLabelLabel.bind(this));
		this._parentMethodLabel = this.shadowRoot.querySelector("#parent-method-label");
		this._parentMethodLabelSpan = this.shadowRoot.querySelector("#parent-method-label-span");
		this._parentMethodPicker = this.shadowRoot.querySelector("#parent-method");
		this._parentMethodPicker.setAttribute("lang", this._lang);
		this._parentMethodPicker.addEventListener("input", this._onParentMethodPickerChange.bind(this));
		this._parentMethodPicker.addEventListener("change", this._onParentMethodPickerChange.bind(this));
		this._parentMethodPicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._parentMethodLabel.addEventListener("click", this._onClickParentMethodLabel.bind(this));
		this._traceModelLabelSpan = this.shadowRoot.querySelector("#trace-model-label-span");
		this._traceModelLabel = this.shadowRoot.querySelector("#trace-model-label");
		this._traceModelPicker = this.shadowRoot.querySelector("#trace-model");
		this._traceModelPicker.setAttribute("lang", this._lang);
		this._traceModelPicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._traceModelPicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._traceModelPicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._traceModelPicker.addEventListener("change", this._updateOkButtonState.bind(this));
		this._traceModelLabel.addEventListener("click", this._onClickTraceModelLabel.bind(this));
		this._originLabel = this.shadowRoot.querySelector("#origin-label");
		this._originInput = this.shadowRoot.querySelector("#origin");
		this._originInput.addEventListener("input", this._updateOkButtonState.bind(this));
		this._originInput.addEventListener("change", this._updateOkButtonState.bind(this));
		this._sourceTraceDiv = this.shadowRoot.querySelector("#source-trace");
		this._sourceTraceMethodNotSetLabel = this.shadowRoot.querySelector("#source-trace-method-not-set-label");
		this._sourceTraceMethodNotSetMessageSpan = this.shadowRoot.querySelector("#source-trace-method-not-set-message");
		this._singleSourceTraceLabelSpan = this.shadowRoot.querySelector("#single-source-trace-label-span");
		this._singleSourceTraceLabel = this.shadowRoot.querySelector("#single-source-trace-label");
		this._singleSourceTracePicker = this.shadowRoot.querySelector("#single-source-trace");
		this._singleSourceTracePicker.setAttribute("lang", this._lang);
		this._singleSourceTracePicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._singleSourceTracePicker.addEventListener("change", this._updateOkButtonState.bind(this));
		this._singleSourceTracePicker.addEventListener("input", this._onSingleSourceTracePickerEvent.bind(this));
		this._singleSourceTracePicker.addEventListener("change", this._onSingleSourceTracePickerEvent.bind(this));
		this._singleSourceTracePicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._singleSourceTraceLabel.addEventListener("click", this._onClickSourceTraceLabel.bind(this));
		this._multipleSourceTracesLabelSpan = this.shadowRoot.querySelector("#multiple-source-traces-label-span");
		this._multipleSourceTracesLabel = this.shadowRoot.querySelector("#multiple-source-traces-label");
		this._multipleSourceTracesPicker = this.shadowRoot.querySelector("#multiple-source-traces");
		this._multipleSourceTracesPicker.setAttribute("lang", this._lang);
		this._multipleSourceTracesPicker.addEventListener("input", this._updateParametersMultipleModel.bind(this));
		this._multipleSourceTracesPicker.addEventListener("change", this._updateParametersMultipleModel.bind(this));
		this._multipleSourceTracesPicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._multipleSourceTracesLabel.addEventListener("click", this._onClickMultipleSourceTracesLabel.bind(this));
		this._methodLabelSpan = this.shadowRoot.querySelector("#method-label-span");
		this._methodLabel = this.shadowRoot.querySelector("#method-label");
		this._methodPicker = this.shadowRoot.querySelector("#method");
		this._methodPicker.setAttribute("lang", this._lang);
		this._methodPicker.addEventListener("keyup", this._onTextInputKeyboardEvent.bind(this));
		this._methodPicker.addEventListener("input", this._onMethodChange.bind(this));
		this._methodPicker.addEventListener("change", this._onMethodChange.bind(this));
		this._methodPicker.addEventListener("input", this._updateOkButtonState.bind(this));
		this._methodPicker.addEventListener("change", this._updateOkButtonState.bind(this));
		this._methodLabel.addEventListener("click", this._onClickMethodLabel.bind(this));
		this._parametersLabel = this.shadowRoot.querySelector("#parameters-label");
		this._parametersInput = this.shadowRoot.querySelector("#parameters");
		this._parametersInput.setAttribute("lang", this._lang);
		this._parametersInput.addEventListener("input", this._updateOkButtonState.bind(this));
		this._parametersInput.addEventListener("change", this._updateOkButtonState.bind(this));
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
		this._idInput.setAttribute("force-trailing-slash", ((this.getAttribute("create-type") == "Base") || (this.getAttribute("create-type") == "StoredTrace") || (this.getAttribute("create-type") == "ComputedTrace")));
		
		this._idInput._componentReady.then(() => {
			this._idInput.focus();
		});
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
			"new-resource-id": this._idInput.value
		};

		if((createType == "Base") || (createType == "StoredTrace") || (createType == "ComputedTrace"))
			formData["new-resource-id"] = this._idInput.value + "/";

		if(this._labelFormInput.value)
			formData["label"] = this._labelFormInput.value;
		
		if(createType == "StoredTrace") {
			formData["trace-model"] = this._traceModelPicker.value;
			formData["origin"] = this._originInput.value;
		}

		if(createType == "ComputedTrace") {
			formData["method"] = this._methodPicker.value;

			if(this._sourceTraceDiv.className == "single")
				formData["source-trace"] = this._singleSourceTracePicker.value;
			else if(this._sourceTraceDiv.className == "multiple")
				formData["source-trace"] = JSON.parse(this._multipleSourceTracesPicker.value);
		}

		if((createType == "Method") || (createType == "ComputedTrace"))
			formData["parameters"] = JSON.parse(this._parametersInput.value);

		if(createType == "Method")
			formData["parent-method"] = this._parentMethodPicker.value;

		this.dispatchEvent(new CustomEvent("submit", {detail : formData}));
	}

	/**
	 * 
	 */
	_updateOkButtonState(event) {
		let formIsValid;
		const createType = this.getAttribute("create-type");

		if(["Base", "Model", "StoredTrace", "Method", "ComputedTrace"].includes(createType)) {
			formIsValid = true;
			let formElementsToValidate = [this._idInput, this._labelFormInput];
			
			switch(createType) {
				case "StoredTrace" :
					formElementsToValidate.push(this._traceModelPicker);
					formElementsToValidate.push(this._originInput);
					break;
				case "Method" :
					formElementsToValidate.push(this._parentMethodPicker);
					formElementsToValidate.push(this._parametersInput);
					break;
				case "ComputedTrace" :
					formElementsToValidate.push(this._methodPicker);

					if(this._sourceTraceDiv.className == "single")
						formElementsToValidate.push(this._singleSourceTracePicker);
					else if(this._sourceTraceDiv.className == "multiple")
						formElementsToValidate.push(this._multipleSourceTracesPicker);
					else if(this._sourceTraceDiv.className == "notset")
						formIsValid = false;

					formElementsToValidate.push(this._parametersInput);
					break;
			}

			for(let i = 0; formIsValid && (i < formElementsToValidate.length); i++)
				formIsValid = formElementsToValidate[i].checkValidity();
		}
		else
			formIsValid = false;

		this._okButton.disabled = !formIsValid;
	}

	/**
	 *  
	 */
	_onClickIdLabel(event) {
		event.preventDefault();
		this._idInput.focus();
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
		this._singleSourceTracePicker.focus();
	}

	/**
	 * 
	 */
	_onClickMultipleSourceTracesLabel(event) {
		event.preventDefault();
		this._multipleSourceTracesPicker.focus();
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
		this._idLabelSpan.innerText = this._translateString("ID");
		this._labelLabel.innerText = this._translateString("Label") + " : ";
		this._labelFormInput.setAttribute("placeholder", this._translateString("Label"));
		this._labelFormInput.setAttribute("lang", this._lang);
		this._parentMethodLabelSpan.innerText = this._translateString("Parent method");
		this._parentMethodPicker.setAttribute("lang", this._lang);
		this._traceModelLabelSpan.innerText = this._translateString("Model");
		this._traceModelPicker.setAttribute("lang", this._lang);
		this._originLabel.innerText = this._translateString("Origin") + " : ";
		this._originInput.setAttribute("placeholder", this._translateString("Origin"));
		this._sourceTraceMethodNotSetLabel.innerText = this._translateString("Source trace(s) :");
		this._sourceTraceMethodNotSetMessageSpan.innerText = this._translateString("You have to choose a method first.");
		this._singleSourceTraceLabelSpan.innerText = this._translateString("Source trace");
		this._singleSourceTracePicker.setAttribute("lang", this._lang);
		this._multipleSourceTracesLabelSpan.innerText = this._translateString("Source traces");
		this._multipleSourceTracesPicker.setAttribute("lang", this._lang);
		this._methodLabelSpan.innerText = this._translateString("Method");
		this._methodPicker.setAttribute("lang", this._lang);
		this._parametersLabel.innerText = this._translateString("Parameters") + " : ";
		this._parametersInput.setAttribute("lang", this._lang);
		this._okButton.innerText = this._translateString("Create");
		this._cancelButton.innerText = this._translateString("Cancel");
	}

	/**
	 * 
	 * \param Event event 
	 * \protected
	 */
	_onParentMethodPickerChange(event) {
		if(this._parentMethodPicker.checkValidity()) {
			const parentMethodPicker_value = this._parentMethodPicker.value;

			if(parentMethodPicker_value)
				this._parametersInput.setAttribute("method-uri", parentMethodPicker_value);
			else if(this._parametersInput.hasAttribute("method-uri"))
				this._parametersInput.removeAttribute("method-uri");
		}
		else {
			if(this._parametersInput.hasAttribute("method-uri"))
				this._parametersInput.removeAttribute("method-uri");
		}
	}

	/**
	 * 
	 */
	_onMethodChange(event) {
		if(this._methodPicker.checkValidity()) {
			const methodPicker_value = this._methodPicker.value;

			if(methodPicker_value)
				this._parametersInput.setAttribute("method-uri", methodPicker_value);
			else if(this._parametersInput.hasAttribute("method-uri"))
				this._parametersInput.removeAttribute("method-uri");

			let method;

			if(Method.builtin_methods_ids.includes(methodPicker_value))
				method = Method.getBuiltinMethod(methodPicker_value);
			else
				method = ResourceMultiton.get_resource(Method, methodPicker_value);

			method.get_methods_hierarchy(this._abortController.signal)
				.then(() => {
					if(method.source_traces_cardinality == "1")
						this._sourceTraceDiv.className = "single";
					else if(method.source_traces_cardinality == "*")
						this._sourceTraceDiv.className = "multiple";

					this._updateOkButtonState();
				}) 
				.catch((error) => {
					this._sourceTraceDiv.className = "notset";
					this._updateOkButtonState();
				});
		}
		else {
			this._sourceTraceDiv.className = "notset";

			if(this._parametersInput.hasAttribute("method-uri"))
				this._parametersInput.removeAttribute("method-uri");

			this._updateOkButtonState();
		}
	}

	/**
	 * 
	 */
	_onSingleSourceTracePickerEvent(event) {
		if(this._singleSourceTracePicker.checkValidity()) {
			const singleSourceTracePicker_value = this._singleSourceTracePicker.value;

			if(singleSourceTracePicker_value) {
				const sourceTrace = ResourceMultiton.get_resource(Trace, singleSourceTracePicker_value);
				
				sourceTrace.get(this._abortController.signal)
					.then(() => {
						this._parametersInput.setAttribute("default-model-uri", sourceTrace.model.uri);
					})
					.catch((error) => {
						this.emitErrorEvent(error);

						if(this._parametersInput.hasAttribute("default-model-uri"))
							this._parametersInput.removeAttribute("default-model-uri");
					});
			}
			else if(this._parametersInput.hasAttribute("default-model-uri"))
				this._parametersInput.removeAttribute("default-model-uri");
		}
		else if(this._parametersInput.hasAttribute("default-model-uri"))
			this._parametersInput.removeAttribute("default-model-uri");
	}

	/**
	 * 
	 */
	_updateParametersMultipleModel(event) {
		const source_traces_uris = this._multipleSourceTracesPicker.value.split(" ").filter(Boolean);
		let source_traces_promises = new Array();
		let source_traces_models = new Array();

		for(let i = 0; i < source_traces_uris.length; i++) {
			const aSourceTrace = ResourceMultiton.get_resource(Trace, source_traces_uris[i]);
			const aSourceTraceGetPromise = aSourceTrace.get(this._abortController.signal);

			aSourceTraceGetPromise
				.then(() => {
					source_traces_models.push(aSourceTrace.model);
				})
				.catch((error) => {
					this.emitErrorEvent(error);
				});

			source_traces_promises.push(aSourceTraceGetPromise);
		}

		Promise.allSettled(source_traces_promises)
			.then(() => {
				let hasVariousSourceTracesModels = false;

				for(let i = 1; !hasVariousSourceTracesModels && (i < source_traces_models.length); i++)
					hasVariousSourceTracesModels = (source_traces_models[i] != source_traces_models[i - 1]);

				if(hasVariousSourceTracesModels) {
					if(!this._parametersInput.hasAttribute("has-various-source-traces-models"))
						this._parametersInput.setAttribute("has-various-source-traces-models", true);
				}
				else {
					if(this._parametersInput.hasAttribute("has-various-source-traces-models"))
						this._parametersInput.removeAttribute("has-various-source-traces-models");
				}

				setTimeout(() => {
					this._updateOkButtonState();
				});
			});
	}
}

customElements.define('ktbs4la2-create-resource-form', KTBS4LA2CreateResourceForm);
