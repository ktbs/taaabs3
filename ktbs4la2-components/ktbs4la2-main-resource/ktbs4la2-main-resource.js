import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Ktbs} from "../../ktbs-api/Ktbs.js";
import {Base} from "../../ktbs-api/Base.js";
import {Model} from "../../ktbs-api/Model.js";
import {StoredTrace} from "../../ktbs-api/StoredTrace.js";
import {Method} from "../../ktbs-api/Method.js";
import {ComputedTrace} from "../../ktbs-api/ComputedTrace.js";
import * as KTBSErrors from "../../ktbs-api/Errors.js";

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
        this._rootBuiltinMethodList = this.shadowRoot.querySelector("#root-builin-methods");
        this.editButton = this.shadowRoot.querySelector("#tool-edit");
		this.editButton.addEventListener("click", this.onClickEditButton.bind(this));
		this.removeButton = this.shadowRoot.querySelector("#tool-remove");
        this.removeButton.addEventListener("click", this.onClickRemoveButton.bind(this));
        this._disconnectButton = this.shadowRoot.querySelector("#disconnect-button");
        this._disconnectButton.addEventListener("click", this._onClickDisconnectButton.bind(this));
        this._aboutSection = this.shadowRoot.querySelector("#resource-about");
        this._toggleAboutVisibilityButton = this.shadowRoot.querySelector("#resource-about-toggle");
        this._toggleAboutVisibilityButton.addEventListener("click", this._onClickToggleAboutVisibilityButton.bind(this));
        this.versionLabel = this.shadowRoot.querySelector("#version-label");
        this.childBasesSubsection  = this.shadowRoot.querySelector("#child-bases");
        this.childModelsSubsection  = this.shadowRoot.querySelector("#child-models");
		this.childStoredTracesSubsection  = this.shadowRoot.querySelector("#child-stored-traces");
		this.childMethodsSubsection  = this.shadowRoot.querySelector("#child-methods");
        this.childComputedTracesSubsection  = this.shadowRoot.querySelector("#child-computed-traces");
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
    }
    
    /**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri")
			this._componentReady.then(() => {
                let resourceType = this.getAttribute("resource-type");
                this.resourceTypeLabel.innerText = this._translateString(KTBS4LA2MainResource._getResourceTypeLabel(resourceType));

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
			this.linkTag.innerText = this.getAttribute("uri");
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoaded() {
		this._componentReady.then(() => {
            let resourceType = this.getAttribute("resource-type");
        
			if(!this.getAttribute("label")) {
				let label = this._ktbsResource.label;

				if(label)
					this.titleTag.innerText = label;
			}

            if(this._ktbsResource.authentified) {
                this._resourceStatusString = "Access granted";
                this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                this._containerDiv.className = "access-granted";
            }
            else {
                this._resourceStatusString = "Online";
                this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                this._containerDiv.className = "online";
            }

            if(resourceType == "Ktbs") {
                let version = this._ktbsResource.version;

                if(version)
                    this.versionTag.innerText = version;
            
                let comment = this._ktbsResource.comment;

                if(comment) {
                    this.commentTag.innerText = comment;
                    this.commentTag.style.display = "block";
                }
                else
                    this.commentTag.style.display = "none";

                
                
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
                // remove previously instanciated base child elements
                let childBaseElements = this.querySelectorAll("[slot = bases]");

                for(let i = 0; i < childBaseElements.length; i++) {
                    let aChildBaseElement = childBaseElements[i];
                    this.removeChild(aChildBaseElement);
                }
                // ---

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
                // remove previously instanciated model child elements
                let childModelElements = this.querySelectorAll("[slot = models]");

                for(let i = 0; i < childModelElements.length; i++) {
                    let aChildModelElement = childModelElements[i];
                    this.removeChild(aChildModelElement);
                }
                // ---

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

                // remove previously instanciated stored trace child elements
                let childStoredTraceElements = this.querySelectorAll("[slot = stored-traces]");

                for(let i = 0; i < childStoredTraceElements.length; i++) {
                    let aChildStoredTraceElement = childStoredTraceElements[i];
                    this.removeChild(aChildStoredTraceElement);
                }
                // ---

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

                // remove previously instanciated method child elements
                let childMethodElements = this.querySelectorAll("[slot = methods]");

                for(let i = 0; i < childMethodElements.length; i++) {
                    let aChildMethodElement = childMethodElements[i];
                    this.removeChild(aChildMethodElement);
                }
                // ---

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

                // remove previously instanciated computed-trace child elements
                let childComputedTraceElements = this.querySelectorAll("[slot = computed-traces]");

                for(let i = 0; i < childComputedTraceElements.length; i++) {
                    let aChildComputedTraceElement = childComputedTraceElements[i];
                    this.removeChild(aChildComputedTraceElement);
                }
                // ---

                // create computed trace child elements
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
                    methodElement.setAttribute("slot", "parent-method");
                    this.appendChild(methodElement);
                }
            }

            if(resourceType == "ComputedTrace") {
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
                methodElement.setAttribute("slot", "method");
                this.appendChild(methodElement);
            }
           
            if((resourceType == "Method") || (resourceType == "ComputedTrace") || (resourceType == "StoredTrace")) {
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
        if((error instanceof KTBSErrors.HttpError) && ((error.statusCode == 401) || (error.statusCode == 403))) {
			this._componentReady.then(() => {
                if(error.statusCode == 401) {
                    this._resourceStatusString = "Authentication required";
                    this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                    this._containerDiv.className = "authentication-required";
				}
				else if(error.statusCode == 403) {
					this._resourceStatusString = "Access denied";
                    this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                    this._containerDiv.className = "access-denied";
				}
            });
		}
		else {
            super.onktbsResourceLoadFailed(error);

            this._componentReady.then(() => {
                this._resourceStatusString = "Error";
                this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                this.errorMessageDiv.innerText = " (" + error + ")";
                this._containerDiv.className = "error";
            });
        }
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

            this._ktbsResource.force_state_refresh();

            this._ktbsResource.get(this._abortController.signal, credentials)
                .then(() => {
                    this._userNameInput.value = "";
                    this._passwordInput.value = "";
                    this.onktbsResourceLoaded();

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
                })
                .catch((error) => {
                    if((error instanceof KTBSErrors.HttpError) && ((error.statusCode == 401) || (error.statusCode == 403))) {
                        this._authErrorMessage.innerText = this._translateString("Access denied");
                        this._authErrorMessage.style.display = "block";
                    }
                    else
                        this.onktbsResourceLoadFailed(error);
                });
        }
    }

    /**
     * 
     */
    _onClickDisconnectButton(event) {
        if((this._ktbsResource.syncStatus == "in_sync") && (this._ktbsResource.authentified)) {
            this._ktbsResource.disconnect();
            this._initktbsResourceLoadedPromise();

            this._ktbsResource.get(this._abortController.signal)
                .then(() => {
                    this._resolveKtbsResourceLoaded();
                })
                .catch((error) => {
                    this._rejectKtbsResourceLoaded(error);
                });
        }
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
}

customElements.define('ktbs4la2-main-resource', KTBS4LA2MainResource);