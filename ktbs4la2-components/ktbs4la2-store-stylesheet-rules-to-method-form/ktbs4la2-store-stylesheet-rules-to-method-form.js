import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import "../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js";
import "../ktbs4la2-multiple-translations-text-input/ktbs4la2-multiple-translations-text-input.js";
import "../ktbs4la2-resource-picker/ktbs4la2-resource-picker.js";
import {Base} from '../../ktbs-api/Base.js';
import {Trace} from '../../ktbs-api/Trace.js';
import {ResourceMultiton} from '../../ktbs-api/ResourceMultiton.js';

import {clean_id_string} from '../common/strings-utils.js';

/**
 * 
 */
class KTBS4LA2StoreStylesheetRulesToMethodForm extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, true);

        if(this.attachInternals)
            this._internals = this.attachInternals();
    }

    /**
     * 
     */
    static formAssociated = true;

    /**
	 * 
	 */
	static get observedAttributes() {
        let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("stylesheet-id");
        _observedAttributes.push("source-trace-uri");
		return _observedAttributes;
    }
    
    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "stylesheet-id") {
            if(newValue) {
                const clean_stylesheet_id = clean_id_string(newValue);
                
                this._componentReady.then(() => {
                    const setAttributePromises = new Array();
                    const method_default_id = "method_created_from_stylesheet_" + clean_stylesheet_id;
                    setAttributePromises.push(this._newMethodIdInput.setAttribute("value", method_default_id));

                    const method_default_label = this._translateString("Method created from stylesheet") + " \"" + newValue + "\"";
                    
                    const method_label_input_value_object = [{
                        lang: this._lang,
                        value: method_default_label
                    }];

                    this._newMethodLabelInput.setAttribute("value", JSON.stringify(method_label_input_value_object));

                    const model_default_id = "model_for_" + method_default_id;
                    setAttributePromises.push(this._newModelIdInput.setAttribute("value", model_default_id));

                    const model_default_label = this._translateString("Model for") + " " + method_default_label;

                    const model_label_input_value_object = [{
                        lang: this._lang,
                        value: model_default_label
                    }];

                    this._newModelLabelInput.setAttribute("value", JSON.stringify(model_label_input_value_object));

                    const computedtrace_default_id = "computed_trace_created_from_stylesheet_" + clean_stylesheet_id;
                    setAttributePromises.push(this._newComputedTraceIdInput.setAttribute("value", computedtrace_default_id));

                    const computedtrace_default_label = this._translateString("Computed trace created from stylesheet") + " \"" + newValue + "\"";

                    const computedtrace_label_input_value_object = [{
                        lang: this._lang,
                        value: computedtrace_default_label
                    }];

                    this._newComputedTraceLabelInput.setAttribute("value", JSON.stringify(computedtrace_label_input_value_object));
                    
                    Promise.all(setAttributePromises)
                        .then(() => {
                            this._updateSubmitButtonState();
                        });
                });
            }
        }

        if(name == "source-trace-uri") {
            if(newValue) {
                const sourceTrace = ResourceMultiton.get_resource(Trace, newValue);

                sourceTrace.get(this._abortController.signal)
                    .then(() => {
                        const default_parent_base = sourceTrace.parent;
                        const default_parent_base_children = default_parent_base.children;
                        const default_parent_base_used_ids = new Array();

                        for(let i = 0; i < default_parent_base_children.length; i++)
                            default_parent_base_used_ids.push(default_parent_base_children[i].id);

                        this._default_parent_base_used_ids_string = default_parent_base_used_ids.join(" ");

                        this._componentReady.then(() => {
                            const resourcePickers = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker");

                            for(let i = 0; i < resourcePickers.length; i++)
                                resourcePickers[i].setAttribute("browse-start-uri", default_parent_base.uri);

                            if(this._form["new-method-parent-base-option"].value == "default")
                                this._newMethodIdInput.setAttribute("reserved-ids", this._default_parent_base_used_ids_string);

                            if(this._form["new-model-parent-base-option"].value == "default")
                                this._newModelIdInput.setAttribute("reserved-ids", this._default_parent_base_used_ids_string);

                            if(this._form["new-computed-trace-parent-base-option"].value == "default")
                                this._newComputedTraceIdInput.setAttribute("reserved-ids", this._default_parent_base_used_ids_string);

                            this._updateSubmitButtonState();
                        });
                    });

                sourceTrace.get_root(this._abortController.signal)
                    .then((sourceTrace_root) => {
                        this._componentReady.then(() => {
                            const resourcePickers = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker");

                            for(let i = 0; i < resourcePickers.length; i++) {
                                resourcePickers[i].setAttribute("root-uri", sourceTrace_root.uri);
                                resourcePickers[i].setAttribute("root-label", sourceTrace_root.label);
                            }

                            this._updateSubmitButtonState();
                        });
                    });
            }
            else {
                this._componentReady.then(() => {
                    const resourcePickers = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker");

                    for(let i = 0; i < resourcePickers.length; i++) {
                        if(resourcePickers[i].hasAttribute("browse-start-uri"))
                            resourcePickers[i].removeAttribute("browse-start-uri");

                        if(resourcePickers[i].hasAttribute("root-uri"))
                            resourcePickers[i].removeAttribute("root-uri");

                        if(resourcePickers[i].hasAttribute("root-label"))
                            resourcePickers[i].removeAttribute("root-label");
                    }

                    this._updateSubmitButtonState();
                });
            }
        }
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._titleTag = this.shadowRoot.querySelector("#title");
        this._form = this.shadowRoot.querySelector("#method-form");
        this._form.addEventListener("submit", this._onSubmit.bind(this));
        this._instanceFieldsetLegend = this.shadowRoot.querySelector("#instance-fieldset-legend");
        this._newMethodInstanceRadioButton = this.shadowRoot.querySelector("#method-instance-new");
        this._newMethodInstanceRadioButton.addEventListener("click", this._onClickNewMethodInstanceRadioButton.bind(this));
        this._newMethodInstanceRadioButtonLabel = this.shadowRoot.querySelector("#method-instance-new-label");
        this._existingMethodRadioButton = this.shadowRoot.querySelector("#method-instance-existing");
        this._existingMethodRadioButton.addEventListener("click", this._onClickExistingMethodInstanceRadioButton.bind(this));
        this._existingMethodRadioButtonLabel = this.shadowRoot.querySelector("#method-instance-existing-label");
        this._newSection = this.shadowRoot.querySelector("#new");
        this._methodSectionTitle = this.shadowRoot.querySelector("#method-section-title");
        this._newMethodIdLabelLabel = this.shadowRoot.querySelector("#new-method-id-label-label");
        this._newMethodIdInput = this.shadowRoot.querySelector("#new-method-id");
        this._newMethodIdInput.setAttribute("lang", this._lang);
        this._newMethodIdInput.addEventListener("change", this._onChangeNewMethodIdInput.bind(this));
        this._newMethodIdInput.addEventListener("input", this._onChangeNewMethodIdInput.bind(this));
        this._newMethodLabelInputLabel = this.shadowRoot.querySelector("#new-method-label-label");
        this._newMethodLabelInput = this.shadowRoot.querySelector("#new-method-label");
        this._newMethodLabelInput.setAttribute("lang", this._lang);
        this._newMethodParentBaseLegend = this.shadowRoot.querySelector("#new-method-parent-base-legend");
        this._newMethodParentBaseDefaultRadioButton = this.shadowRoot.querySelector("#new-method-parent-base-option-default");
        this._newMethodParentBaseDefaultRadioButton.addEventListener("click", this._onClickNewMethodParentBaseDefaultRadioButton.bind(this));
        this._newMethodParentBaseDefaultRadioButtonLabel = this.shadowRoot.querySelector("#new-method-parent-base-option-default-label");
        this._newMethodParentBaseCustomRadioButton = this.shadowRoot.querySelector("#new-method-parent-base-option-custom");
        this._newMethodParentBaseCustomRadioButton.addEventListener("click", this._onClickNewMethodParentBaseCustomRadioButton.bind(this));
        this._newMethodParentBaseCustomRadioButtonLabel = this.shadowRoot.querySelector("#new-method-parent-base-option-custom-label");
        this._newMethodParentBaseCustomUriInput = this.shadowRoot.querySelector("#new-method-parent-base-custom-uri");
        this._newMethodParentBaseCustomUriInput.setAttribute("lang", this._lang);
        this._newMethodParentBaseCustomUriInput.addEventListener("change", this._onChangeNewMethodParentBaseCustomUriInput.bind(this));
        this._newMethodParentBaseCustomUriInput.addEventListener("input", this._onChangeNewMethodParentBaseCustomUriInput.bind(this));
        this._modelSectionTitle = this.shadowRoot.querySelector("#model-section-title");
        this._newModelIdLabelLabel = this.shadowRoot.querySelector("#new-model-id-label-label");
        this._newModelIdInput = this.shadowRoot.querySelector("#new-model-id");
        this._newModelIdInput.setAttribute("lang", this._lang);
        this._newModelIdInput.addEventListener("change", this._onChangeNewModelIdInput.bind(this));
        this._newModelIdInput.addEventListener("input", this._onChangeNewModelIdInput.bind(this));
        this._newModelLabelInputLabel = this.shadowRoot.querySelector("#new-model-label-label");
        this._newModelLabelInput = this.shadowRoot.querySelector("#new-model-label");
        this._newModelLabelInput.setAttribute("lang", this._lang);
        this._newModelParentBaseLegend = this.shadowRoot.querySelector("#new-model-parent-base-legend");
        this._newModelParentBaseDefaultRadioButton = this.shadowRoot.querySelector("#new-model-parent-base-option-default");
        this._newModelParentBaseDefaultRadioButton.addEventListener("click", this._onClickNewModelParentBaseDefaultRadioButton.bind(this));
        this._newModelParentBaseDefaultRadioButtonLabel = this.shadowRoot.querySelector("#new-model-parent-base-option-default-label");
        this._newModelParentBaseCustomRadioButton = this.shadowRoot.querySelector("#new-model-parent-base-option-custom");
        this._newModelParentBaseCustomRadioButton.addEventListener("click", this._onClickNewModelParentBaseCustomRadioButton.bind(this));
        this._newModelParentBaseCustomRadioButtonLabel = this.shadowRoot.querySelector("#new-model-parent-base-option-custom-label");
        this._newModelParentBaseCustomUriInput = this.shadowRoot.querySelector("#new-model-parent-base-custom-uri");
        this._newModelParentBaseCustomUriInput.setAttribute("lang", this._lang);
        this._newModelParentBaseCustomUriInput.addEventListener("change", this._onChangeNewModelParentBaseCustomUriInput.bind(this));
        this._newModelParentBaseCustomUriInput.addEventListener("input", this._onChangeNewModelParentBaseCustomUriInput.bind(this));
        this._existingSection = this.shadowRoot.querySelector("#existing");
        this._existingMethodUriInputLabel = this.shadowRoot.querySelector("#existing-method-uri-label");
        this._existingMethodUriInput = this.shadowRoot.querySelector("#existing-method-uri");
        this._existingMethodUriInput.setAttribute("lang", this._lang);
        this._existingMethodUriInput.addEventListener("change", this._updateSubmitButtonState.bind(this));
        this._existingMethodUriInput.addEventListener("input", this._updateSubmitButtonState.bind(this));
        this._createComputedTraceCheckBox = this.shadowRoot.querySelector("#create-computed-trace");
        this._createComputedTraceCheckBox.addEventListener("change", this._onChangeCreateComputedTraceCheckBox.bind(this));
        this._createComputedTraceLabel = this.shadowRoot.querySelector("#create-computed-trace-label");
        this._computedTraceSection = this.shadowRoot.querySelector("#computed-trace");
        this._computedTraceSectionTitle = this.shadowRoot.querySelector("#computed-trace-section-title");
        this._newComputedTraceIdLabelLabel = this.shadowRoot.querySelector("#new-computed-trace-id-label-label");
        this._newComputedTraceIdInput = this.shadowRoot.querySelector("#new-computed-trace-id");
        this._newComputedTraceIdInput.setAttribute("lang", this._lang);
        this._newComputedTraceIdInput.addEventListener("change", this._onChangeNewComputedTraceIdInput.bind(this));
        this._newComputedTraceIdInput.addEventListener("input", this._onChangeNewComputedTraceIdInput.bind(this));
        this._newComputedTraceLabelInputLabel = this.shadowRoot.querySelector("#new-computed-trace-label-label");
        this._newComputedTraceLabelInput = this.shadowRoot.querySelector("#new-computed-trace-label");
        this._newComputedTraceLabelInput.setAttribute("lang", this._lang);
        this._newComputedTraceParentBaseLegend = this.shadowRoot.querySelector("#new-computed-trace-parent-base-legend");
        this._newComputedTraceParentBaseDefaultRadioButton = this.shadowRoot.querySelector("#new-computed-trace-parent-base-option-default");
        this._newComputedTraceParentBaseDefaultRadioButton.addEventListener("click", this._onClickNewComputedTraceParentBaseDefaultRadioButton.bind(this));
        this._newComputedTraceParentBaseDefaultRadioButtonLabel = this.shadowRoot.querySelector("#new-computed-trace-parent-base-option-default-label");
        this._newComputedTraceParentBaseCustomRadioButton = this.shadowRoot.querySelector("#new-computed-trace-parent-base-option-custom");
        this._newComputedTraceParentBaseCustomRadioButton.addEventListener("click", this._onClickNewComputedTraceParentBaseCustomRadioButton.bind(this));
        this._newComputedTraceParentBaseCustomRadioButtonLabel = this.shadowRoot.querySelector("#new-computed-trace-parent-base-option-custom-label");
        this._newComputedTraceParentBaseCustomUriInput = this.shadowRoot.querySelector("#new-computed-trace-parent-base-custom-uri");
        this._newComputedTraceParentBaseCustomUriInput.setAttribute("lang", this._lang);
        this._newComputedTraceParentBaseCustomUriInput.addEventListener("change", this._onChangeNewComputedTraceParentBaseCustomUriInput.bind(this));
        this._newComputedTraceParentBaseCustomUriInput.addEventListener("input", this._onChangeNewComputedTraceParentBaseCustomUriInput.bind(this));
        this._submitButton = this.shadowRoot.querySelector("#ok");
        this._cancelButton = this.shadowRoot.querySelector("#cancel");
        this._cancelButton.addEventListener("click", this._onClickCancelButton.bind(this));
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _updateMethodCustomParentReservedIds() {
        if(this._newMethodParentBaseCustomUriInput.checkValidity()) {
            const new_method_custom_parent_base_uri = this._newMethodParentBaseCustomUriInput.value;
            const new_method_custom_parent_base = ResourceMultiton.get_resource(Base, new_method_custom_parent_base_uri);

            new_method_custom_parent_base.get(this._abortController.signal)
                .then(() => {
                    const new_method_custom_parent_base_children = new_method_custom_parent_base.children;
                    const new_method_custom_parent_base_used_ids = new Array();

                    for(let i = 0; i < new_method_custom_parent_base_children.length; i++)
                        new_method_custom_parent_base_used_ids.push(new_method_custom_parent_base_children[i].id);

                    const new_method_custom_parent_base_used_ids_string = new_method_custom_parent_base_used_ids.join(" ");

                    if(new_method_custom_parent_base_used_ids_string)  
                        this._newMethodIdInput.setAttribute("reserved-ids", new_method_custom_parent_base_used_ids_string);
                    else if(this._newMethodIdInput.hasAttribute("reserved-ids"))
                        this._newMethodIdInput.removeAttribute("reserved-ids");
                });
        }
        else if(this._newMethodIdInput.hasAttribute("reserved-ids"))
            this._newMethodIdInput.removeAttribute("reserved-ids");
    }

    /**
     * 
     */
    _updateModelCustomParentReservedIds() {
        if(this._newModelParentBaseCustomUriInput.checkValidity()) {
            const new_model_custom_parent_base_uri = this._newModelParentBaseCustomUriInput.value;
            const new_model_custom_parent_base = ResourceMultiton.get_resource(Base, new_model_custom_parent_base_uri);

            new_model_custom_parent_base.get(this._abortController.signal)
                .then(() => {
                    const new_model_custom_parent_base_children = new_model_custom_parent_base.children;
                    const new_model_custom_parent_base_used_ids = new Array();

                    for(let i = 0; i < new_model_custom_parent_base_children.length; i++)
                        new_model_custom_parent_base_used_ids.push(new_model_custom_parent_base_children[i].id);

                    const new_model_custom_parent_base_used_ids_string = new_model_custom_parent_base_used_ids.join(" ");

                    if(new_model_custom_parent_base_used_ids_string)  
                        this._newModelIdInput.setAttribute("reserved-ids", new_model_custom_parent_base_used_ids_string);
                    else if(this._newModelIdInput.hasAttribute("reserved-ids"))
                        this._newModelIdInput.removeAttribute("reserved-ids");
                });
        }
        else if(this._newModelIdInput.hasAttribute("reserved-ids"))
            this._newModelIdInput.removeAttribute("reserved-ids");
    }

    /**
     * 
     */
    _updateComputedTraceCustomParentReservedIds() {
        if(this._newComputedTraceParentBaseCustomUriInput.checkValidity()) {
            const new_computedtrace_custom_parent_base_uri = this._newComputedTraceParentBaseCustomUriInput.value;
            const new_computedtrace_custom_parent_base = ResourceMultiton.get_resource(Base, new_computedtrace_custom_parent_base_uri);

            new_computedtrace_custom_parent_base.get(this._abortController.signal)
                .then(() => {
                    const new_computedtrace_custom_parent_base_children = new_computedtrace_custom_parent_base.children;
                    const new_computedtrace_custom_parent_base_used_ids = new Array();

                    for(let i = 0; i < new_computedtrace_custom_parent_base_children.length; i++)
                        new_computedtrace_custom_parent_base_used_ids.push(new_computedtrace_custom_parent_base_children[i].id);

                    const new_computedtrace_custom_parent_base_used_ids_string = new_computedtrace_custom_parent_base_used_ids.join(" ");

                    if(new_computedtrace_custom_parent_base_used_ids_string)  
                        this._newComputedTraceIdInput.setAttribute("reserved-ids", new_computedtrace_custom_parent_base_used_ids_string);
                    else if(this._newComputedTraceIdInput.hasAttribute("reserved-ids"))
                        this._newComputedTraceIdInput.removeAttribute("reserved-ids");
                });
        }
        else if(this._newComputedTraceIdInput.hasAttribute("reserved-ids"))
            this._newComputedTraceIdInput.removeAttribute("reserved-ids");
    }

    /**
     * 
     */
    _onClickNewMethodInstanceRadioButton(event) {
        if(!this._existingSection.classList.contains("hidden"))
            this._existingSection.classList.add("hidden");

        if(this._newSection.classList.contains("hidden"))
            this._newSection.classList.remove("hidden");

        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onClickExistingMethodInstanceRadioButton(event) {
        if(!this._newSection.classList.contains("hidden"))
            this._newSection.classList.add("hidden");

        if(this._existingSection.classList.contains("hidden"))
            this._existingSection.classList.remove("hidden");

        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onClickNewMethodParentBaseDefaultRadioButton(event) {
        if(!this._newMethodParentBaseCustomUriInput.classList.contains("hidden"))
            this._newMethodParentBaseCustomUriInput.classList.add("hidden");

        if(this._default_parent_base_used_ids_string)
            this._newMethodIdInput.setAttribute("reserved-ids", this._default_parent_base_used_ids_string);
        else if(this._newMethodIdInput.hasAttribute("reserved-ids"))
            this._newMethodIdInput.removeAttribute("reserved-ids");

        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onClickNewMethodParentBaseCustomRadioButton(event) {
        if(this._newMethodParentBaseCustomUriInput.classList.contains("hidden"))
            this._newMethodParentBaseCustomUriInput.classList.remove("hidden");

        this._updateMethodCustomParentReservedIds();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onChangeNewMethodParentBaseCustomUriInput(event) {
        this._updateMethodCustomParentReservedIds();
        this._newMethodParentBaseCustomUriInput.reportValidity();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onClickNewModelParentBaseDefaultRadioButton(event) {
        if(!this._newModelParentBaseCustomUriInput.classList.contains("hidden"))
            this._newModelParentBaseCustomUriInput.classList.add("hidden");

        if(this._default_parent_base_used_ids_string)
            this._newModelIdInput.setAttribute("reserved-ids", this._default_parent_base_used_ids_string);
        else if(this._newMethodIdInput.hasAttribute("reserved-ids"))
            this._newMethodIdInput.removeAttribute("reserved-ids");

        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onClickNewModelParentBaseCustomRadioButton(event) {
        if(this._newModelParentBaseCustomUriInput.classList.contains("hidden"))
            this._newModelParentBaseCustomUriInput.classList.remove("hidden");

        this._updateModelCustomParentReservedIds();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onChangeNewModelParentBaseCustomUriInput(event) {
        this._updateModelCustomParentReservedIds();
        this._newModelParentBaseCustomUriInput.reportValidity();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onChangeCreateComputedTraceCheckBox(event) {
        if(this._createComputedTraceCheckBox.checked) {
            if(this._computedTraceSection.classList.contains("hidden"))
                this._computedTraceSection.classList.remove("hidden");
        }
        else {
            if(!this._computedTraceSection.classList.contains("hidden"))
                this._computedTraceSection.classList.add("hidden");
        }

        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onClickNewComputedTraceParentBaseDefaultRadioButton(event) {
        if(!this._newComputedTraceParentBaseCustomUriInput.classList.contains("hidden"))
            this._newComputedTraceParentBaseCustomUriInput.classList.add("hidden");

        if(this._default_parent_base_used_ids_string)
            this._newComputedTraceIdInput.setAttribute("reserved-ids", this._default_parent_base_used_ids_string);
        else if(this._newComputedTraceIdInput.hasAttribute("reserved-ids"))
            this._newComputedTraceIdInput.removeAttribute("reserved-ids");

        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onClickNewComputedTraceParentBaseCustomRadioButton(event) {
        if(this._newComputedTraceParentBaseCustomUriInput.classList.contains("hidden"))
            this._newComputedTraceParentBaseCustomUriInput.classList.remove("hidden");

        this._updateComputedTraceCustomParentReservedIds();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onChangeNewComputedTraceParentBaseCustomUriInput(event) {
        this._updateComputedTraceCustomParentReservedIds();
        this._newComputedTraceParentBaseCustomUriInput.reportValidity();
        this._updateSubmitButtonState();
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
    checkValidity() {
        let isValid;

        if(this._form["method-instance"].value == "new-method") {
            isValid = this._newMethodIdInput.checkValidity();

            if(
                    (this._form["new-method-parent-base-option"].value != "default") 
                &&  !this._newMethodParentBaseCustomUriInput.checkValidity()
            )
                isValid = false;

            if(!this._newModelIdInput.checkValidity())
                isValid = false;

            if(
                    (this._form["new-model-parent-base-option"].value != "default")
                &&  !this._newModelParentBaseCustomUriInput.checkValidity()
            )
                isValid = false;

            if(this._newMethodIdInput.value == this._newModelIdInput.value) {
                if(isValid)
                    this._newModelIdInput.setCustomValidity(this._translateString("This ID is already used by another resource in the same parent. Please choose a different one."));

                isValid = false;
            }
            else
                this._newModelIdInput.setCustomValidity("");
        }
        else if(this._form["method-instance"].value == "existing-method")
            isValid = this._existingMethodUriInput.checkValidity();
        else
            isValid = false;

        if(this._createComputedTraceCheckBox.checked) {
            if(!this._newComputedTraceIdInput.checkValidity())
                isValid = false;

            if(
                    (this._form["new-computed-trace-parent-base-option"].value != "default")
                &&  !this._newComputedTraceParentBaseCustomUriInput.checkValidity()
            )
                isValid = false;
        }

        if(!isValid)
            this.dispatchEvent(new Event("invalid"), {bubbles: false, cancelable: true});

        return isValid;
    }

    /**
     * 
     */
    reportValidity() {
        let isValid = this.checkValidity();

        if(this._form["method-instance"].value == "new-method") {
            this._newMethodIdInput.reportValidity();

            if(this._form["new-method-parent-base-option"].value != "default") 
                this._newMethodParentBaseCustomUriInput.reportValidity()
            
            this._newModelIdInput.reportValidity();

            if(this._form["new-model-parent-base-option"].value != "default")
                this._newModelParentBaseCustomUriInput.reportValidity();
        }
        else if(this._form["method-instance"].value == "existing-method")
            this._existingMethodUriInput.reportValidity();

        if(this._createComputedTraceCheckBox.checked) {
            this._newComputedTraceIdInput.reportValidity();

            if(this._form["new-computed-trace-parent-base-option"].value != "default")
                this._newComputedTraceParentBaseCustomUriInput.reportValidity();
        }
        
        return isValid;
    }

    /**
     * 
     */
    _onChangeNewMethodIdInput(event) {
        this._newMethodIdInput.reportValidity();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onChangeNewModelIdInput(event) {
        this._newModelIdInput.reportValidity();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _onChangeNewComputedTraceIdInput(event) {
        this._newComputedTraceIdInput.reportValidity();
        this._updateSubmitButtonState();
    }

    /**
     * 
     */
    _updateSubmitButtonState() {
        if(this.checkValidity()) {
            if(this._submitButton.hasAttribute("disabled"))
                this._submitButton.removeAttribute("disabled");
        }
        else
            this._submitButton.setAttribute("disabled", "true");
    }

    /**
     * 
     */
    _onSubmit(event) {
        event.preventDefault();

        const submittedData = {
            "stylesheet-rules-data": JSON.parse(this.getAttribute("stylesheet-rules-data")),
            "source-trace-uri": this.getAttribute("source-trace-uri")
        };

        if(this._form["method-instance"].value == "new-method") {
            submittedData["method-instance"] = "new";
            submittedData["method-id"] = this._newMethodIdInput.value;
            submittedData["method-label"] = this._newMethodLabelInput.value;
            submittedData["method-parent"] = this._form["new-method-parent-base-option"].value;

            if(this._form["new-method-parent-base-option"].value != "default")
                submittedData["method-parent-uri"] = this._newMethodParentBaseCustomUriInput.value;

            submittedData["model-id"] = this._newModelIdInput.value;
            submittedData["model-label"] = this._newModelLabelInput.value;
            submittedData["model-parent"] = this._form["new-model-parent-base-option"].value;

            if(this._form["new-model-parent-base-option"].value != "default")
                submittedData["model-parent-uri"] = this._newModelParentBaseCustomUriInput.value;
        }
        else {
            submittedData["method-instance"] = "existing";
            submittedData["existing-method-uri"] = this._existingMethodUriInput.value
        }

        if(this._createComputedTraceCheckBox.checked) {
            submittedData["create-computed-trace"] = true;
            submittedData["computed-trace-id"] = this._newComputedTraceIdInput.value;
            submittedData["computed-trace-label"] = this._newComputedTraceLabelInput.value;
            submittedData["computed-trace-parent"] = this._form["new-computed-trace-parent-base-option"].value;

            if(this._form["new-computed-trace-parent-base-option"].value != "default")
                submittedData["computed-trace-parent-uri"] = this._newComputedTraceParentBaseCustomUriInput.value;
        }
        else
            submittedData["create-computed-trace"] = false;

		this.dispatchEvent(new CustomEvent("submit", {detail: submittedData}));
    }
}

customElements.define('ktbs4la2-store-stylesheet-rules-to-method-form', KTBS4LA2StoreStylesheetRulesToMethodForm);