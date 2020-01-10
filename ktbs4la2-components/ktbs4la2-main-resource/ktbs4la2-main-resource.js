import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Ktbs} from "../../ktbs-api/Ktbs.js";
import {Base} from "../../ktbs-api/Base.js";
import {Model} from "../../ktbs-api/Model.js";
import {StoredTrace} from "../../ktbs-api/StoredTrace.js";
import {Method} from "../../ktbs-api/Method.js";
import {ComputedTrace} from "../../ktbs-api/ComputedTrace.js";

import "../ktbs4la2-main-subsection/ktbs4la2-main-subsection.js";
import "../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js";
import "../ktbs4la2-add-resource-button/ktbs4la2-add-resource-button.js";
import "../ktbs4la2-model-diagram/ktbs4la2-model-diagram.js";
import "../ktbs4la2-trace-stats/ktbs4la2-trace-stats.js";
import "../ktbs4la2-icon-tabs/ktbs4la2-icon-tabs-group.js";
import "../ktbs4la2-trace-obsels/ktbs4la2-trace-obsels.js";
import "../ktbs4la2-trace-timeline/ktbs4la2-trace-timeline.js";

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
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._containerDiv = this.shadowRoot.querySelector("#container");
		this.titleTag = this.shadowRoot.querySelector("#title");
		this.linkTag = this.shadowRoot.querySelector("#resource-link");		
		this.resourceTypeLabel = this.shadowRoot.querySelector("#resource-type-label");
		this.resourceStatusTag = this.shadowRoot.querySelector("#resource-status");
        this.resourceStatusLabel = this.shadowRoot.querySelector("#resource-status-label");
        this.errorMessageDiv = this.shadowRoot.querySelector("#error-message");
        this.versionTag = this.shadowRoot.querySelector("#root-version");
		this.commentTag = this.shadowRoot.querySelector("#root-comment");
		this.editButton = this.shadowRoot.querySelector("#tool-edit");
		this.editButton.addEventListener("click", this.onClickEditButton.bind(this));
		this.removeButton = this.shadowRoot.querySelector("#tool-remove");
		this.removeButton.addEventListener("click", this.onClickRemoveButton.bind(this));
		this.versionLabel = this.shadowRoot.querySelector("#version-label");
        this.childBasesSubsection  = this.shadowRoot.querySelector("#child-bases");
        this.childBuiltinMethodsSubsection  = this.shadowRoot.querySelector("#child-builtin-methods");
		this.childModelsSubsection  = this.shadowRoot.querySelector("#child-models");
		this.childStoredTracesSubsection  = this.shadowRoot.querySelector("#child-stored-traces");
		this.childMethodsSubsection  = this.shadowRoot.querySelector("#child-methods");
		this.childComputedTracesSubsection  = this.shadowRoot.querySelector("#child-computed-traces");
    }
    
    /**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri")
			this._componentReady.then(() => {
                let resourceType = this.getAttribute("resource-type");

                if((resourceType == "ComputedTrace") || (resourceType == "StoredTrace")) {
                    let statsElement = document.createElement("ktbs4la2-trace-stats");
                    statsElement.setAttribute("uri", this.getAttribute("uri"));
                    statsElement.setAttribute("slot", "stats");
                    this.appendChild(statsElement);

                    let obselsTimelineElement = document.createElement("ktbs4la2-trace-timeline");
                    obselsTimelineElement.setAttribute("uri", this.getAttribute("uri"));
                    obselsTimelineElement.setAttribute("slot", "obsels-timeline");
                    this.appendChild(obselsTimelineElement);

                    let obselsTableElement = document.createElement("ktbs4la2-trace-obsels");
                    obselsTableElement.setAttribute("uri", this.getAttribute("uri") + "@obsels");
                    obselsTableElement.setAttribute("slot", "obsels-table");
                    this.appendChild(obselsTableElement);
                }
			});
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
        this.resourceTypeLabel.innerText = this._translateString(KTBS4LA2MainResource._getResourceTypeLabel(resourceType));
		this.linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
		this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
		this.childBasesSubsection.setAttribute("lang", this._lang);
		this.childBasesSubsection.setAttribute("title", this._translateString("Bases") + " : ");
		this.childModelsSubsection.setAttribute("lang", this._lang);
		this.childModelsSubsection.setAttribute("title", this._translateString("Models") + " : ");
		this.childStoredTracesSubsection.setAttribute("lang", this._lang);
		this.childStoredTracesSubsection.setAttribute("title", this._translateString("Stored traces") + " : ");
		this.childMethodsSubsection.setAttribute("lang", this._lang);
		this.childMethodsSubsection.setAttribute("title", this._translateString("Methods") + " : ");
		this.childComputedTracesSubsection.setAttribute("lang", this._lang);
		this.childComputedTracesSubsection.setAttribute("title", this._translateString("Computed traces") + " : ");
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		this._componentReady.then(() => {
			if(this.getAttribute("label"))
				this.titleTag.innerText = this.getAttribute("label");
			else
				this.titleTag.innerText = this._ktbsResource.id;

			this.linkTag.href = this.getAttribute("uri");
			this.linkTag.innerHTML = this.getAttribute("uri");
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoaded() {
		this._componentReady.then(() => {
            let resourceType = this.getAttribute("resource-type");
            this.resourceTypeLabel.innerText = this._translateString(KTBS4LA2MainResource._getResourceTypeLabel(resourceType));
        
			if(!this.getAttribute("label")) {
				let label = this._ktbsResource.label;

				if(label)
					this.titleTag.innerText = label;
			}

			this._resourceStatusString = "Online";
			this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
			this._containerDiv.className = "online";

            if(resourceType == "Ktbs") {
                let version = this._ktbsResource.version;

                if(version)
                    this.versionTag.innerText = version;
            
                let comment = this._ktbsResource.comment;

                if(comment)
                    this.commentTag.innerText = comment;

                // create method child elements
                let builtin_methods = this._ktbsResource.builtin_methods;

                for(let i = 0; i < builtin_methods.length; i++) {
                    let builtin_method = builtin_methods[i];
                    let methodTag = document.createElement("ktbs4la2-main-related-resource");
                    methodTag.setAttribute("resource-type", "Method");
                    methodTag.setAttribute("uri", builtin_method.uri);
                    methodTag.setAttribute("slot", "builtin-methods");
                    this.appendChild(methodTag);
                }
            }
            
            if((resourceType == "Ktbs") || (resourceType == "Base")) {
                // create base child elements
                let bases = this._ktbsResource.bases;

                for(let i = 0; i < bases.length; i++) {
                    let base = bases[i];
                    let baseTag = document.createElement("ktbs4la2-main-related-resource");
                    baseTag.setAttribute("resource-type", "Base");
                    baseTag.setAttribute("uri", base.uri);
                    baseTag.setAttribute("slot", "bases");
                    this.appendChild(baseTag);
                }

                let addBaseButton = document.createElement("ktbs4la2-add-resource-button");
                addBaseButton.setAttribute("parent-type", "Base");
                addBaseButton.setAttribute("parent-uri", this.getAttribute("uri"));
                addBaseButton.setAttribute("create-type", "Base");
                addBaseButton.setAttribute("slot", "bases");
                this.appendChild(addBaseButton);
            }

            if(resourceType == "Base") {
                // create model child elements
                let models = this._ktbsResource.models;

                for(let i = 0; i < models.length; i++) {
                    let model = models[i];
                    let modelTag = document.createElement("ktbs4la2-main-related-resource");
                    modelTag.setAttribute("resource-type", "Model");
                    modelTag.setAttribute("uri", model.uri);
                    modelTag.setAttribute("slot", "models");
                    this.appendChild(modelTag);
                }

                let addModelButton = document.createElement("ktbs4la2-add-resource-button");
                addModelButton.setAttribute("parent-type", "Base");
                addModelButton.setAttribute("parent-uri", this.getAttribute("uri"));
                addModelButton.setAttribute("create-type", "Model");
                addModelButton.setAttribute("slot", "models");
                this.appendChild(addModelButton);

                // create stored trace child elements
                let stored_traces = this._ktbsResource.stored_traces;

                for(let i = 0; i < stored_traces.length; i++) {
                    let storedTrace = stored_traces[i];
                    let storedTraceTag = document.createElement("ktbs4la2-main-related-resource");
                    storedTraceTag.setAttribute("resource-type", "StoredTrace");
                    storedTraceTag.setAttribute("uri", storedTrace.uri);
                    storedTraceTag.setAttribute("slot", "stored-traces");
                    this.appendChild(storedTraceTag);
                }

                let addStoredTraceButton = document.createElement("ktbs4la2-add-resource-button");
                addStoredTraceButton.setAttribute("parent-type", "Base");
                addStoredTraceButton.setAttribute("parent-uri", this.getAttribute("uri"));
                addStoredTraceButton.setAttribute("create-type", "StoredTrace");
                addStoredTraceButton.setAttribute("slot", "stored-traces");
                this.appendChild(addStoredTraceButton);

                // create method child elements
                let methods = this._ktbsResource.methods;

                for(let i = 0; i < methods.length; i++) {
                    let method = methods[i];
                    let methodTag = document.createElement("ktbs4la2-main-related-resource");
                    methodTag.setAttribute("resource-type", "Method");
                    methodTag.setAttribute("uri", method.uri);
                    methodTag.setAttribute("slot", "methods");
                    this.appendChild(methodTag);
                }

                let addMethodButton = document.createElement("ktbs4la2-add-resource-button");
                addMethodButton.setAttribute("parent-type", "Base");
                addMethodButton.setAttribute("parent-uri", this.getAttribute("uri"));
                addMethodButton.setAttribute("create-type", "Method");
                addMethodButton.setAttribute("slot", "methods");
                this.appendChild(addMethodButton);

                // create stored trace child elements
                let computed_traces = this._ktbsResource.computed_traces;

                for(let i = 0; i < computed_traces.length; i++) {
                    let computedTrace = computed_traces[i];
                    let computedTraceTag = document.createElement("ktbs4la2-main-related-resource");
                    computedTraceTag.setAttribute("resource-type", "ComputedTrace");
                    computedTraceTag.setAttribute("uri", computedTrace.uri);
                    computedTraceTag.setAttribute("slot", "computed-traces");
                    this.appendChild(computedTraceTag);
                }

                let addComputedTraceButton = document.createElement("ktbs4la2-add-resource-button");
                addComputedTraceButton.setAttribute("parent-type", "Base");
                addComputedTraceButton.setAttribute("parent-uri", this.getAttribute("uri"));
                addComputedTraceButton.setAttribute("create-type", "ComputedTrace");
                addComputedTraceButton.setAttribute("slot", "computed-traces");
                this.appendChild(addComputedTraceButton);
            }

            if(resourceType == "Model") {
                let diagram = document.createElement("ktbs4la2-model-diagram");
                diagram.setAttribute("slot", "head-content");
                diagram.setAttribute("uri", this.getAttribute("uri"));
                this.appendChild(diagram);
            }

            if(resourceType == "Method") {
                let parentMethod = this._ktbsResource.parent_method;

                if(parentMethod) {
                    let methodElement = document.createElement("ktbs4la2-main-related-resource");
                    methodElement.setAttribute("resource-type", "Method");
                    methodElement.setAttribute("uri", parentMethod.uri);
                    methodElement.setAttribute("slot", "parent-method");
                    this.appendChild(methodElement);
                }
            }

            if(resourceType == "ComputedTrace") {
                let methodElement = document.createElement("ktbs4la2-main-related-resource");
                methodElement.setAttribute("resource-type", "Method");
                methodElement.setAttribute("uri", this._ktbsResource.parent_method.uri);
                methodElement.setAttribute("slot", "method");
                this.appendChild(methodElement);
            }
           
            if((resourceType == "Method") || (resourceType == "ComputedTrace") || (resourceType == "StoredTrace")) {
                let model = this._ktbsResource.model;
                
                if(model) {
                    let modelElement = document.createElement("ktbs4la2-main-related-resource");
                    modelElement.setAttribute("resource-type", "Model");
                    modelElement.setAttribute("uri", model.uri);
                    modelElement.setAttribute("slot", "model");
                    this.appendChild(modelElement);
                }
            }
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		super.onktbsResourceLoadFailed(error);

		this._componentReady.then(() => {
			this._resourceStatusString = "Error";
			this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
			this.errorMessageDiv.innerText = " (" + error + ")";
			this._containerDiv.className = "error";
		});
    }
    
    /**
	 * 
	 */
	onClickEditButton(event) {
		this.requestEditResource();
	}

	/**
	 * 
	 */
	onClickRemoveButton(event) {
		this.requestDeleteResource();
	}
}

customElements.define('ktbs4la2-main-resource', KTBS4LA2MainResource);