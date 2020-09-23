import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Resource} from "../../ktbs-api/Resource.js";
import * as KTBSErrors from "../../ktbs-api/Errors.js";

import "../ktbs4la2-main-subsection/ktbs4la2-main-subsection.js";
import "../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js";
import "../ktbs4la2-model-diagram/ktbs4la2-model-diagram.js";
import "../ktbs4la2-trace-stats/ktbs4la2-trace-stats.js";
import "../ktbs4la2-icon-tabs/ktbs4la2-icon-tabs-group.js";
import "../ktbs4la2-trace-table/ktbs4la2-trace-table.js";
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
        
        let breadcrumbsStylesheetURL = import.meta.url.substr(0, import.meta.url.lastIndexOf('/')) + '/breadcrumbs.css';
		let breadcrumbsStyleLink = document.createElement("link");
		breadcrumbsStyleLink.setAttribute("rel", "stylesheet");
		breadcrumbsStyleLink.setAttribute("href", breadcrumbsStylesheetURL);
		this.appendChild(breadcrumbsStyleLink);

        this._header = this.shadowRoot.querySelector("#header");
        this.titleTag = this.shadowRoot.querySelector("#title");
		this.linkTag = this.shadowRoot.querySelector("#resource-link");		
		this.resourceTypeLabel = this.shadowRoot.querySelector("#resource-type-label");
		this.resourceStatusTag = this.shadowRoot.querySelector("#resource-status");
        this.resourceStatusLabel = this.shadowRoot.querySelector("#resource-status-label");
        this._resourceDescription = this.shadowRoot.querySelector("#resource-description");
        this.errorMessageDiv = this.shadowRoot.querySelector("#error-message");
        this.versionTag = this.shadowRoot.querySelector("#root-version");
        this.commentTag = this.shadowRoot.querySelector("#root-comment");
        this._foldHeaderButton = this.shadowRoot.querySelector("#fold-header-button");
        this._foldHeaderButton.addEventListener("click", this._onClickFoldHeaderButton.bind(this))
        this._rootBuiltinMethodList = this.shadowRoot.querySelector("#root-builin-methods");
        /*this.editButton = this.shadowRoot.querySelector("#tool-edit");
		this.editButton.addEventListener("click", this.onClickEditButton.bind(this));*/
		this.removeButton = this.shadowRoot.querySelector("#tool-remove");
        this.removeButton.addEventListener("click", this.onClickRemoveButton.bind(this));
        this._disconnectButton = this.shadowRoot.querySelector("#disconnect-button");
        this._disconnectButton.addEventListener("click", this._onClickDisconnectButton.bind(this));
        this._aboutSection = this.shadowRoot.querySelector("#resource-about");
        this._toggleAboutVisibilityButton = this.shadowRoot.querySelector("#resource-about-toggle");
        this._toggleAboutVisibilityButton.addEventListener("click", this._onClickToggleAboutVisibilityButton.bind(this));
        this.versionLabel = this.shadowRoot.querySelector("#version-label");
        this._rootBuilinMethodsHeader = this.shadowRoot.querySelector("#root-builin-methods-header");
        this.childBasesSubsection = this.shadowRoot.querySelector("#child-bases");
        this.childModelsSubsection = this.shadowRoot.querySelector("#child-models");
		this.childStoredTracesSubsection = this.shadowRoot.querySelector("#child-stored-traces");
		this.childMethodsSubsection = this.shadowRoot.querySelector("#child-methods");
        this.childComputedTracesSubsection = this.shadowRoot.querySelector("#child-computed-traces");
        this._parentMethodSubsection = this.shadowRoot.querySelector("#parent-method");
        this._modelSubsection = this.shadowRoot.querySelector("#model");
        this._methodSubsection = this.shadowRoot.querySelector("#method");
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
                if(!this.hasAttribute("label"))
                    this.titleTag.innerText = Resource.extract_relative_id(newValue);
            });
        }
        else if(attributeName == "label") {
            this._componentReady.then(() => {
                this.titleTag.innerText = newValue;
            });
        }
        else if(attributeName == "resource-type") {
            this._componentReady.then(() => {
                this.resourceTypeLabel.innerText = this._translateString(KTBS4LA2MainResource._getResourceTypeLabel(newValue));

                if((newValue == "ComputedTrace") || (newValue == "StoredTrace")) {
                    let obselsTimelineElement = document.createElement("ktbs4la2-trace-timeline");
                    obselsTimelineElement.setAttribute("uri", this.getAttribute("uri"));
                    obselsTimelineElement.setAttribute("slot", "obsels-timeline");
                    this.appendChild(obselsTimelineElement);

                    let obselsTableElement = document.createElement("ktbs4la2-trace-table");
                    obselsTableElement.setAttribute("uri", this.getAttribute("uri"));
                    obselsTableElement.setAttribute("slot", "obsels-table");
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
        this.resourceTypeLabel.innerText = this._translateString(KTBS4LA2MainResource._getResourceTypeLabel(resourceType));
		this.linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
        this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
        //this.editButton.setAttribute("title", this._translateString("Edit"));
        this.removeButton.setAttribute("title", this._translateString("Delete"));
        
        if(this._aboutSection.classList.contains("expanded"))
            this._toggleAboutVisibilityButton.setAttribute("title", this._translateString("Hide additional informations"));
        else
            this._toggleAboutVisibilityButton.setAttribute("title", this._translateString("Show additional informations"));

        this.versionLabel.innerText = this._translateString("Version");
        this._rootBuilinMethodsHeader.innerText = this._translateString("Builtin methods");
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
        this._parentMethodSubsection.setAttribute("lang", this._lang);
        this._parentMethodSubsection.setAttribute("title", this._translateString("Parent method") + " : ");
        this._modelSubsection.setAttribute("lang", this._lang);
        this._modelSubsection.setAttribute("title", this._translateString("Model") + " : ");
        this._methodSubsection.setAttribute("lang", this._lang);
        this._methodSubsection.setAttribute("title", this._translateString("Method") + " : ");
        this._obselsSubsection.setAttribute("lang", this._lang);
        this._obselsSubsection.setAttribute("title", this._translateString("Obsels") + " : ");
        this._timelineTab.setAttribute("lang", this._lang);
        this._timelineTab.setAttribute("title", this._translateString("Timeline view"));
        this._tableTab.setAttribute("lang", this._lang);
        this._tableTab.setAttribute("title", this._translateString("Table view"));
        this._statsSubsection.setAttribute("lang", this._lang);
        this._statsSubsection.setAttribute("title", this._translateString("Statistics") + " : ");
        this._addBaseButton.setAttribute("title", this._translateString("Create a new base"));
        this._addModelButton.setAttribute("title", this._translateString("Create a new model"));
        this._addStoredTraceButton.setAttribute("title", this._translateString("Create a new stored trace"));
        this._addMethodButton.setAttribute("title", this._translateString("Create a new method"));
        this._addComputedTraceButton.setAttribute("title", this._translateString("Create a new computed trace"));
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
    _onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {
            let resourceType = this.getAttribute("resource-type");
        
			if(!this.getAttribute("label")) {
				let label = this._ktbsResource.label;

				if(label)
					this.titleTag.innerText = label;
            }
            
            let parentResource = this._ktbsResource.parent;

            if(parentResource) {
                const breadCrumbsItems = this.querySelectorAll("[slot = breadcrumbs]");

                for(let i = 0; i < breadCrumbsItems.length; i++)
                    breadCrumbsItems[i].remove();

                this._addBreadcrumb(parentResource);
            }

            if(this._ktbsResource.authentified) {
                if(this._ktbsResource.hasOwnCredendtials) {
                    this._containerDiv.className = "access-granted";
                    this._resourceStatusString = "Access granted";
                }
                else {
                    this._containerDiv.className = "access-inherited";
                    this._resourceStatusString = "Access inherited";
                }

                this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
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

                    if(parentMethod.label)
                        methodElement.setAttribute("label", parentMethod.label);
                    
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

                if(this._ktbsResource.method.label)
                    methodElement.setAttribute("label", this._ktbsResource.method.label);

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

                    if(model.label)
                        modelElement.setAttribute("label", model.label);

                    modelElement.setAttribute("slot", "model");
                    this.appendChild(modelElement);
                }
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
                this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
                this._containerDiv.className = "pending";
            });
        }
    }

    /**
     * 
     */
    _onKtbsResourceSyncNeedsAuth() {
        this._componentReady.then(() => {
            this._resourceStatusString = "Authentication required";
            this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            this._containerDiv.className = "authentication-required";
        });
    }

    /**
     * 
     */
    _onKtbsResourceSyncAccessDenied() {
        this._componentReady.then(() => {
            this._resourceStatusString = "Access denied";
            this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            this._containerDiv.className = "access-denied";
        });
    }

	/**
	 * 
	 */
	_onKtbsResourceSyncError(old_syncStatus, error) {
        super._onKtbsResourceSyncError(old_syncStatus, error);

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
    _onKtbsResourceLifecycleDeleted() {
        this._componentReady.then(() => {
            this._resourceStatusString = "Deleted";
            this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
            this._containerDiv.className = "deleted";
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
	/*onClickEditButton(event) {
		this.requestEditResource();
	}*/

	/**
	 * 
	 */
	onClickRemoveButton(event) {
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
}

customElements.define('ktbs4la2-main-resource', KTBS4LA2MainResource);