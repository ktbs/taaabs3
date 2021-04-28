import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";
import {Resource} from "../../ktbs-api/Resource.js";
import {Trace, StoredTrace} from "../../ktbs-api/Trace.js";
import {Method} from "../../ktbs-api/Method.js";
import {Model} from "../../ktbs-api/Model.js";
import * as KTBSErrors from "../../ktbs-api/Errors.js";

import "../ktbs4la2-main-subsection/ktbs4la2-main-subsection.js";
import "../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js";
import "../ktbs4la2-model-diagram/ktbs4la2-model-diagram.js";
import "../ktbs4la2-trace-stats/ktbs4la2-trace-stats.js";
import "../ktbs4la2-icon-tabs/ktbs4la2-icon-tabs-group.js";
import "../ktbs4la2-trace-table/ktbs4la2-trace-table.js";
import "../ktbs4la2-trace-timeline/ktbs4la2-trace-timeline.js";

import "../ktbs4la2-multiple-translations-text-input/ktbs4la2-multiple-translations-text-input.js";
import "../ktbs4la2-resource-picker/ktbs4la2-resource-picker.js";
import "../ktbs4la2-multiple-resources-picker/ktbs4la2-multiple-resources-picker.js";
import "../ktbs4la2-method-parameters-input/ktbs4la2-method-parameters-input.js";

/**
 * 
 */
class KTBS4LA2MainResource extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);
        this._resourceStatusString = "Pending...";
        this._bindedOnBeforeUnloadWindowMethod = this._onBeforeUnloadWindow.bind(this);
        this._bindedOnBeforeRemoveMethod = this._onBeforeRemove.bind(this);
	}

	/**
	 * 
	 */
	onComponentReady() {
        this._containerDiv = this.shadowRoot.querySelector("#container");
        let breadcrumbsStylesheetURL = import.meta.url.substr(0, import.meta.url.lastIndexOf('/')) + '/breadcrumbs.css';
		let breadcrumbsStyleLink = document.createElement("link");
		breadcrumbsStyleLink.setAttribute("rel", "stylesheet");
		breadcrumbsStyleLink.setAttribute("href", breadcrumbsStylesheetURL);
		this.appendChild(breadcrumbsStyleLink);
        this._header = this.shadowRoot.querySelector("#header");
        this._titleTag = this.shadowRoot.querySelector("#title");
        this._editLabelInput = this.shadowRoot.querySelector("#edit-label-input");
        this._editLabelInput.setAttribute("lang", this._lang);
        this._linkTag = this.shadowRoot.querySelector("#resource-link");		
		this._resourceTypeLabel = this.shadowRoot.querySelector("#resource-type-label");
		this._resourceStatusTag = this.shadowRoot.querySelector("#resource-status");
        this._resourceStatusLabel = this.shadowRoot.querySelector("#resource-status-label");
        this._resourceDescription = this.shadowRoot.querySelector("#resource-description");
        this._errorMessageDiv = this.shadowRoot.querySelector("#error-message");
        this._versionTag = this.shadowRoot.querySelector("#root-version");
        this._commentTag = this.shadowRoot.querySelector("#root-comment");
        this._foldHeaderButton = this.shadowRoot.querySelector("#fold-header-button");
        this._foldHeaderButton.addEventListener("click", this._onClickFoldHeaderButton.bind(this))
        this._rootBuiltinMethodList = this.shadowRoot.querySelector("#root-builin-methods");
        this._editButton = this.shadowRoot.querySelector("#tool-edit");
		this._editButton.addEventListener("click", this._onClickEditButton.bind(this));
		this._removeButton = this.shadowRoot.querySelector("#tool-remove");
        this._removeButton.addEventListener("click", this._onClickRemoveButton.bind(this));
        this._saveModificationsButton = this.shadowRoot.querySelector("#tool-save-modifications");
        this._saveModificationsButton.addEventListener("click", this._onClickSaveModificationsButton.bind(this));
        this._cancelModificationsButton = this.shadowRoot.querySelector("#tool-cancel-modifications");
        this._cancelModificationsButton.addEventListener("click", this._onClickCancelModificationsButton.bind(this));
        this._disconnectButton = this.shadowRoot.querySelector("#disconnect-button");
        this._disconnectButton.addEventListener("click", this._onClickDisconnectButton.bind(this));
        this._aboutSection = this.shadowRoot.querySelector("#resource-about");
        this._toggleAboutVisibilityButton = this.shadowRoot.querySelector("#resource-about-toggle");
        this._toggleAboutVisibilityButton.addEventListener("click", this._onClickToggleAboutVisibilityButton.bind(this));
        this._versionLabel = this.shadowRoot.querySelector("#version-label");
        this._rootBuilinMethodsHeader = this.shadowRoot.querySelector("#root-builin-methods-header");
        this._childBasesSubsection = this.shadowRoot.querySelector("#child-bases");
        this._childModelsSubsection = this.shadowRoot.querySelector("#child-models");
		this._childStoredTracesSubsection = this.shadowRoot.querySelector("#child-stored-traces");
		this._childMethodsSubsection = this.shadowRoot.querySelector("#child-methods");
        this._childComputedTracesSubsection = this.shadowRoot.querySelector("#child-computed-traces");
        this._resourceDataSubsection = this.shadowRoot.querySelector("#resource-data");
        this._parentMethodLabel = this.shadowRoot.querySelector("#parent-method-label");
        this._parentMethodPicker = this.shadowRoot.querySelector("#parent-method-picker");
        this._parentMethodPicker.setAttribute("lang", this._lang);
        this._parentMethodPicker.addEventListener("input", this._updateSaveButtonState.bind(this));
		this._parentMethodPicker.addEventListener("change", this._updateSaveButtonState.bind(this));
        this._parentMethodPicker.addEventListener("input", this._onParentMethodPickerChange.bind(this));
		this._parentMethodPicker.addEventListener("change", this._onParentMethodPickerChange.bind(this));
        this._modelLabel = this.shadowRoot.querySelector("#model-label");
        this._modelPicker = this.shadowRoot.querySelector("#model-picker");
        this._modelPicker.setAttribute("lang", this._lang);
        this._modelPicker.addEventListener("input", this._updateSaveButtonState.bind(this));
		this._modelPicker.addEventListener("change", this._updateSaveButtonState.bind(this));
        this._originLabel = this.shadowRoot.querySelector("#origin-label");
        this._originDisplaySpan = this.shadowRoot.querySelector("#origin-display");
        this._originInput = this.shadowRoot.querySelector("#origin-input");
        this._originInput.addEventListener("input", this._updateSaveButtonState.bind(this));
		this._originInput.addEventListener("change", this._updateSaveButtonState.bind(this));
        this._methodLabel = this.shadowRoot.querySelector("#method-label");
        this._methodPicker = this.shadowRoot.querySelector("#method-picker");
        this._methodPicker.setAttribute("lang", this._lang);
        this._methodPicker.addEventListener("input", this._onMethodChange.bind(this));
		this._methodPicker.addEventListener("change", this._onMethodChange.bind(this));
        this._sourceTracesP = this.shadowRoot.querySelector("#source-traces");
        this._singleSourceTraceLabel = this.shadowRoot.querySelector("#single-source-trace-label");
        this._singleSourceTracePicker = this.shadowRoot.querySelector("#single-source-trace-picker");
        this._singleSourceTracePicker.setAttribute("lang", this._lang);
        this._singleSourceTracePicker.addEventListener("input", this._updateSaveButtonState.bind(this));
		this._singleSourceTracePicker.addEventListener("change", this._updateSaveButtonState.bind(this));
		this._singleSourceTracePicker.addEventListener("input", this._onSingleSourceTracePickerEvent.bind(this));
		this._singleSourceTracePicker.addEventListener("change", this._onSingleSourceTracePickerEvent.bind(this));
        this._multipleSourceTracesLabel = this.shadowRoot.querySelector("#multiple-source-traces-label");
        this._multipleSourceTracesPicker = this.shadowRoot.querySelector("#multiple-source-traces-picker");
        this._multipleSourceTracesPicker.setAttribute("lang", this._lang);
        this._multipleSourceTracesPicker.addEventListener("input", this._updateParametersMultipleModel.bind(this));
		this._multipleSourceTracesPicker.addEventListener("change", this._updateParametersMultipleModel.bind(this));
        this._modelSubsection = this.shadowRoot.querySelector("#model");
        this._parametersLabel = this.shadowRoot.querySelector("#parameters-label");
        this._parametersInput = this.shadowRoot.querySelector("#parameters-input");
        this._parametersInput.setAttribute("lang", this._lang);
        this._parametersInput.addEventListener("input", this._updateSaveButtonState.bind(this));
		this._parametersInput.addEventListener("change", this._updateSaveButtonState.bind(this));
        this._obselsSubsection = this.shadowRoot.querySelector("#obsels");
        this._timelineTab = this.shadowRoot.querySelector("#timeline-tab");
        this._tableTab = this.shadowRoot.querySelector("#table-tab");
        this._statsSubsection = this.shadowRoot.querySelector("#stats");
        this._authErrorMessage = this.shadowRoot.querySelector("#auth-error-message");
        this._userNameInput = this.shadowRoot.querySelector("#username");
        this._userNameInput.setAttribute("autocomplete", this.getAttribute("uri") + " username");
        this._userNameInput.addEventListener("input", this._updateValidateAuthButtonState.bind(this));
        this._passwordInput = this.shadowRoot.querySelector("#password");
        this._passwordInput.setAttribute("autocomplete", this.getAttribute("uri") + " current-password")
        this._passwordInput.addEventListener("input", this._updateValidateAuthButtonState.bind(this));
        this._validateAuthButton = this.shadowRoot.querySelector("#validate-authentication");
        this._authenticationForm  = this.shadowRoot.querySelector("#authentication-form");
        this._authenticationForm.setAttribute("action", this.getAttribute("uri"));
        this._authenticationForm.addEventListener("submit", this._onsubmitAuthenticationForm.bind(this))
        this._addBaseButton = this.shadowRoot.querySelector("#add-base-button");
        this._addBaseButton.addEventListener("click", this._onClickAddBaseButton.bind(this));
        this._addModelButton = this.shadowRoot.querySelector("#add-model-button");
        this._addModelButton.addEventListener("click", this._onClickAddModelButton.bind(this));
        this._addStoredTraceButton = this.shadowRoot.querySelector("#add-storedtrace-button");
        this._addStoredTraceButton.addEventListener("click", this._onClickAddStoredTraceButton.bind(this));
        this._addMethodButton = this.shadowRoot.querySelector("#add-method-button");
        this._addMethodButton.addEventListener("click", this._onClickAddMethodButton.bind(this));
        this._addComputedTraceButton = this.shadowRoot.querySelector("#add-computedtrace-button");
        this._addComputedTraceButton.addEventListener("click", this._onClickAddComputedTraceButton.bind(this));
    }

    /**
     * 
     * \param String newResource_type 
     */
    _requestCreateResource(newResource_type) {
        this.dispatchEvent(new CustomEvent("request-create-ktbs-resource", {
            bubbles: true, 
            cancelable: true,
            detail: {
                "parent-type": this.getAttribute("resource-type"),
                "parent-uri": this.getAttribute("uri"),
                "create-type": newResource_type
            }
        }));
    }

    /**
     * 
     * \param Event event 
     */
    _onClickAddBaseButton(event) {
        this._requestCreateResource("Base");
    }

    /**
     * 
     * \param Event event 
     */
    _onClickAddModelButton(event) {
        this._requestCreateResource("Model");
    }

    /**
     * 
     * \param Event event 
     */
    _onClickAddStoredTraceButton(event) {
        this._requestCreateResource("StoredTrace");
    }

    /**
     * 
     * \param Event event 
     */
    _onClickAddMethodButton(event) {
        this._requestCreateResource("Method");
    }

    /**
     * 
     * \param Event event 
     */
    _onClickAddComputedTraceButton(event) {
        this._requestCreateResource("ComputedTrace");
    }
    
    /**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri") {
			this._componentReady.then(() => {
                this._linkTag.href = newValue;
                this._linkTag.innerText = newValue;

                if(this._titleTag.innerText == "")
                    this._titleTag.innerText = Resource.extract_relative_id(newValue);
            });
        }
        else if(attributeName == "label") {
            this._componentReady.then(() => {
                this._titleTag.innerText = newValue;
            });
        }
        else if(attributeName == "resource-type") {
            this._componentReady.then(() => {
                this._resourceTypeLabel.innerText = this._translateString(KTBS4LA2MainResource._getResourceTypeLabel(newValue));

                if((newValue == "ComputedTrace") || (newValue == "StoredTrace")) {
                    let obselsTimelineElement = document.createElement("ktbs4la2-trace-timeline");
                    obselsTimelineElement.setAttribute("uri", this.getAttribute("uri"));
                    obselsTimelineElement.setAttribute("slot", "obsels-timeline");
                    obselsTimelineElement.style.height = "400px";
                    this.appendChild(obselsTimelineElement);

                    let obselsTableElement = document.createElement("ktbs4la2-trace-table");
                    obselsTableElement.setAttribute("uri", this.getAttribute("uri"));
                    obselsTableElement.setAttribute("slot", "obsels-table");
                    obselsTableElement.style.height = "400px";
                    this.appendChild(obselsTableElement);

                    let statsElement = document.createElement("ktbs4la2-trace-stats");
                    statsElement.setAttribute("uri", this.getAttribute("uri"));
                    statsElement.setAttribute("slot", "stats");
                    this.appendChild(statsElement);
                }
            });
        }
        else if(attributeName == "fold-header") {
            let folded = (newValue == "true") || (newValue == "1");

            this._componentReady.then(() => {
                if(folded) {
                    if(!this._header.classList.contains("condensed"))
                        this._header.classList.add("condensed");

                        this._foldHeaderButton.setAttribute("title", this._translateString("Expand header"));
                }
                else {
                    if(this._header.classList.contains("condensed"))
                        this._header.classList.remove("condensed");

                        this._foldHeaderButton.setAttribute("title", this._translateString("Condense header"));
                }
            });
        }
	}

    /**
     * 
     */
    static _getResourceTypeLabel(resourceType) {
        switch(resourceType) {
            case "Ktbs":
                return "kTBS Root";
                break;
            case "StoredTrace": 
                return "Stored trace";
                break;
            case "ComputedTrace":
                return "Computed trace";
                break;
            default:
                return resourceType;
        }
    }

	/**
	 * 
	 */
	_updateStringsTranslation() {
        let resourceType = this.getAttribute("resource-type");
        this._resourceTypeLabel.innerText = this._translateString(KTBS4LA2MainResource._getResourceTypeLabel(resourceType));
        
        if(!this.hasAttribute("label"))
            this._titleTag.innerText = this._ktbsResource.get_preferred_label(this._lang);
        
        this._editLabelInput.setAttribute("lang", this._lang);
        this._editLabelInput.setAttribute("placeholder", this._translateString("Label"));
        this._linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
        this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
        this._editButton.setAttribute("title", this._translateString("Edit"));
        this._removeButton.setAttribute("title", this._translateString("Delete"));
        this._saveModificationsButton.setAttribute("title", this._translateString("Save modifications"));
        this._cancelModificationsButton.setAttribute("title", this._translateString("Cancel modifications"));

        if(this._aboutSection.classList.contains("expanded"))
            this._toggleAboutVisibilityButton.setAttribute("title", this._translateString("Hide additional informations"));
        else
            this._toggleAboutVisibilityButton.setAttribute("title", this._translateString("Show additional informations"));

        this._versionLabel.innerText = this._translateString("Version");
        this._rootBuilinMethodsHeader.innerText = this._translateString("Builtin methods");
        this._childBasesSubsection.setAttribute("lang", this._lang);
		this._childBasesSubsection.setAttribute("title", this._translateString("Bases") + " :");
		this._childModelsSubsection.setAttribute("lang", this._lang);
		this._childModelsSubsection.setAttribute("title", this._translateString("Models") + " :");
		this._childStoredTracesSubsection.setAttribute("lang", this._lang);
		this._childStoredTracesSubsection.setAttribute("title", this._translateString("Stored traces") + " :");
		this._childMethodsSubsection.setAttribute("lang", this._lang);
		this._childMethodsSubsection.setAttribute("title", this._translateString("Methods") + " : ");
		this._childComputedTracesSubsection.setAttribute("lang", this._lang);
        this._childComputedTracesSubsection.setAttribute("title", this._translateString("Computed traces") + " :");
        this._resourceDataSubsection.setAttribute("lang", this._lang);
        this._resourceDataSubsection.setAttribute("title", this._translateString("Resource details") + " :");
        this._parentMethodLabel.innerText = this._translateString("Parent method") + " :";
        this._parentMethodPicker.setAttribute("lang", this._lang);
        this._modelLabel.innerText = this._translateString("Model") + " :";
        this._modelPicker.setAttribute("lang", this._lang);
        this._originLabel.innerText = this._translateString("Origin") + " :";
        this._originInput.setAttribute("placeholder", this._translateString("Origin"));
        this._methodLabel.innerText = this._translateString("Method") + " :";
        this._methodPicker.setAttribute("lang", this._lang);
        this._singleSourceTraceLabel.innerText = this._translateString("Source trace") + " :";
        this._singleSourceTracePicker.setAttribute("lang", this._lang);
        this._multipleSourceTracesLabel.innerText = this._translateString("Source traces") + " :";
        this._multipleSourceTracesPicker.setAttribute("lang", this._lang);
        this._parametersLabel.innerText = this._translateString("Parameters") + " :";
        this._parametersInput.setAttribute("lang", this._lang);
        this._obselsSubsection.setAttribute("lang", this._lang);
        this._obselsSubsection.setAttribute("title", this._translateString("Obsels") + " :");
        this._timelineTab.setAttribute("lang", this._lang);
        this._timelineTab.setAttribute("title", this._translateString("Timeline view"));
        this._tableTab.setAttribute("lang", this._lang);
        this._tableTab.setAttribute("title", this._translateString("Table view"));
        this._statsSubsection.setAttribute("lang", this._lang);
        this._statsSubsection.setAttribute("title", this._translateString("Statistics") + " :");
        this._addBaseButton.setAttribute("title", this._translateString("Create a new base"));
        this._addModelButton.setAttribute("title", this._translateString("Create a new model"));
        this._addStoredTraceButton.setAttribute("title", this._translateString("Create a new stored trace"));
        this._addMethodButton.setAttribute("title", this._translateString("Create a new method"));
        this._addComputedTraceButton.setAttribute("title", this._translateString("Create a new computed trace"));
	}

    /**
     * 
     */
    disconnectedCallback() {
        window.removeEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
        this.removeEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
        super.disconnectedCallback();
    }
    
    /**
     * 
     */
    _instanciateChild(child_resource, mark_as_new = false) {
        let childElement = document.createElement("ktbs4la2-main-related-resource");
        childElement.setAttribute("resource-type", child_resource.type);
        childElement.setAttribute("uri", child_resource.uri);

        if(child_resource.label)
            childElement.setAttribute("label", child_resource.label);

        let slot;

        switch(child_resource.type) {
            case "Base" :
                slot = "bases";
                break;
            case "Model":
                slot = "models";
                break;
            case "StoredTrace":
                slot = "stored-traces";
                break;
            case "Method":
                slot = "methods";
                break;
            case "ComputedTrace":
                slot = "computed-traces";
                break;
        }

        if(mark_as_new == true)
            childElement.classList.add("new");

        childElement.setAttribute("slot", slot);
        this.appendChild(childElement);

        setTimeout(() => {
            if(childElement.classList.contains("new"))
                childElement.classList.remove("new");
        }, 4000);
    }

    /**
     * 
     */
    _is_in_edit_mode() {
        return this._containerDiv.classList.contains("edit");
    }

    /**
     * 
     */
    _switchToViewMode() {
        if(this._is_in_edit_mode()) {
            this._resourceDataSubsection.setAttribute("foldable", "true");

            if(this._containerDiv.classList.contains("edit"))
                this._containerDiv.classList.remove("edit");

            if(!this._containerDiv.classList.contains("view"))
                this._containerDiv.classList.add("view");

            window.removeEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
            this.removeEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);

            this._reinitializeEditElementsValues();
        }
    }

    /**
     * 
     */
    _switchToEditMode() {
        if(!this._is_in_edit_mode()) {
            window.addEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
            this.addEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);

            this._resourceDataSubsection.setAttribute("foldable", "false");

            if(this._containerDiv.classList.contains("view"))
                this._containerDiv.classList.remove("view");

            this._updateSaveButtonState();

            if(!this._containerDiv.classList.contains("edit"))
                this._containerDiv.classList.add("edit");
        }
    }

    /**
     * 
     */
    _setContainerStatusClass(new_status_class) {
        if(
                (new_status_class == "access-granted")
            ||  (new_status_class == "access-inherited")
            ||  (new_status_class == "online")
            ||  (new_status_class == "pending")
            ||  (new_status_class == "authentication-required")
            ||  (new_status_class == "access-denied")
            ||  (new_status_class == "error")
            ||  (new_status_class == "deleted")
        ) {
            if(this._containerDiv.classList.contains("access-granted") && (new_status_class != "access-granted"))
                this._containerDiv.classList.remove("access-granted");

            if(this._containerDiv.classList.contains("access-inherited") && (new_status_class != "access-inherited"))
                this._containerDiv.classList.remove("access-inherited");

            if(this._containerDiv.classList.contains("online") && (new_status_class != "online"))
                this._containerDiv.classList.remove("online");

            if(this._containerDiv.classList.contains("pending") && (new_status_class != "pending"))
                this._containerDiv.classList.remove("pending");

            if(this._containerDiv.classList.contains("authentication-required") && (new_status_class != "authentication-required"))
                this._containerDiv.classList.remove("authentication-required");

            if(this._containerDiv.classList.contains("access-denied") && (new_status_class != "access-denied"))
                this._containerDiv.classList.remove("access-denied");

            if(this._containerDiv.classList.contains("error") && (new_status_class != "error"))
                this._containerDiv.classList.remove("error");

            if(this._containerDiv.classList.contains("deleted") && (new_status_class != "deleted"))
                this._containerDiv.classList.remove("deleted");

            if(!this._containerDiv.classList.contains(new_status_class))
                this._containerDiv.classList.add(new_status_class);
        }
        else
            throw new Error("\"" + new_status_class + "\" is not a valid status class");
    }

    /**
     * 
     */
    _reinitializeEditElementsValues() {
        this._componentReady.then(() => {
            let resourceType = this.getAttribute("resource-type");

            // set translations input value
            let labels_translations = new Array();

            if(this._ktbsResource.label)
                labels_translations.push({lang: "*", value: this._ktbsResource.label});

            if(this._ktbsResource.label_translations instanceof Array) {
                for(let i = 0; i < this._ktbsResource.label_translations.length; i++) {
                    const aLabelTranslation = this._ktbsResource.label_translations[i];

                    if(aLabelTranslation instanceof Object) {
                        if(aLabelTranslation["@value"] && aLabelTranslation["@language"])
                            labels_translations.push({lang: aLabelTranslation["@language"], value: aLabelTranslation["@value"]});
                        else if(aLabelTranslation["@value"])
                            labels_translations.push({lang: "*", value: aLabelTranslation["@value"]});
                    }
                    else
                        labels_translations.push({value: aLabelTranslation, lang: "*"});
                }
            }

            if(labels_translations.length > 0) {
                const newEditLabelInputValue = JSON.stringify(labels_translations);

                if(this._editLabelInput.value != newEditLabelInputValue)
                    this._editLabelInput.setAttribute("value", newEditLabelInputValue);
            }
            else {
                if(this._editLabelInput.hasAttribute("value"))
                    this._editLabelInput.removeAttribute("value");
            }

            if(resourceType == "Method") {
                this._parentMethodPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                this._ktbsResource.get_root(this._abortController.signal)
                    .then((root) => {
                        this._parentMethodPicker.setAttribute("root-uri", root.uri);
                        this._parentMethodPicker.setAttribute("root-label", root.label);
                    });

                if(this._ktbsResource.parent_method.is_builtin)
                    this._parentMethodPicker.setAttribute("value", this._ktbsResource.parent_method.id);
                else
                    this._parentMethodPicker.setAttribute("value", this._ktbsResource.parent_method.uri);

                this._parametersInput.setAttribute("method-uri", this.getAttribute("uri"));
                this._parametersInput.setAttribute("parent-base-uri", this._ktbsResource.parent.uri);

                if(this._ktbsResource.raw_parameters_data)
                    this._parametersInput.setAttribute("value", JSON.stringify(this._ktbsResource.raw_parameters_data));
            }

            if(resourceType == "StoredTrace") {
                const origin = this._ktbsResource.origin;
                this._originInput.value = origin;

                this._modelPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                this._ktbsResource.get_root(this._abortController.signal)
                    .then((root) => {
                        this._modelPicker.setAttribute("root-uri", root.uri);
                        this._modelPicker.setAttribute("root-label", root.label);
                    });

                this._modelPicker.setAttribute("value", this._ktbsResource.model.uri);
            }

            if(resourceType == "ComputedTrace") {
                this._singleSourceTracePicker.setAttribute("browse-start-uri", this._ktbsResource.uri);
                this._multipleSourceTracesPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                this._ktbsResource.get_root(this._abortController.signal)
                    .then((root) => {
                        this._singleSourceTracePicker.setAttribute("root-uri", root.uri);
                        this._singleSourceTracePicker.setAttribute("root-label", root.label);
                        this._multipleSourceTracesPicker.setAttribute("root-uri", root.uri);
                        this._multipleSourceTracesPicker.setAttribute("root-label", root.label);
                        this._methodPicker.setAttribute("root-uri", root.uri);
                        this._methodPicker.setAttribute("root-label", root.label);
                    });

                this._ktbsResource.method.get_methods_hierarchy(this._abortController.signal)
                    .then((builtin_ancestor) => {
                        if(builtin_ancestor.source_traces_cardinality == "*") {
                            let source_traces_uris = new Array();

                            for(let i = 0; i < this._ktbsResource.source_traces.length; i++)
                                source_traces_uris.push(this._ktbsResource.source_traces[i].uri);

                            this._multipleSourceTracesPicker.setAttribute("value", source_traces_uris.join(" "));
                            this._sourceTracesP.className = "multiple";
                        }
                        else {
                            this._singleSourceTracePicker.setAttribute("value", this._ktbsResource.source_traces[0].uri);
                            this._sourceTracesP.className = "single";
                        }
                    });

                this._methodPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                if(this._ktbsResource.method.is_builtin) {
                    this._methodPicker.setAttribute("value", this._ktbsResource.method.id);
                    this._parametersInput.setAttribute("method-uri", this._ktbsResource.method.id);
                }
                else {
                    this._methodPicker.setAttribute("value", this._ktbsResource.method.uri);
                    this._parametersInput.setAttribute("method-uri", this._ktbsResource.method.uri);
                }

                this._parametersInput.setAttribute("method-uri", this._ktbsResource.method.uri);
                this._parametersInput.setAttribute("default-model-uri", this._ktbsResource.model.uri);
                this._parametersInput.setAttribute("parent-base-uri", this._ktbsResource.parent.uri);

                if(this._ktbsResource.raw_parameters_data)
                    this._parametersInput.setAttribute("value", JSON.stringify(this._ktbsResource.raw_parameters_data));
            }
		});
    }

	/**
	 * 
	 */
    _onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {
            let resourceType = this.getAttribute("resource-type");

            if(!this.hasAttribute("label"))
                this._titleTag.innerText = this._ktbsResource.get_preferred_label(this._lang);

            // set translations input value
            let labels_translations = new Array();

            if(this._ktbsResource.label)
                labels_translations.push({value: this._ktbsResource.label, lang: "*"});

            if(this._ktbsResource.label_translations instanceof Array) {
                for(let i = 0; i < this._ktbsResource.label_translations.length; i++) {
                    const aLabelTranslation = this._ktbsResource.label_translations[i];

                    if(aLabelTranslation instanceof Object) {
                        if(aLabelTranslation["@value"] && aLabelTranslation["@language"])
                            labels_translations.push({value: aLabelTranslation["@value"], lang: aLabelTranslation["@language"]});
                        else if(aLabelTranslation["@value"])
                            labels_translations.push({value: aLabelTranslation["@value"], lang: "*"});
                    }
                    else
                        labels_translations.push({value: aLabelTranslation, lang: "*"});
                }
            }
            else if(this._ktbsResource.label_translations instanceof Object) {
                if(this._ktbsResource.label_translations["@value"] && this._ktbsResource.label_translations["@language"])
                    labels_translations.push({value: this._ktbsResource.label_translations["@value"], lang: this._ktbsResource.label_translations["@language"]});
                else if(aLabelTranslation["@value"])
                    labels_translations.push({value: this._ktbsResource.label_translations["@value"], lang: "*"});
            }
            else if(this._ktbsResource.label_translations)
                labels_translations.push({value: this._ktbsResource.label_translations, lang: "*"});

            if(labels_translations.length > 0)
                this._editLabelInput.setAttribute("value", JSON.stringify(labels_translations));
            // ---

            let parentResource = this._ktbsResource.parent;

            if(parentResource) {
                const breadCrumbsItems = this.querySelectorAll("[slot = breadcrumbs]");

                for(let i = 0; i < breadCrumbsItems.length; i++)
                    breadCrumbsItems[i].remove();

                this._addBreadcrumb(parentResource);
            }

            if(this._ktbsResource.authentified) {
                if(this._ktbsResource.hasOwnCredendtials) {
                    this._setContainerStatusClass("access-granted");
                    this._resourceStatusString = "Access granted";
                }
                else {
                    this._setContainerStatusClass("access-inherited");
                    this._resourceStatusString = "Access inherited";
                }

                this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            }
            else {
                this._resourceStatusString = "Online";
                this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                this._setContainerStatusClass("online");
            }

            if(resourceType == "Ktbs") {
                let version = this._ktbsResource.version;

                if(version)
                    this._versionTag.innerText = version;
            
                let comment = this._ktbsResource.comment;

                if(comment) {
                    this._commentTag.innerText = comment;
                    this._commentTag.style.display = "block";
                }
                else
                    this._commentTag.style.display = "none";
                
                // remove previously instanciated builtin-method child elements
                let childBuiltinMethodElements = this._rootBuiltinMethodList.querySelectorAll("li");

                for(let i = 0; i < childBuiltinMethodElements.length; i++) {
                    let aChildBuiltinMethodElement = childBuiltinMethodElements[i];
                    this._rootBuiltinMethodList.removeChild(aChildBuiltinMethodElement);
                }
                // ---
                
                // create method child elements
                let builtin_methods = this._ktbsResource.builtin_methods;

                for(let i = 0; i < builtin_methods.length; i++) {
                    let builtin_method = builtin_methods[i];
                    let methodTag = document.createElement("li");
                    methodTag.innerText = builtin_method.id;
                    this._rootBuiltinMethodList.appendChild(methodTag);
                }
            }
            
            if((resourceType == "Ktbs") || (resourceType == "Base")) {
                for(let i = 0; i < this._ktbsResource.children.length; i++)
                    this._instanciateChild(this._ktbsResource.children[i]);
            }

            if(resourceType == "Model") {
                // remove previously instanciated head-content child elements
                let childHeadContentElements = this.querySelectorAll("[slot = head-content]");

                for(let i = 0; i < childHeadContentElements.length; i++) {
                    let aChildHeadContentElement = childHeadContentElements[i];
                    this.removeChild(aChildHeadContentElement);
                }
                // ---

                let diagram = document.createElement("ktbs4la2-model-diagram");
                diagram.setAttribute("slot", "head-content");
                diagram.setAttribute("uri", this.getAttribute("uri"));
                this.appendChild(diagram);
            }

            if(resourceType == "Method") {
                // remove previously instanciated parent-method child elements
                let childParentMethodElements = this.querySelectorAll("[slot = parent-method]");

                for(let i = 0; i < childParentMethodElements.length; i++) {
                    let aChildParentMethodElement = childParentMethodElements[i];
                    this.removeChild(aChildParentMethodElement);
                }
                // ---

                let parentMethod = this._ktbsResource.parent_method;

                if(parentMethod) {
                    let methodElement = document.createElement("ktbs4la2-main-related-resource");
                    methodElement.setAttribute("resource-type", "Method");
                    methodElement.setAttribute("uri", parentMethod.uri);
                    methodElement.setAttribute("scale", "0.7");

                    if(parentMethod.label)
                        methodElement.setAttribute("label", parentMethod.label);
                    
                    methodElement.setAttribute("slot", "parent-method");
                    this.appendChild(methodElement);
                }

                this._parentMethodPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                this._ktbsResource.get_root(this._abortController.signal)
                    .then((root) => {
                        this._parentMethodPicker.setAttribute("root-uri", root.uri);
                        this._parentMethodPicker.setAttribute("root-label", root.label);
                    });

                if(this._ktbsResource.parent_method.is_builtin)
                    this._parentMethodPicker.setAttribute("value", this._ktbsResource.parent_method.id);
                else
                    this._parentMethodPicker.setAttribute("value", this._ktbsResource.parent_method.uri);

                this._parametersInput.setAttribute("method-uri", this.getAttribute("uri"));
                this._parametersInput.setAttribute("parent-base-uri", this._ktbsResource.parent.uri);

                if(this._ktbsResource.raw_parameters_data)
                    this._parametersInput.setAttribute("value", JSON.stringify(this._ktbsResource.raw_parameters_data));
            }

            if((resourceType == "StoredTrace") || (resourceType == "ComputedTrace")) {
                const origin = this._ktbsResource.origin;
                this._originDisplaySpan.innerText = origin;

                if(resourceType == "StoredTrace")
                    this._originInput.value = origin;

                // remove previously instanciated model child elements
                let childModelElements = this.querySelectorAll("[slot = model]");

                for(let i = 0; i < childModelElements.length; i++) {
                    let aChildModelElement = childModelElements[i];
                    this.removeChild(aChildModelElement);
                }
                // ---
                
                let model = this._ktbsResource.model;
                
                if(model) {
                    let modelElement = document.createElement("ktbs4la2-main-related-resource");
                    modelElement.setAttribute("resource-type", "Model");
                    modelElement.setAttribute("uri", model.uri);
                    modelElement.setAttribute("scale", "0.7");

                    if(model.label)
                        modelElement.setAttribute("label", model.label);

                    modelElement.setAttribute("slot", "model");
                    this.appendChild(modelElement);

                    if(resourceType == "StoredTrace") {
                        this._modelPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                        this._ktbsResource.get_root(this._abortController.signal)
                            .then((root) => {
                                this._modelPicker.setAttribute("root-uri", root.uri);
                                this._modelPicker.setAttribute("root-label", root.label);
                            });

                        this._modelPicker.setAttribute("value", this._ktbsResource.model.uri);
                    }
                }
            }

            if(resourceType == "ComputedTrace") {
                // remove previously instanciated source trace child elements
                let childSourceTraceElements = this.querySelectorAll("[slot = source-trace]");

                for(let i = 0; i < childSourceTraceElements.length; i++) {
                    let aChildSourceTraceElement = childSourceTraceElements[i];
                    this.removeChild(aChildSourceTraceElement);
                }
                // ---

                for(let i = 0; i < this._ktbsResource.source_traces.length; i++) {
                    let sourceTraceElement = document.createElement("ktbs4la2-main-related-resource");
                    sourceTraceElement.setAttribute("uri", this._ktbsResource.source_traces[i].uri);
                    sourceTraceElement.setAttribute("scale", "0.7");

                    if(this._ktbsResource.source_traces[i] instanceof StoredTrace)
                        sourceTraceElement.setAttribute("resource-type", "StoredTrace");
                    else
                        sourceTraceElement.setAttribute("resource-type", "ComputedTrace");

                    if(this._ktbsResource.source_traces[i].label)
                        sourceTraceElement.setAttribute("label", this._ktbsResource.source_traces[i].label);

                    sourceTraceElement.setAttribute("slot", "source-trace");
                    this.appendChild(sourceTraceElement);
                }

                this._singleSourceTracePicker.setAttribute("browse-start-uri", this._ktbsResource.uri);
                this._multipleSourceTracesPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                this._ktbsResource.get_root(this._abortController.signal)
                    .then((root) => {
                        this._singleSourceTracePicker.setAttribute("root-uri", root.uri);
                        this._singleSourceTracePicker.setAttribute("root-label", root.label);
                        this._multipleSourceTracesPicker.setAttribute("root-uri", root.uri);
                        this._multipleSourceTracesPicker.setAttribute("root-label", root.label);
                        this._methodPicker.setAttribute("root-uri", root.uri);
                        this._methodPicker.setAttribute("root-label", root.label);
                    });

                this._ktbsResource.method.get_methods_hierarchy(this._abortController.signal)
                    .then((builtin_ancestor) => {
                        if(builtin_ancestor.source_traces_cardinality == "*") {
                            let source_traces_uris = new Array();

                            for(let i = 0; i < this._ktbsResource.source_traces.length; i++)
                                source_traces_uris.push(this._ktbsResource.source_traces[i].uri);

                            this._multipleSourceTracesPicker.setAttribute("value", source_traces_uris.join(" "));
                            this._sourceTracesP.className = "multiple";
                        }
                        else {
                            this._singleSourceTracePicker.setAttribute("value", this._ktbsResource.source_traces[0].uri);
                            this._sourceTracesP.className = "single";
                        }
                    });

                // remove previously instanciated method child elements
                let childMethodElements = this.querySelectorAll("[slot = method]");

                for(let i = 0; i < childMethodElements.length; i++) {
                    let aChildMethodElement = childMethodElements[i];
                    this.removeChild(aChildMethodElement);
                }
                // ---

                let methodElement = document.createElement("ktbs4la2-main-related-resource");
                methodElement.setAttribute("resource-type", "Method");
                methodElement.setAttribute("uri", this._ktbsResource.method.uri);
                methodElement.setAttribute("scale", "0.7");

                if(this._ktbsResource.method.label)
                    methodElement.setAttribute("label", this._ktbsResource.method.label);

                methodElement.setAttribute("slot", "method");
                this.appendChild(methodElement);

                this._methodPicker.setAttribute("browse-start-uri", this._ktbsResource.uri);

                if(this._ktbsResource.method.is_builtin) {
                    this._methodPicker.setAttribute("value", this._ktbsResource.method.id);
                    this._parametersInput.setAttribute("method-uri", this._ktbsResource.method.id);
                }
                else {
                    this._methodPicker.setAttribute("value", this._ktbsResource.method.uri);
                    this._parametersInput.setAttribute("method-uri", this._ktbsResource.method.uri);
                }

                this._parametersInput.setAttribute("method-uri", this._ktbsResource.method.uri);
                this._parametersInput.setAttribute("default-model-uri", this._ktbsResource.model.uri);
                this._parametersInput.setAttribute("parent-base-uri", this._ktbsResource.parent.uri);

                if(this._ktbsResource.raw_parameters_data)
                    this._parametersInput.setAttribute("value", JSON.stringify(this._ktbsResource.raw_parameters_data));
            }
		});
    }
    
    /**
     * 
     */
    _onKtbsResourceSyncPending(old_syncStatus) {
        if(old_syncStatus != "needs_auth") {
            this._componentReady.then(() => {
                this._resourceStatusString = "Pending...";
                this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                this._setContainerStatusClass("pending");
            });
        }
    }

    /**
     * 
     */
    _onKtbsResourceSyncNeedsAuth() {
        this._componentReady.then(() => {
            this._resourceStatusString = "Authentication required";
            this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            this._setContainerStatusClass("authentication-required");
        });
    }

    /**
     * 
     */
    _onKtbsResourceSyncAccessDenied() {
        this._componentReady.then(() => {
            this._resourceStatusString = "Access denied";
            this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            this._setContainerStatusClass("access-denied");
        });
    }

	/**
	 * 
	 */
	_onKtbsResourceSyncError(old_syncStatus, error) {
        super._onKtbsResourceSyncError(old_syncStatus, error);

        this._componentReady.then(() => {
            this._resourceStatusString = "Error";
            this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            this._errorMessageDiv.innerText = " (" + error + ")";
            this._setContainerStatusClass("error");
        });
    }

    /**
     * 
     */
    _onKtbsResourceLifecycleDeleted() {
        this._componentReady.then(() => {
            this._resourceStatusString = "Deleted";
            this._resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            this._setContainerStatusClass("deleted");
        });
    }

    /**
	 * 
	 */
	_onKtbsResourceChildrenAdd() {
		for(let i = 0; i < this._ktbsResource.children.length; i++) {
			const aChild = this._ktbsResource.children[i];
			const queryString = "ktbs4la2-main-related-resource[resource-type = " + CSS.escape(aChild.type) + "][uri = " + CSS.escape(aChild.uri) + "]:not([slot = breadcrumbs])";
			const childElement = this.querySelector(queryString);
				
			if(!childElement)
				this._instanciateChild(aChild, true);
		}
    }

    /**
     * 
     * \param Resource resource 
     */
    _addBreadcrumb(resource) {
        resource.get(this._abortController.signal).then(() => {
            let breadcrumbItemElement = document.createElement("ktbs4la2-main-related-resource");
            breadcrumbItemElement.setAttribute("resource-type", resource.constructor.name);
            breadcrumbItemElement.setAttribute("uri", resource.uri);
            breadcrumbItemElement.setAttribute("slot", "breadcrumbs");
            breadcrumbItemElement.setAttribute("scale", "0.7");
            
            let label = resource.label;

            if(label)
                breadcrumbItemElement.setAttribute("label", label);
            else if(resource.constructor.name == "Ktbs") {
                let rootLabel = null;
                this.ktbsRoots = JSON.parse(window.localStorage.getItem("ktbs-roots"));

				for(let i = 0; !rootLabel && (i < this.ktbsRoots.length); i++) {
                    let aRoot = this.ktbsRoots[i];
                    
                    if(aRoot.uri == resource.uri)
                        rootLabel = aRoot.label;
                }
                
                if(rootLabel)
                    breadcrumbItemElement.setAttribute("label", rootLabel);
            }

            this.insertBefore(breadcrumbItemElement, this.firstChild);

            let resourceParent = resource.parent;

            if(resourceParent)    
                this._addBreadcrumb(resourceParent);
        });
    }
    
    /**
	 * 
	 */
	_onClickEditButton(event) {
        if(!this._is_in_edit_mode())
            this._switchToEditMode();
    }
    
    /**
     * 
     */
    _onBeforeUnloadWindow(event) {
        if(this._is_in_edit_mode()) {
            event.preventDefault();
            const confirmMessage = this._translateString("Your modifications haven't been saved. Are you sure you want to leave ?");
            event.returnValue = confirmMessage;
            return confirmMessage;
        }
        else if(event.returnValue)
            delete event.returnValue;
    }

    /**
     * 
     */
    _onBeforeRemove(event) {
        if(this._is_in_edit_mode() && !confirm(this._translateString("Your modifications haven't been saved. Are you sure you want to leave ?")))
            event.preventDefault();
    }

	/**
	 * 
	 */
	_onClickRemoveButton(event) {
		this.dispatchEvent(new CustomEvent("request-delete-ktbs-resource", {bubbles: true}));
    }
    
    /**
     * 
     */
    _updateValidateAuthButtonState() {
        if((this._userNameInput.value != "") && (this._passwordInput.value != "")) {
            if(this._validateAuthButton.hasAttribute("disabled"))
                this._validateAuthButton.removeAttribute("disabled");
        }
        else {
            if(!this._validateAuthButton.hasAttribute("disabled"))
                this._validateAuthButton.setAttribute("disabled", true);
        }
    }

    /**
     * 
     */
    _onsubmitAuthenticationForm(event) {
        event.preventDefault();
        let userName = this._userNameInput.value;
        let password = this._passwordInput.value;
        let auth_validity = this._authenticationForm.auth_validity.value;

        if((userName != "") && (password != "")) {
            let credentials = {
                id: userName,
                password: password
            };

            this._ktbsResource.get(this._abortController.signal, credentials)
                .then(() => {
                    this._userNameInput.value = "";
                   
                    // store credentials in local or session storage, according to user's "auth_validity" choice
                    let credentialsStorage = (auth_validity == "permanent")?window.localStorage:window.sessionStorage;
                    let storedCredentials = JSON.parse(credentialsStorage.getItem("credentials"));
								
                    if(storedCredentials == null)
                        storedCredentials = new Array();

                    let resourceCredentialsFound = false;

                    for(let i = 0; (!resourceCredentialsFound) && (i < storedCredentials.length); i++) {
                        let aResourceCredential = storedCredentials[i];

                        if(aResourceCredential.uri == this._ktbsResource.uri) {
                            resourceCredentialsFound = true;
                            aResourceCredential.id = credentials.id;
                            aResourceCredential.password = credentials.password;
                        }
                    }

                    if(!resourceCredentialsFound) {
                        let newResourceCredential = {
                            uri: this._ktbsResource.uri,
                            id: credentials.id,
                            password: credentials.password
                        };

                        storedCredentials.push(newResourceCredential);
                    }

                    credentialsStorage.setItem("credentials", JSON.stringify(storedCredentials));
                    // --- done
                }).catch((error) => {
                    if(error instanceof KTBSErrors.RestError) {
                        if(error.statusCode == 401)
                            setTimeout(() => {
                                alert(this._translateString("Authentication failed"));
                            });
                        else if(error.statusCode == 403)
                            setTimeout(() => {
                                alert(this._translateString("Access denied"));
                            });
                    }
                });

                this._passwordInput.value = "";
        }
    }

    /**
     * 
     */
    _onClickDisconnectButton(event) {
        if(this._ktbsResource.authentified)
            this._ktbsResource.disconnect();
    }

    /**
     * 
     */
    _onClickToggleAboutVisibilityButton(event) {
        if(this._aboutSection.classList.contains("folded")) {
            this._aboutSection.classList.remove("folded");
            this._aboutSection.classList.add("expanded");
            this._toggleAboutVisibilityButton.setAttribute("title", this._translateString("Hide additional informations"));
        }
        else {
            this._aboutSection.classList.remove("expanded");
            this._aboutSection.classList.add("folded");
            this._toggleAboutVisibilityButton.setAttribute("title", this._translateString("Show additional informations"));
        }
    }

    /**
     * 
     */
    _onClickFoldHeaderButton(event) {
        if(this._header.classList.contains("condensed")) {
            this._foldHeaderButton.setAttribute("title", this._translateString("Condense header"));
            this._header.classList.remove("condensed");

            this.dispatchEvent(new CustomEvent("unfold-header" , {
                bubbles: true,
                cancelable: false
            }));
        }
        else {
            this._header.classList.add("condensed");
            this._foldHeaderButton.setAttribute("title", this._translateString("Expand header"));

            this.dispatchEvent(new CustomEvent("fold-header" , {
                bubbles: true,
                cancelable: false
            }));
        }
    }

    /**
     * 
     */
    static get observedAttributes() {
        let attr = super.observedAttributes;
        attr.push("fold-header");
        return attr;
    }

    /**
     * 
     */
    _onClickSaveModificationsButton(event) {
        if(!this._saveModificationsButton.classList.contains("disabled")) {
            const resourceType = this.getAttribute("resource-type");

            try {
                const labelInputValues = JSON.parse(this._editLabelInput.value);

                if(labelInputValues instanceof Array) {
                    let default_label_set = false;
                    let new_label_translations = new Array();

                    for(let i = 0; i < labelInputValues.length; i++) {
                        const aLabelTranslation = labelInputValues[i];
                        const aLabelLang = aLabelTranslation.lang;
                        const aLabelValue = aLabelTranslation.value;
        
                        if(!aLabelLang || (aLabelLang == "*")) {
                            this._ktbsResource.label = aLabelValue;
                            default_label_set = true;
                        }
                        else {
                            new_label_translations.push({
                                "@value": aLabelValue,
                                "@language": aLabelLang
                            });
                        }
                    }

                    // clean default label if it has been unset
                    if(!default_label_set && this._ktbsResource.label)
                        this._ktbsResource.label = undefined;

                    // update label translations
                    if(new_label_translations.length > 0)
                        this._ktbsResource.label_translations = new_label_translations;
                    else
                        this._ktbsResource.label_translations = undefined;
                }
            }
            catch(error) {
                this.emitErrorEvent(error);
            }
            
            if(resourceType == "StoredTrace") {
                this._ktbsResource.model = ResourceMultiton.get_resource(Model, this._modelPicker.value);
                this._ktbsResource.origin = this._originInput.value;
            }

            if(resourceType == "ComputedTrace") {
                let newMethod;

                if(Method.builtin_methods_ids.includes(this._methodPicker.value))
                    newMethod = Method.getBuiltinMethod(this._methodPicker.value);
                else
                    newMethod = ResourceMultiton.get_resource(Method, this._methodPicker.value);

                this._ktbsResource.method = newMethod;

                if(this._sourceTracesP.className == "single")
                    this._ktbsResource.source_traces = [ResourceMultiton.get_resource(Trace, this._singleSourceTracePicker.value)];
                else if(this._sourceTracesP.className == "multiple") {
                    let new_source_traces = [];
                    const new_source_traces_uris = JSON.parse(this._multipleSourceTracesPicker.value);

                    for(let i = 0; i < new_source_traces_uris.length; i++) {
                        const aSourceTrace = ResourceMultiton.get_resource(Trace, new_source_traces_uris[i]);
                        new_source_traces.push(aSourceTrace);
                    }

                    this._ktbsResource.source_traces = new_source_traces;
                }
            }

            if((resourceType == "Method") || (resourceType == "ComputedTrace"))
                this._ktbsResource.parameters = JSON.parse(this._parametersInput.value);

            if(resourceType == "Method") {
                const parent_method_uri = this._parentMethodPicker.value;
                let newParentMethod;

                if(Method.builtin_methods_ids.includes(parent_method_uri))
                    newParentMethod = Method.getBuiltinMethod(parent_method_uri);
                else
                    newParentMethod = ResourceMultiton.get_resource(Method, parent_method_uri);

                this._ktbsResource.parent_method = newParentMethod;
            }
            
            this._ktbsResource.put(this._abortController.signal)
                .then(() => {
                    this._switchToViewMode();
                })
                .catch((error) => {
                    this.emitErrorEvent(error);
                    alert(error);
                });
        }
    }

    /**
     * 
     */
    _onClickCancelModificationsButton(event) {
        if(this._is_in_edit_mode())
            this._switchToViewMode();
    }

    /**
     * 
     */
    _updateSaveButtonState() {
        let formIsValid;
		const resourceType = this.getAttribute("resource-type");

		if(["Base", "Model", "StoredTrace", "Method", "ComputedTrace"].includes(resourceType)) {
			formIsValid = true;
			let formElementsToValidate = [this._editLabelInput];
			
			switch(resourceType) {
				case "StoredTrace" :
					formElementsToValidate.push(this._modelPicker);
					formElementsToValidate.push(this._originInput);
					break;
				case "Method" :
					formElementsToValidate.push(this._parentMethodPicker);
					formElementsToValidate.push(this._parametersInput);
					break;
				case "ComputedTrace" :
					formElementsToValidate.push(this._methodPicker);

					if(this._sourceTracesP.className == "single")
						formElementsToValidate.push(this._singleSourceTracePicker);
					else if(this._sourceTracesP.className == "multiple")
						formElementsToValidate.push(this._multipleSourceTracesPicker);
					else if(this._sourceTracesP.className == "notset")
						formIsValid = false;

					formElementsToValidate.push(this._parametersInput);
					break;
			}

			for(let i = 0; formIsValid && (i < formElementsToValidate.length); i++)
				formIsValid = formElementsToValidate[i].checkValidity();
		}
		else
			formIsValid = false;

        if(formIsValid) {
            if(this._saveModificationsButton.classList.contains("disabled"))
                this._saveModificationsButton.classList.remove("disabled");
        }
        else {
            if(!this._saveModificationsButton.classList.contains("disabled"))
                this._saveModificationsButton.classList.add("disabled");
        }
    }

    /**
     * 
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
					this._updateSaveButtonState();
				});
			});
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
                        this._sourceTracesP.className = "single";
					else if(method.source_traces_cardinality == "*")
                        this._sourceTracesP.className = "multiple";

                    this._updateSaveButtonState();
				}) 
				.catch((error) => {
                    this._sourceTracesP.className = "notset";
                    this._updateSaveButtonState();
				});
		}
		else {
			this._sourceTracesP.className = "notset";

			if(this._parametersInput.hasAttribute("method-uri"))
                this._parametersInput.removeAttribute("method-uri");
                
            this._updateSaveButtonState();
		}
    }
}

customElements.define('ktbs4la2-main-resource', KTBS4LA2MainResource);