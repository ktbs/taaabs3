import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";

// @TODO : check if the following imports are really necessary
import {Ktbs} from "../../ktbs-api/Ktbs.js";
import {Base} from "../../ktbs-api/Base.js";
import {Model} from "../../ktbs-api/Model.js";
import {Method} from "../../ktbs-api/Method.js";
import {StoredTrace} from "../../ktbs-api/Trace.js";
import {ComputedTrace} from "../../ktbs-api/Trace.js";
// ---

import "../ktbs4la2-overlay/ktbs4la2-overlay.js";
import "../ktbs4la2-root-form/ktbs4la2-root-form.js";
import "../ktbs4la2-nav-resource/ktbs4la2-nav-resource.js";
import "../ktbs4la2-main-documentation/ktbs4la2-main-documentation.js";
import "../ktbs4la2-main-resource/ktbs4la2-main-resource.js";


/**
 * 
 */
class KTBS4LA2Application extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true, false);
		this._is_resizing = false;
		this._resizing_initial_width = 250;
		this._resizing_origin_x = null;
		this._selectedNavElement = null;
		this._selectedResourceHierarchy = new Array();
		this._bindedResizeFunction = this.resize.bind(this);
		this._bindedStopresizingFunction = this.stopResizing.bind(this);
	}

	/**
	 * 
	 */
	onComponentReady() {
		this.homeLink = this.shadowRoot.querySelector("#home-link");
		this.homeLink.setAttribute("href", window.location);
		this.homeLink.addEventListener("click", this.onClickHomeLink.bind(this));
		this.leftPanel = this.shadowRoot.querySelector("#left-panel");
		this.foldButton = this.shadowRoot.querySelector("#fold-button");
		this.foldButton.addEventListener("click", this.toggleLeftPanelHidden.bind(this));
		this.myKtbsRootSubtitle = this.shadowRoot.querySelector("#my-ktbs-roots-subtitle");
		this.addRootButton = this.shadowRoot.querySelector("#add-root-button");
		this.addRootButton.addEventListener("click", this.onClickAddRootButton.bind(this));
		this.myDashBoardsSubtitle = this.shadowRoot.querySelector("#my-dashboards-subtitle");
		this.addDashboardButton = this.shadowRoot.querySelector("#add-dashboard-button");
		this.addDashboardButton.addEventListener("click", this.onClickAddDashboardButton.bind(this));
		this.separatorDiv = this.shadowRoot.querySelector("#separator");
		this.separatorDiv.addEventListener("mousedown", this.startResizing.bind(this), true);
		this.addEventListener("selectelement", this.onSelectNavElement.bind(this));
		this.addEventListener("error", this.onErrorEvent.bind(this));
		this.addEventListener("request-edit-ktbs-resource", this.onRequestEditKtbsResource.bind(this));
		this.addEventListener("request-delete-ktbs-resource", this.onRequestDeleteKtbsResource.bind(this));
		this.addEventListener("fold-header", this._onMainResourceFoldHeader.bind(this));
		this.addEventListener("unfold-header", this._onMainResourceUnfoldHeader.bind(this));
		this._navNodesObserver = new MutationObserver(this.onNavNodesMutation.bind(this));
		this._navNodesObserver.observe(this, { childList: true, subtree: true });
		this.loadStoredRoots();
		this.loadMainObjectFromWindowLocation();
		window.addEventListener("popstate", this.onWindowPopState.bind(this));

		this._langButtons = this.shadowRoot.querySelectorAll("#lang-selector .lang-button");

		for(let i = 0; i < this._langButtons.length; i++) {
			let aLangButton = this._langButtons[i];
			aLangButton.addEventListener("click", this._onClickLangButton.bind(this));
		}
	}

	/**
	 * 
	 */
	get mainHeaderFolded() {
		if(this._mainHeaderFolded === undefined)
			this._mainHeaderFolded = (window.localStorage.getItem("main-header-folded") == "true");

		return this._mainHeaderFolded;
	}

	/**
	 * 
	 */
	set mainHeaderFolded(newValue) {
		if(typeof newValue === "boolean") {
			this._mainHeaderFolded = newValue;
			window.localStorage.setItem("main-header-folded", newValue);
		}
		else
			throw new TypeError("Value for mainHeaderFolded must be a Boolean");
	}

	/**
	 * 
	 */
	_onMainResourceFoldHeader(event) {
		this.mainHeaderFolded = true;
	}

	/**
	 * 
	 */
	_onMainResourceUnfoldHeader(event) {
		this.mainHeaderFolded = false;
	}

	/**
	 * 
	 */
	_onClickLangButton(event) {
		let langButton = event.target;

		if(langButton.getAttribute("lang")) {
			let newLang = langButton.getAttribute("lang");
			window.localStorage.setItem("lang", newLang);
			this.setAttribute("lang", newLang);
		}
	}

	/**
	 * 
	 */
	_determineLang() {
		if(window.localStorage.getItem("lang") != null)
			this._lang = window.localStorage.getItem("lang");
		else {
			let browserLang = navigator.language || navigator.userLanguage;

			if(browserLang) {
				let dashPosition = browserLang.indexOf("-");

				if(dashPosition != -1)
					this._lang = browserLang.substr(0, dashPosition);
				else
					this._lang = browserLang;
			}
			else
				super._determineLang();
		}
	}

	_initLang() {
		super._initLang();
		
		if(!this.getAttribute("lang"))
			this.setAttribute("lang", this._lang);

		if(window.localStorage.getItem("lang") == null)
			window.localStorage.setItem("lang", this._lang);

		this._componentReady.then(function() {
			for(let i = 0; i < this._langButtons.length; i++) {
				let aLangButton = this._langButtons[i];
				
				if(aLangButton.getAttribute("lang") == this._lang) {
					if(!aLangButton.classList.contains("selected"))
						aLangButton.classList.add("selected");
				}
				else {
					if(aLangButton.classList.contains("selected"))
						aLangButton.classList.remove("selected");
				}
			}
		}.bind(this));
	}

	_updateStringsTranslation() {
		if(this.leftPanel.classList.contains("folded"))
			this.foldButton.setAttribute("title", this._translateString("Show navigation panel"));
		else
			this.foldButton.setAttribute("title", this._translateString("Hide navigation panel"));

		this.homeLink.setAttribute("title", this._translateString("Home"));
		this.myKtbsRootSubtitle.innerText = this._translateString("My kTBS roots");
		this.addRootButton.setAttribute("title", this._translateString("Add new kTBS root"));
		this.myDashBoardsSubtitle.innerText = this._translateString("My dashboards");
		this.addDashboardButton.setAttribute("title", this._translateString("Add new dashboard"));
		this.separatorDiv.setAttribute("title", this._translateString("Resize navigation panel"));
	}

	/**
	 * 
	 */
	onNavNodesMutation(mutationRecord, observer) {
		let mainElement = this.querySelector("[slot = \"main\"]");

		if((this._selectedNavElement == null) && (mainElement != null)) {
			for(let i = 0; i < mutationRecord.length; i++) {
				let addedNodes = mutationRecord[i].addedNodes;
		
				for(let j = 0; j < addedNodes.length; j++) {
					let addedNode = addedNodes[j];

					if((addedNode.localName == "ktbs4la2-nav-resource") && (addedNode.getAttribute("uri") == mainElement.getAttribute("uri"))) {
						addedNode.classList.add("selected");
						this._selectedNavElement = addedNode;
					}
					else if((addedNode.localName == "ktbs4la2-nav-resource") && (this._resourceUriIsParentOfSelected(addedNode.getAttribute("uri")))) {
						addedNode.classList.add("parent-of-selected");
					}
				}
			}
		}
	}

	/**
	 * 
	 */
	onRequestEditKtbsResource(event) {
		let target = event.target;
		let resourceType = target.getAttribute("resource-type");
		let uri = target.getAttribute("uri");
		let label = target.getAttribute("label");

		switch(resourceType) {
			case "Ktbs":
				let formElement = document.createElement("ktbs4la2-root-form");
				formElement.setAttribute("uri", uri);
				formElement.setAttribute("label", label);
				formElement.addEventListener("submit", this.onSubmitEditRootForm.bind(this));
				formElement.addEventListener("cancel", this.removeOverlay.bind(this));
				this.setOverlay(formElement);
				break;
			default:
				this.emitErrorEvent(new Error("Unsupported resource type : " + resourceType));
		}
	}

	/**
	 * 
	 */
	onRequestDeleteKtbsResource(event) {
		let target = event.target;
		let resourceType = target.getAttribute("resource-type");
		let uri = target.getAttribute("uri");
		let label = target.getAttribute("label");

		switch(resourceType) {
			case "Ktbs":
				if(confirm(this._translateString("You are about to remove ") + "\"" + label + "\" "+ this._translateString("(uri : ") + uri + this._translateString(") from \"My kTBS roots\".\nPlease note this will only make KTBS4LA2 \"forget\" about this kTBS root, but will not affect the kTBS root itself or the data hosted on it.\nAre you sure ?"))) {
					let ktbsRootEntryFound = false;
					let i;

					for(i = 0; !ktbsRootEntryFound && (i < this.ktbsRoots.length); i++) {
						if(this.ktbsRoots[i].uri == uri) {
							ktbsRootEntryFound = true;
							break;
						}
					}

					if(ktbsRootEntryFound) {
						this.ktbsRoots.splice(i,1);
						window.localStorage.setItem("ktbs-roots", JSON.stringify(this.ktbsRoots));
					}
					else
						this.emitErrorEvent(new Error("Could not find Ktbs Root with uri " + oldRootUri + " in local cache"));
				}
	
				break;
			default:
				this.emitErrorEvent(new Error("Unsupported resource type : " + resourceType));
		}
	}

	/**
	 * 
	 */
	onErrorEvent(event) {
		event.preventDefault();
		event.stopPropagation();

		if(this.debug && event.error)
			console.error(event.error);
	}

	get debug() {
		return ((this.getAttribute("debug") == "true") || (this.getAttribute("debug") == "1"));
	}

	/**
	 * 
	 */
	loadMainObjectFromWindowLocation() {
		if(window.location.hash && (window.location.hash.charAt(0) == "#")) {
			// parse the data in window's URL hash
			let queryString = window.location.hash.substring(1);
			let queryParameterStrings = queryString.split('&');
			let queryParameters = new Array();

			if(queryParameterStrings instanceof Array) {
				for(let i =0; i < queryParameterStrings.length; i++) {
					let parameterString = queryParameterStrings[i];
					let parameterParts = parameterString.split('=');

					if((parameterParts instanceof Array) && (parameterParts.length == 2)) {
						let key = parameterParts[0];
						let value = parameterParts[1];
						queryParameters[key] = decodeURIComponent(value);
					}
				}
			}

			let main_type, main_id, ktbs_type, ktbs_label = null;

			if(queryParameters["type"] && queryParameters["uri"]) {
				main_type = "ktbs-resource";
				main_id = queryParameters["uri"];
				ktbs_type = queryParameters["type"];

				if(queryParameters["label"])
					ktbs_label = queryParameters["label"];
			}
			else if(queryParameters["dashboard"]) {
				main_type = "dashboard";
				main_id = queryParameters["dashboard"];
			}
			else {
				main_type = "documentation";

				if(queryParameters["doc"])
					main_id = queryParameters["doc"];
			}

			this.setMainObject(main_type, main_id, ktbs_type, ktbs_label, true);
		}
		else
			this.setMainObject("documentation", null, null, null, true);
	}

	/**	
	 * 
	 */
	onWindowPopState(event) {
		let main_type = event.state.main_type;
		let main_id, ktbs_type, ktbs_label = null;

		switch(main_type) {
			case "documentation":
				main_id = event.state.doc_path;
				break;
			case "ktbs-resource":
				main_id = event.state.ktbs_resource_uri;
				ktbs_type = event.state.ktbs_resource_type;
				ktbs_label = event.state.ktbs_resource_label;
				break;
			case "dashboard":
				// @TODO
				break;
			default:
				this.emitErrorEvent(new Error("History object with unkown type can not be set as main content"));
		}

		this.setMainObject(main_type, main_id, ktbs_type, ktbs_label, true);
	}

	/**
	 * 
	 */
	_get_resource_class(resource_class_name) {
		if(resource_class_name.match(/^[a-zA-Z0-9_]+$/)) {
			try {
				let JSClass = eval(resource_class_name);

				if(JSClass && (typeof JSClass === 'function') && (/^\s*class\s+/.test(JSClass.toString())))
					return JSClass;
				else
					throw new Error("\"" + resource_class_name + "\" is not a class name.");
			}
			catch(error) {
				throw new Error("Unknown class \"" + resource_class_name + "\"");
			}
		}
		else
			throw new Error("Invalid class name \"" + resource_class_name + "\"");
	}

	/**
	 * 
	 */
	setMainObject(main_type = "documentation", main_id = null, ktbs_type = null, ktbs_label = null, skipHistoryPush = false) {
		// remove previous main content
		let mainElements = this.querySelectorAll("[slot = \"main\"]");

		for(let i = 0; i < mainElements.length; i++)
			mainElements[i].remove();

		// de-select currently selected navigation panel element
		if((this._selectedNavElement != null) && this._selectedNavElement.classList.contains("selected"))
			this._selectedNavElement.classList.remove("selected");

		let previousSelectedParents =  this.querySelectorAll("[slot = \"nav-ktbs-roots\"].parent-of-selected, [slot = \"nav-ktbs-roots\"] .parent-of-selected");

		for(let i = 0; i < previousSelectedParents.length; i++)
			previousSelectedParents[i].classList.remove("parent-of-selected");

		this._selectedNavElement = null;
		this._selectedResourceHierarchy = new Array();

		// prepare new main element
		let mainContentChildrenTag;		

		// prepare history entry
		let historyState, historyURL;

		let historyLabel = "KTBS4LA2 - ";

		switch(main_type) {
			case "documentation":
				let doc_path = "/";
				historyURL = window.location.pathname;

				if(main_id) {
					doc_path += main_id;
					historyURL += "#" + encodeURIComponent(main_id);
					historyLabel += this._translateString("Documentation");
				}
				else
					historyLabel += this._translateString("Home");

				historyState = {main_type: "documentation", documentation_path: doc_path};
				mainContentChildrenTag = document.createElement("ktbs4la2-main-documentation");

				// build the url of the "documentation" path
				let docPath = window.location.origin;

				if(window.location.pathname)
					docPath += window.location.pathname;
				else
					docPath += "/";

				 docPath += "doc/";

				mainContentChildrenTag.setAttribute("doc-path", docPath);

				if(main_id)
					mainContentChildrenTag.setAttribute("page", main_id);

				mainContentChildrenTag.addEventListener("page-change", this.onDocChangePage.bind(this));
				break;
			case "ktbs-resource":				
				historyState = {main_type: "ktbs-resource", ktbs_resource_type: ktbs_type, ktbs_resource_uri: main_id, ktbs_resource_label: ktbs_label};
				historyURL = "#type=" + encodeURIComponent(ktbs_type) + "&uri=" + encodeURIComponent(main_id);

				if(ktbs_label) {
					historyLabel += ktbs_label;
					historyURL += "&label=" + encodeURIComponent(ktbs_label);
				}
				else
					historyLabel += main_id;

				historyLabel += " (" + ktbs_type + ")";

				// select the corresponding element in navigation panel
				let queryString = "[slot = \"nav-ktbs-roots\"][uri = \"" + main_id + "\"], [slot = \"nav-ktbs-roots\"] [uri = \"" + main_id + "\"]";
				let newSelectedNavElement = this.querySelector(queryString);

				if(newSelectedNavElement) {
					newSelectedNavElement.classList.add("selected");
					this._selectedNavElement = newSelectedNavElement;
				}

				let ktbsResource = ResourceMultiton.get_resource(this._get_resource_class(ktbs_type), main_id);
				this._selectedResourceHierarchy.unshift(ktbsResource);
				this._highlightNavParent(ktbsResource);

				// instantiate the new main element
				mainContentChildrenTag = document.createElement("ktbs4la2-main-resource");

				if(main_id != null)
					mainContentChildrenTag.setAttribute("uri", main_id);

				if(ktbs_type != null)
					mainContentChildrenTag.setAttribute("resource-type", ktbs_type);

				if(ktbs_label != null)
					mainContentChildrenTag.setAttribute("label", ktbs_label);

				if(this.mainHeaderFolded)
					mainContentChildrenTag.setAttribute("fold-header", "true");

				break;
			case "dashboard":
				// @TODO
				break;
			default:
				this.emitErrorEvent(new Error("Object with unkown type can not be set as main content"));
		}

		// add new content to main
		mainContentChildrenTag.setAttribute("slot", "main");
		this.appendChild(mainContentChildrenTag);

		// reset main area scrollbar
		this.shadowRoot.querySelector("#main-scrollable").scrollTop = 0;

		// push new entry to navigation history
		if(!skipHistoryPush)
			history.pushState(historyState, historyLabel, historyURL);

		window.document.title = historyLabel;
	}

	/**
	 * 
	 */
	_highlightNavParent(ktbsResource) {
		ktbsResource.get(this._abortController.signal).then(() => {
			let resourceParent = ktbsResource.parent;

			if(resourceParent) {
				this._selectedResourceHierarchy.unshift(resourceParent);
				let queryString = "[slot = \"nav-ktbs-roots\"][uri = \"" + resourceParent.uri + "\"], [slot = \"nav-ktbs-roots\"] [uri = \"" + resourceParent.uri + "\"]";
				let parentNavElement = this.querySelector(queryString);
				
				if(parentNavElement)
					if(!parentNavElement.classList.contains("parent-of-selected"))
						parentNavElement.classList.add("parent-of-selected");

				this._highlightNavParent(resourceParent);
			}
		})
		.catch((error) => {
			if(this.debug)
				console.error(error);
		});
	}

	/**
	 * 
	 */
	_resourceUriIsParentOfSelected(uri) {
		let isParentOfSelected = false;

		for(let i = 0; i < (this._selectedResourceHierarchy.length - 1); i++) {
			let aParent = this._selectedResourceHierarchy[i];

			if(aParent.uri == uri) {
				isParentOfSelected = true;
				break;
			}
		}

		return isParentOfSelected;
	}

	/**
	 * 
	 */
	onDocChangePage(event) {
		let newPage = event.detail.new_page;
		let historyState = {main_type: "documentation", doc_path: newPage}
		let historyURL = window.location.pathname + "#doc=" + encodeURIComponent(newPage);
		let newTitle = event.detail.new_title;
		let historyLabel = newTitle;
		history.pushState(historyState, historyLabel, historyURL);
		window.document.title = historyLabel;

		// reset main area scrollbar
		this.shadowRoot.querySelector("#main-scrollable").scrollTop = 0;
	}

	/**
	 * 
	 */
	onClickHomeLink(event) {
		event.preventDefault();

		let mainElements = this.querySelectorAll("[slot = \"main\"]");

		if(!mainElements[0] || (mainElements[0].localName != "ktbs4la2-main-documentation"))
			this.setMainObject("documentation");
		else {
			mainElements[0].setAttribute("page", "");
			let historyState = {main_type: "documentation", doc_path: ""}
			let newTitle = "KTBS4LA2 - " + this._translateString("Home");
			history.pushState(historyState, newTitle, window.location.pathname);
			window.document.title = newTitle;

			// reset main area scrollbar
			this.shadowRoot.querySelector("#main-scrollable").scrollTop = 0;
		}
	}

	/**
	 * 
	 */
	onSelectNavElement(event) {
		let newSelectedElement = event.target;

		if((this._selectedNavElement == null) || (this._selectedNavElement.getAttribute("uri") != newSelectedElement.getAttribute("uri")))
			this.setMainObject("ktbs-resource", newSelectedElement.getAttribute("uri"), newSelectedElement.getAttribute("resource-type"), newSelectedElement.getAttribute("label"));
	}

	/**
	 * 
	 */
	toggleLeftPanelHidden(event) {
		if(this.leftPanel.className == "unfolded") {
			this._resizing_initial_width = this.leftPanel.offsetWidth;
			this._nav_initial_scroll = this.shadowRoot.querySelector("#nav-content").scrollTop;
			this.leftPanel.className = "folded";				
			this.leftPanel.style.width = "20px";
			this.foldButton.title = this._translateString("Show navigation panel");
		}
		else {
			this.foldButton.title = this._translateString("Hide navigation panel");
			this.leftPanel.className = "unfolded";

			if(this._resizing_initial_width > 0) {
				this.leftPanel.style.width = this._resizing_initial_width + "px";
				this.shadowRoot.querySelector("#nav-content").scrollTop = this._nav_initial_scroll;
			}
			else
				this.leftPanel.style.width = "250px";
		}
	}

	/**
	 * 
	 */
	startResizing(event) {
		this._is_resizing = true;
		this._resizing_origin_x = event.clientX;
		this._resizing_initial_width = this.leftPanel.offsetWidth;
		this._nav_initial_scroll = this.shadowRoot.querySelector("#nav-content").scrollTop;
		document.body.addEventListener("mousemove", this._bindedResizeFunction, true);
		document.body.addEventListener("mouseup", this._bindedStopresizingFunction, true);
		event.preventDefault();
	}

	/**
	 * 
	 */
	resize(event) {
		if(this._is_resizing) {
			let newMouseX = event.clientX;
			let mouseXDelta = newMouseX - this._resizing_origin_x;
			let newNavWidth = this._resizing_initial_width + mouseXDelta;
			
			if(newNavWidth < 20)
				newNavWidth = 20;

			if((newNavWidth > 20) && (this.leftPanel.className != "unfolded"))
				this.leftPanel.className = "unfolded";
			else 
				if((newNavWidth <= 20) && (this.leftPanel.className != "folded"))
					this.leftPanel.className = "folded";

			this.leftPanel.style.width = newNavWidth + "px";
			event.preventDefault();
		}
	}

	/**
	 * 
	 */
	stopResizing(event) {
		document.body.removeEventListener("mousemove", this._bindedResizeFunction, true);
		document.body.removeEventListener("mouseup", this._bindedStopresizingFunction, true);
		this._is_resizing = false;
		event.preventDefault();
	}

	/**
	 * 
	 */
	onClickAddRootButton(event) {
		let formElement = document.createElement("ktbs4la2-root-form");
		formElement.addEventListener("submit", this.onSubmitAddRootForm.bind(this));
		formElement.addEventListener("cancel", this.removeOverlay.bind(this));
		this.setOverlay(formElement);
	}

	/**
	 * 
	 */
	onSubmitAddRootForm(event) {
		let newRootUri = event.detail.uri;
		let newRootLabel = event.detail.label;
		this.storeNewRoot(newRootUri, newRootLabel);
		this.addRootItem(newRootUri, newRootLabel);
		this.removeOverlay();
	}

	/**
	 * 
	 */
	onSubmitEditRootForm(event) {
		let oldRootUri = event.detail.old_uri;
		let newRootUri = event.detail.uri;
		let newRootLabel = event.detail.label;
		let ktbsRootEntryFound = false;
		let i;

		for(i = 0; !ktbsRootEntryFound && (i < this.ktbsRoots.length); i++) {
			if(this.ktbsRoots[i].uri == oldRootUri) {
				ktbsRootEntryFound = true;
				break;
			}
		}

		if(ktbsRootEntryFound) {
			this.ktbsRoots[i].uri = newRootUri;
			this.ktbsRoots[i].label = newRootLabel;
			window.localStorage.setItem("ktbs-roots", JSON.stringify(this.ktbsRoots));
			let rootElements = this.querySelectorAll("[resource-type = \"Ktbs\"][uri = \"" + oldRootUri + "\"]");
			
			for(let i = 0; i < rootElements.length; i++) {
				let element = rootElements[i];

				if(oldRootUri != newRootUri)
					element.setAttribute("uri", newRootUri);

				element.setAttribute("label", newRootLabel);
			}
		}
		else
			this.emitErrorEvent(new Error("Could not find Ktbs Root with uri " + oldRootUri + " in local storage"));

		this.removeOverlay();
	}

	/**
	 * 
	 */
	addRootItem(newRootUri, newRootLabel) {
		let newRootElement = document.createElement("ktbs4la2-nav-resource");
		newRootElement.setAttribute("uri", newRootUri);
		newRootElement.setAttribute("label", newRootLabel);
		newRootElement.setAttribute("resource-type", "Ktbs");
		newRootElement.setAttribute("slot", "nav-ktbs-roots");
		this.appendChild(newRootElement);
	}

	/**
	 * 
	 */
	setOverlay(childContentElement) {
		if(this.currentOverlay != null)
			this.currentOverlay.remove();

		this.currentOverlay = document.createElement("ktbs4la2-overlay");
		this.currentOverlay.appendChild(childContentElement);
		this.currentOverlay.setAttribute("slot", "overlay");

		this.currentOverlay.addEventListener("closerequest", this.removeOverlay.bind(this));

		this.shadowRoot.querySelector("#overlay").style.display = "block";
		this.appendChild(this.currentOverlay);
	}

	/**
	 * 
	 */
	removeOverlay() {
		if(this.currentOverlay != null) {
			this.shadowRoot.querySelector("#overlay").style.display = "none";
			this.currentOverlay.remove();
			this.currentOverlay = null;
		}
	}

	/**
	 * 
	 */
	onClickAddDashboardButton(event) {
		console.log("KTBS4LA2Ui::onClickAddDashboardButton()");
	}

	/**
	 * 
	 */
	storeNewRoot(newRootUri, newRootLabel) {
		this.ktbsRoots.push({uri: newRootUri, label: newRootLabel});
		window.localStorage.setItem("ktbs-roots", JSON.stringify(this.ktbsRoots));
	}

	/**
	 * 
	 */
	loadStoredRoots() {
		if(window.localStorage.getItem("ktbs-roots") != null) {
			try {
				this.ktbsRoots = JSON.parse(window.localStorage.getItem("ktbs-roots"));

				for(let i = 0; i < this.ktbsRoots.length; i++) {
					let aRoot = this.ktbsRoots[i];
					this.addRootItem(aRoot.uri, aRoot.label);
				}
			}
			catch(error) {
				this.emitErrorEvent(error);
				this.ktbsRoots = new Array();
			}
		}
		else
			this.ktbsRoots = new Array();
	}
}

customElements.define('ktbs4la2-application', KTBS4LA2Application);
