import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";
import {Resource} from "../../ktbs-api/Resource.js";
import {Ktbs} from "../../ktbs-api/Ktbs.js";
import {Base} from "../../ktbs-api/Base.js";
import {Model} from "../../ktbs-api/Model.js";
import {Method} from "../../ktbs-api/Method.js";
import {Trace} from "../../ktbs-api/Trace.js";
import {StoredTrace} from "../../ktbs-api/Trace.js";
import {ComputedTrace} from "../../ktbs-api/Trace.js";

import "../ktbs4la2-overlay/ktbs4la2-overlay.js";
import "../ktbs4la2-root-form/ktbs4la2-root-form.js";
import "../ktbs4la2-nav-resource/ktbs4la2-nav-resource.js";
import "../ktbs4la2-main-documentation/ktbs4la2-main-documentation.js";
import "../ktbs4la2-main-home/ktbs4la2-main-home.js";
import "../ktbs4la2-main-resource/ktbs4la2-main-resource.js";
import "../ktbs4la2-create-resource-form/ktbs4la2-create-resource-form.js";
import "../ktbs4la2-store-stylesheet-rules-to-method-form/ktbs4la2-store-stylesheet-rules-to-method-form.js";
import "../ktbs4la2-csv-trace-import/ktbs4la2-csv-trace-import.js";
import {ObselType} from "../../ktbs-api/ObselType.js";
import {KtbsError} from "../../ktbs-api/Errors.js";

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
		this._bindedResizeFunction = this.resize.bind(this);
		this._bindedStopresizingFunction = this.stopResizing.bind(this);
		this._bindedOnMouseMoveFunction = this._onMouseMove.bind(this);
		this._rootElementsMutationObserver = new MutationObserver(this._onRootElementsMutation.bind(this));
		this._userScrolled = false;
		this._ignoreNextScrollEvents = false;
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._navContentDiv = this.shadowRoot.querySelector("#nav-content");
		this._navContentDiv.addEventListener("scroll", this._onScrollNavContentDiv.bind(this));
		this.homeLink = this.shadowRoot.querySelector("#home-link");
		this.homeLink.setAttribute("href", window.location.origin + window.location.pathname);
		this.homeLink.addEventListener("click", this.onClickHomeLink.bind(this));
		this.leftPanel = this.shadowRoot.querySelector("#left-panel");
		this.foldButton = this.shadowRoot.querySelector("#fold-button");
		this.foldButton.addEventListener("click", this.toggleLeftPanelHidden.bind(this));
		this.myKtbsRootSubtitle = this.shadowRoot.querySelector("#my-ktbs-roots-subtitle");
		//this.myDashboardsSubtitle = this.shadowRoot.querySelector("#my-dashboards-subtitle");
		this._rootList = this.shadowRoot.querySelector("#root-list");
		this._rootList.addEventListener("selectelement", this.onSelectNavElement.bind(this));
		this._navNodesObserver = new MutationObserver(this.onNavNodesMutation.bind(this));
		this._navNodesObserver.observe(this._rootList, { childList: true, subtree: true });
		this.separatorDiv = this.shadowRoot.querySelector("#separator");
		this.separatorDiv.addEventListener("mousedown", this.startResizing.bind(this), true);
		this._mainContentDiv = this.shadowRoot.querySelector("#main-content");
		this._mainContentDiv.addEventListener("request-navigate-to-ktbs-resource", this._onRequestNavigateToKtbsResource.bind(this));
		this._mainContentDiv.addEventListener("request-documentation-page", this._onRequestDocumentationPage.bind(this));
		this._mainContentDiv.addEventListener("request-add-ktbs-root", this._onRequestAddKtbsRoot.bind(this));
		this._mainContentDiv.addEventListener("request-delete-ktbs-resource", this.onRequestDeleteKtbsResource.bind(this));
		this._mainContentDiv.addEventListener("request-create-ktbs-resource", this._onRequestCreateKtbsResource.bind(this));
		this._mainContentDiv.addEventListener("request-create-method-from-stylesheet", this._onRequestCreateMethodFromStylesheet.bind(this));
		this._mainContentDiv.addEventListener("fold-header", this._onFoldMainHeader.bind(this));
		this._mainContentDiv.addEventListener("unfold-header", this._onUnfoldMainHeader.bind(this));

		this._overlayDiv = this.shadowRoot.querySelector("#overlay");

		this.addEventListener("error", this.onErrorEvent.bind(this));

		this.loadStoredRoots();

		this.loadMainObjectFromWindowLocation();
		window.addEventListener("popstate", this.onWindowPopState.bind(this));

		this._langButtons = this.shadowRoot.querySelectorAll("#lang-selector .lang-button");

		for(let i = 0; i < this._langButtons.length; i++) {
			let aLangButton = this._langButtons[i];
			aLangButton.addEventListener("click", this._onClickLangButton.bind(this));
		}

		try {
			const navWidth_string = window.sessionStorage.getItem("nav-width");
			let navWidth;

			if(navWidth_string != null)
				navWidth = parseFloat(navWidth_string);
				
			const nav_hidden = (window.sessionStorage.getItem("nav-hidden") == "true");

			if(nav_hidden) {
				this.leftPanel.classList.add("folded");				
				this.leftPanel.style.width = "20px";
				this.foldButton.title = this._translateString("Show navigation panel");
				this._nav_initial_scroll = this._navContentDiv.scrollTop;

				if((navWidth != undefined) && !isNaN(navWidth))
					this._resizing_initial_width = navWidth;
				else
					this._resizing_initial_width = this.leftPanel.offsetWidth;

				window.addEventListener("mousemove", this._bindedOnMouseMoveFunction, true);

				this._maskLeftPanelTaskID = setTimeout(() => {
					if(!this.leftPanel.classList.contains("masked"))
						this.leftPanel.classList.add("masked");

					delete this._maskLeftPanelTaskID;
				}, 1000);
			}
			else {
				if((navWidth != undefined) && !isNaN(navWidth))
					this.leftPanel.style.width = navWidth + "px";
			}
		}
		catch(error) {
			this.emitErrorEvent(error);

			if(this.debug)
				console.error(error);
		}
	}

	/**
	 * 
	 */
	_onScrollNavContentDiv(event) {
		if(!this._ignoreNextScrollEvents) {
			if(this._navContentDiv.scrollTop != this._lastNavScroll) {
				this._userScrolled = true;
				this._lastNavScroll = this._navContentDiv.scrollTop;

				if(this._processNavContentScrollID)
					clearTimeout(this._processNavContentScrollID);

				this._processNavContentScrollID = setTimeout(() => {
					window.sessionStorage.setItem("nav-scroll", this._navContentDiv.scrollTop);
					delete this._processNavContentScrollID;
				});
			}
		}
		else {
			this._lastNavScroll = this._navContentDiv.scrollTop;
			this._ignoreNextScrollEvents = false
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
	_onFoldMainHeader(event) {
		this.mainHeaderFolded = true;
	}

	/**
	 * 
	 */
	_onUnfoldMainHeader(event) {
		this.mainHeaderFolded = false;
	}

	/**
	 * 
	 */
	_onClickLangButton(event) {
		let langButton = event.target;

		if(langButton.getAttribute("lang")) {
			let newLang = langButton.getAttribute("lang");
			this.setAttribute("lang", newLang);
		}
	}

	/**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if(name == "lang")
			window.localStorage.setItem("lang", newValue);

		super.attributeChangedCallback(name, oldValue, newValue);
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

		this._componentReady.then(() => {
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
		});
	}

	_updateStringsTranslation() {
		if(this.leftPanel.classList.contains("folded"))
			this.foldButton.setAttribute("title", this._translateString("Show navigation panel"));
		else
			this.foldButton.setAttribute("title", this._translateString("Hide navigation panel"));

		this.homeLink.setAttribute("title", this._translateString("Home"));
		this.myKtbsRootSubtitle.innerText = this._translateString("My kTBS roots");

		const rootNavItems = this._rootList.querySelectorAll(":scope > ktbs4la2-nav-resource");

		for(let i = 0; i < rootNavItems.length; i++)
			rootNavItems[i].setAttribute("lang", this._lang);

		//this.myDashBoardsSubtitle.innerText = this._translateString("My dashboards");
		this.separatorDiv.setAttribute("title", this._translateString("Resize navigation panel"));

		const mainElement = this.shadowRoot.querySelector("#main-content > *");

		if(mainElement)
			mainElement.setAttribute("lang", this._lang);

		if(this.currentOverlay)
			this.currentOverlay.setAttribute("lang", this._lang);
	}

	/**
	 * 
	 */
	onNavNodesMutation(mutationRecord, observer) {
		let mainElement = this.shadowRoot.querySelector("#main-content > *");

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
	onRequestDeleteKtbsResource(event) {
		const target = event.target;
		const resourceTypeString = target.getAttribute("resource-type");
		const uri = target.getAttribute("uri");
		let label = target.getAttribute("label");


		if(resourceTypeString == "Ktbs") {
			if(!label)
				label = uri;

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
					
					const oldRootElement = this.shadowRoot.querySelector("#root-list ktbs4la2-nav-resource[resource-type = Ktbs][uri = " + CSS.escape(uri) + "]");
					
					if(oldRootElement)
						oldRootElement.remove();

					this.setMainObject("home");

					setTimeout(() => {
						const navUnfoldedResources_string = window.sessionStorage.getItem("nav-unfolded-resources");

						if(navUnfoldedResources_string != null) {
							const navUnfoldedResources = JSON.parse(navUnfoldedResources_string);

							if(navUnfoldedResources instanceof Array) {
								for(let i = navUnfoldedResources.length - 1; i >= 0; i--) {
									const unfolded_resource_uri = navUnfoldedResources[i];

									if(unfolded_resource_uri.startsWith(uri))
										navUnfoldedResources.splice(i, 1);
								}

								window.sessionStorage.setItem("nav-unfolded-resources", JSON.stringify(navUnfoldedResources));
							}
						}
					});
				}
				else
					this.emitErrorEvent(new Error("Could not find Ktbs Root with uri " + oldRootUri + " in local cache"));
			}
		}
		else {
			if(!label)
				label = Resource.extract_relative_id(uri);

			if(confirm(this._translateString("You are about to delete resource ") + "\"" + label + "\" "+ this._translateString("(uri : ") + uri + this._translateString(") and all it's children resources PERMANENTLY.\nData will be erased from remote server and there will be no undo possibility.\nAre you sure ?"))) {
				const resourceToDelete = ResourceMultiton.get_resource(this._get_resource_class(resourceTypeString), uri);

				resourceToDelete.get()
					.then(() => {
						this._delete_resource_recursive(resourceToDelete)
							.catch((error) => {
								alert(error.name + " : " + error.statusText);
							});
					})
					.catch((error) => {
						alert(error.name + " : " + error.statusText);
					});

					setTimeout(() => {
						const navUnfoldedResources_string = window.sessionStorage.getItem("nav-unfolded-resources");

						if(navUnfoldedResources_string != null) {
							const navUnfoldedResources = JSON.parse(navUnfoldedResources_string);

							if(navUnfoldedResources instanceof Array) {
								for(let i = navUnfoldedResources.length - 1; i >= 0; i--) {
									const unfolded_resource_uri = navUnfoldedResources[i];

									if(unfolded_resource_uri.startsWith(uri))
										navUnfoldedResources.splice(i, 1);
								}

								window.sessionStorage.setItem("nav-unfolded-resources", JSON.stringify(navUnfoldedResources));
							}
						}
					});
			}
		}
	}

	/**
	 * Recursively deletes a resource, starting by all of it's children resource, then the resource itself
	 * \param Resource parent_resource
	 * \return Promise
	 */
	_delete_resource_recursive(resource) {
		let resolveReturnPromise, rejectReturnPromise;

		const returnPromise = new Promise((resolve, reject) => {
			resolveReturnPromise = resolve;
			rejectReturnPromise = reject;
		});

		let childrenDeletePromises = new Array();

		if((resource instanceof Ktbs) || (resource instanceof Base)) {
			let childrenResources = resource.children;

			for(let i = 0; i < childrenResources.length; i++) {
				const aChild = childrenResources[i];
				childrenDeletePromises.push(this._delete_resource_recursive(aChild));
			}
		}

		Promise.all(childrenDeletePromises)
			.then(() => {
				resource.delete()
					.then(() => {
						resolveReturnPromise();
					})
					.catch((error) => {
						rejectReturnPromise(error);
					});
			})
			.catch((error) => {
				rejectReturnPromise(error);
			});
		
		return returnPromise;
	}

	/**
	 * 
	 */
	_onRequestCreateMethodFromStylesheet(event) {
		const stylesheet_id = event.detail["stylesheet-id"];
		const stylesheet_rules_data = event.detail["stylesheet-rules-data"];
		const source_trace_uri = event.detail["source-trace-uri"];
		
		if(stylesheet_id && stylesheet_rules_data && source_trace_uri) {
			let formElement = document.createElement("ktbs4la2-store-stylesheet-rules-to-method-form");
			formElement.setAttribute("stylesheet-id", stylesheet_id);
			formElement.setAttribute("stylesheet-rules-data", JSON.stringify(stylesheet_rules_data));
			formElement.setAttribute("source-trace-uri", source_trace_uri);
			formElement.addEventListener("submit", this._onSubmitFormCreateMethodFromStylesheet.bind(this));
			formElement.addEventListener("cancel", this.removeOverlay.bind(this));
			this.setOverlay(formElement);
		}
	}

	/**
	 * 
	 */
	_onSubmitFormCreateMethodFromStylesheet(event) {
		const formData = event.detail;
		const sourceTrace = ResourceMultiton.get_resource(Trace, formData["source-trace-uri"]);

		sourceTrace.get(this._abortController.signal)
			.then(() => {
				const sourceTraceModel = sourceTrace.model;
			
				sourceTraceModel.get(this._abortController.signal)
					.then(() => {
						// create a new method and model
						if(formData["method-instance"] == "new") {
							const newModel = new Model();
							newModel.id = formData["model-id"];
							const newModelLabelData = JSON.parse(formData["model-label"]);

							for(let i = 0; i < newModelLabelData.length; i++) {
								const aLabelData = newModelLabelData[i];

								if(aLabelData.lang == "*")
									newModel.label = aLabelData.value;
								else
									newModel.set_translated_label(aLabelData.value, aLabelData.lang);
							}

							// build the new model content ---
							const newModelAttributesTypes = new Array();

							for(let i = 0; i < sourceTraceModel.attribute_types.length; i++)
								newModelAttributesTypes.push(sourceTraceModel.attribute_types[i].clone());

							const newModelObselTypes = new Array();

							for(let i = 0; i < formData["stylesheet-rules-data"].length; i++) {
								const aRuleData = formData["stylesheet-rules-data"][i];

								if((aRuleData.visible == undefined) || (aRuleData.visible != false)) {
									const aNewObselType = new ObselType(newModel);
									aNewObselType.id = aRuleData.id;
									aNewObselType.attribute_types = newModelAttributesTypes;

									if(aRuleData.symbol && aRuleData.symbol.color)
										aNewObselType.suggestedColor = aRuleData.symbol.color;

									if(aRuleData.symbol && aRuleData.symbol.symbol)
										aNewObselType.suggestedSymbol = aRuleData.symbol.symbol;

									newModelObselTypes.push(aNewObselType);
								}
							}

							newModel.obsel_types = newModelObselTypes;
							// --- done

							const newModelParent = (formData["model-parent"] == "default")?sourceTrace.parent:ResourceMultiton.get_resource(Base, formData["model-parent-uri"]);
							
							newModelParent.post(newModel)
								.then(() => {
									const newMethod = new Method();
									newMethod.id = formData["method-id"];
									const newMethodLabelData = JSON.parse(formData["method-label"]);

									for(let i = 0; i < newMethodLabelData.length; i++) {
										const aLabelData = newMethodLabelData[i];

										if(aLabelData.lang == "*")
											newMethod.label = aLabelData.value;
										else
											newMethod.set_translated_label(aLabelData.value, aLabelData.lang);
									}

									newMethod.parent_method = Method.getBuiltinMethod("hrules");

									// build the method parameters ---
									const newMethodParameters = new Array();
									newMethodParameters["model"] = newModel.uri;
									newMethodParameters["rules"] = formData["stylesheet-rules-data"];
									newMethod.parameters = newMethodParameters;
									// --- done

									const newMethodParent = (formData["method-parent"] == "default")?sourceTrace.parent:ResourceMultiton.get_resource(Base, formData["method-parent-uri"]);

									newMethodParent.post(newMethod)
										.then(() => {
											if(formData["create-computed-trace"] == true) {
												const newComputedTrace = new ComputedTrace();
												newComputedTrace.id = formData["computed-trace-id"];
												const newComputedTraceLabelData = JSON.parse(formData["computed-trace-label"]);

												for(let i = 0; i < newComputedTraceLabelData.length; i++) {
													const aLabelData = newComputedTraceLabelData[i];
			
													if(aLabelData.lang == "*")
														newComputedTrace.label = aLabelData.value;
													else
														newComputedTrace.set_translated_label(aLabelData.value, aLabelData.lang);
												}

												newComputedTrace.source_traces = [sourceTrace];
												newComputedTrace.method = newMethod;
												const newComputedTraceParent = (formData["computed-trace-parent"] == "default")?sourceTrace.parent:ResourceMultiton.get_resource(Base, formData["computed-trace-parent-uri"]);

												newComputedTraceParent.post(newComputedTrace)
													.then(() => {
														this.removeOverlay();
													})
													.catch((error) => {
														this.emitErrorEvent(error);
														console.error(error);
														alert(error.name + " : " + error.message);
													});
											}	
											else
												this.removeOverlay();
										})
										.catch((error) => {
											this.emitErrorEvent(error);
											console.error(error);
											alert(error.name + " : " + error.message);
										});
								})
								.catch((error) => {
									this.emitErrorEvent(error);
									console.error(error);
									alert(error.name + " : " + error.message);
								});
						}
						// overwrite a method and its model
						else {
							const existingMethod = ResourceMultiton.get_resource(Method, formData["existing-method-uri"]);

							existingMethod.get(this._abortController.signal)
								.then(() => {
									existingMethod.get_methods_hierarchy(this._abortController.signal)
										.then((method_ancestor) => {
											if(method_ancestor == Method.getBuiltinMethod("hrules")) {
												const existingModel_uri = existingMethod.parameters["model"];
												
												if(existingModel_uri) {
													const existingModel = ResourceMultiton.get_resource(Model, existingModel_uri);

													existingModel.get(this._abortController.signal)
														.then(() => {
															// update the model
															const existingModelAttributesTypes = new Array();

															for(let i = 0; i < sourceTraceModel.attribute_types.length; i++)
																existingModelAttributesTypes.push(sourceTraceModel.attribute_types[i].clone());

															const existingModelObselTypes = new Array();

															for(let i = 0; i < formData["stylesheet-rules-data"].length; i++) {
																const aRuleData = formData["stylesheet-rules-data"][i];

																if((aRuleData.visible == undefined) || (aRuleData.visible != false)) {
																	const aNewObselType = new ObselType(existingModel);
																	aNewObselType.id = aRuleData.id;
																	aNewObselType.attribute_types = existingModelAttributesTypes;

																	if(aRuleData.symbol && aRuleData.symbol.color)
																		aNewObselType.suggestedColor = aRuleData.symbol.color;

																	if(aRuleData.symbol && aRuleData.symbol.symbol)
																		aNewObselType.suggestedSymbol = aRuleData.symbol.symbol;

																	existingModelObselTypes.push(aNewObselType);
																}
															}

															existingModel.obsel_types = existingModelObselTypes;

															existingModel.put(this._abortController.signal)
																.then(() => {
																	// update the method
																	existingMethod.parent_method = Method.getBuiltinMethod("hrules");

																	// build the method parameters ---
																	const existingMethodParameters = new Array();
																	existingMethodParameters["model"] = existingModel.uri;
																	existingMethodParameters["rules"] = formData["stylesheet-rules-data"];
																	existingMethod.parameters = existingMethodParameters;

																	existingMethod.put(this._abortController.signal)
																		.then(() => {
																			if(formData["create-computed-trace"] == true) {
																				const newComputedTrace = new ComputedTrace();
																				newComputedTrace.id = formData["computed-trace-id"];
																				const newComputedTraceLabelData = JSON.parse(formData["computed-trace-label"]);

																				for(let i = 0; i < newComputedTraceLabelData.length; i++) {
																					const aLabelData = newComputedTraceLabelData[i];
											
																					if(aLabelData.lang == "*")
																						newComputedTrace.label = aLabelData.value;
																					else
																						newComputedTrace.set_translated_label(aLabelData.value, aLabelData.lang);
																				}

																				newComputedTrace.source_traces = [sourceTrace];
																				newComputedTrace.method = existingMethod;
																				const newComputedTraceParent = (formData["computed-trace-parent"] == "default")?sourceTrace.parent:ResourceMultiton.get_resource(Base, formData["computed-trace-parent-uri"]);

																				newComputedTraceParent.post(newComputedTrace)
																					.then(() => {
																						this.removeOverlay();
																					})
																					.catch((error) => {
																						this.emitErrorEvent(error);
																						console.error(error);
																						alert(error.name + " : " + error.message);
																					});
																			}	
																			else
																				this.removeOverlay();
																		})
																		.catch((error) => {
																			this.emitErrorEvent(error);
																			console.error(error);
																			alert(error.name + " : " + error.message);
																		});
																})
																.catch((error) => {
																	this.emitErrorEvent(error);
																	console.error(error);
																	alert(error.name + " : " + error.message);
																});
														})
														.catch((error) => {
															this.emitErrorEvent(error);
															console.error(error);
															alert(error.name + " : " + error.message);
														});
												}
												else {
													const error = new KtbsError("Custom Method to overwrite does not have an associated Model");
													this.emitErrorEvent(error);
													console.error(error);
													alert(error.name + " : " + error.message);
												}
											}
											else {
												const error = new KtbsError("Custom Method to overwrite is not a descendant of hrules");
												this.emitErrorEvent(error);
												console.error(error);
												alert(error.name + " : " + error.message);
											}
										})
										.catch((error) => {
											this.emitErrorEvent(error);
											console.error(error);
											alert(error.name + " : " + error.message);
										});
								})
								.catch((error) => {
									this.emitErrorEvent(error);
									console.error(error);
									alert(error.name + " : " + error.message);
								});
						}
					})
					.catch((error) => {
						this.emitErrorEvent(error);
						console.error(error);
						alert(error.name + " : " + error.message);
					});
			})
			.catch((error) => {
				this.emitErrorEvent(error);
				console.error(error);
				alert(error.name + " : " + error.message);
			});
	}

	/**
	 * 
	 */
	_onRequestCreateKtbsResource(event) {
		const parentType = event.detail["parent-type"];
		const parentUri = event.detail["parent-uri"];

		if(parentType && parentUri) {
			const createType = event.detail["create-type"];

			if(createType == "StoredTrace") {

				// TODO : demander si import CSV ou créer vide


				const csvImportElement = document.createElement("ktbs4la2-csv-trace-import");
				csvImportElement.setAttribute("parent-uri", parentUri);
				csvImportElement.addEventListener("close", this.removeOverlay.bind(this));
				this.setOverlay(csvImportElement);
			}
			else {
				let formElement = document.createElement("ktbs4la2-create-resource-form");
				formElement.setAttribute("parent-type", parentType);
				formElement.setAttribute("parent-uri", parentUri);
				formElement.setAttribute("create-type", createType);
				formElement.addEventListener("submit", this._onSubmitFormCreateResource.bind(this));
				formElement.addEventListener("cancel", this.removeOverlay.bind(this));
				this.setOverlay(formElement);
			}
		}
	}

	/**
	 * 
	 */
	_onSubmitFormCreateResource(event) {
		const formData = event.detail;
		const createType = formData["create-type"];
		let newResource;

		try {
			switch(createType) {
				case "Base": 
					newResource = new Base();
					break;
				case "StoredTrace": 
					newResource = new StoredTrace();
					newResource.model = ResourceMultiton.get_resource(Model, formData["trace-model"]);

					if(formData["origin"])
						newResource.origin = formData["origin"];

					break;
				case "ComputedTrace": 
					newResource = new ComputedTrace();

					if(formData["origin"])
						newResource.origin = formData["origin"];

					let method;

					if(Method.builtin_methods_ids.includes(formData["method"]))
						method = Method.getBuiltinMethod(formData["method"]);
					else
						method = ResourceMultiton.get_resource(Method, formData["method"]);

					newResource.method = method;

					if((formData["source-trace"] instanceof Array) && (formData["source-trace"].length > 0)){
						let source_traces = new Array();

						for(let i = 0; i < formData["source-trace"].length; i++) {
							const aSourceTraceUri = formData["source-trace"][i];
							const aSourceTrace = ResourceMultiton.get_resource(Trace, aSourceTraceUri);
							source_traces.push(aSourceTrace);
						}

						newResource.source_traces = source_traces;
					}
					else if(formData["source-trace"]) {
						const aSourceTrace = ResourceMultiton.get_resource(Trace, formData["source-trace"]);
						newResource.source_traces.push(aSourceTrace);
					}

					if(formData["parameters"])
						newResource.parameters = formData["parameters"];

					break;
				case "Model": 
					newResource = new Model();
					break;
				case "Method": 
					newResource = new Method();
					let parentMethod;

					if(Method.builtin_methods_ids.includes(formData["parent-method"]))
						parentMethod = Method.getBuiltinMethod(formData["parent-method"]);
					else
						parentMethod = ResourceMultiton.get_resource(Method, formData["parent-method"]);

					newResource.parent_method = parentMethod;

					if(formData["parameters"])
						newResource.parameters = formData["parameters"];

					break;
			}

			if(newResource) {
				newResource.id = formData["new-resource-id"];

				if(formData["label"]) {
					if(formData["label"] instanceof Array) {
						for(let i = 0; i < formData["label"].length; i++) {
							const value = formData["label"][i].value;
							const lang = formData["label"][i].lang;

							if(value && (lang != "*"))
								newResource.set_translated_label(value, lang);
							else if(value)
								newResource.label = value;
						}
					}
					else
						newResource.label = formData["label"];
				}

				const parentType = formData["parent-type"];
				const parentUri = formData["parent-uri"];
				const parentResource = ResourceMultiton.get_resource(parentType, parentUri);

				parentResource.post(newResource)
					.then(() => {
						this.removeOverlay();
					})
					.catch((error) => {
						alert(error.name + " : " + error.message);
					});
			}
			else
				alert("An unexpected error has occured, resource creation failed");
		}
		catch(error) {
			this.emitErrorEvent(error);
			console.error(error);
			alert(error.name + " : " + error.message);
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
			else if(queryParameters["doc"]) {
				main_type = "documentation";
				main_id = queryParameters["doc"];
			}
			
			this.setMainObject(main_type, main_id, ktbs_type, ktbs_label, true);
		}
		else
			this.setMainObject("home", null, null, null, true);
	}

	/**	
	 * 
	 */
	onWindowPopState(event) {
		let main_type = event.state.main_type;
		let main_id, ktbs_type, ktbs_label = null;

		switch(main_type) {
			case "home":
				break;
			case "documentation":
				main_id = event.state.page;
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
	setMainObject(main_type = "home", main_id = null, ktbs_type = null, ktbs_label = null, skipHistoryPush = false) {
		// remove previous main content
		let mainElements = this.shadowRoot.querySelectorAll("#main-content > *");
		let previousMainElementPreventsRemoval = false;

		for(let i = 0; !previousMainElementPreventsRemoval && (i < mainElements.length); i++) {
			const beforeRemoveEvent = new Event("beforeremove", {bubbles: true, cancelable: true});
			mainElements[i].dispatchEvent(beforeRemoveEvent);
			previousMainElementPreventsRemoval = beforeRemoveEvent.defaultPrevented;

			if(!previousMainElementPreventsRemoval)
				mainElements[i].remove();
		}

		if(!previousMainElementPreventsRemoval) {
			// de-select currently selected navigation panel element
			if((this._selectedNavElement != null) && this._selectedNavElement.classList.contains("selected"))
				this._selectedNavElement.classList.remove("selected");

			let previousSelectedParents = this.shadowRoot.querySelectorAll("#lists .parent-of-selected");

			for(let i = 0; i < previousSelectedParents.length; i++)
				previousSelectedParents[i].classList.remove("parent-of-selected");

			this._selectedNavElement = null;

			// prepare new main element
			let mainContentChildrenTag;		

			// prepare history entry
			let historyState, historyURL;

			let historyLabel = "KTBS4LA2 - ";

			switch(main_type) {
				case "home":
					historyState = {main_type: "home"};
					mainContentChildrenTag = document.createElement("ktbs4la2-main-home");
					historyLabel += this._translateString("Home");
					historyURL = window.location.pathname;
					break;
				case "documentation":
					let doc_path = "/";
					historyURL = window.location.pathname;

					doc_path += main_id;
					historyURL += "#doc=" + encodeURIComponent(main_id);
					historyLabel += this._translateString("Documentation");

					historyState = {main_type: "documentation", page: main_id};
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

					if(ktbs_label)
						historyLabel += ktbs_label;
					else
						historyLabel += main_id;

					historyLabel += " (" + ktbs_type + ")";

					// select the corresponding element in navigation panel
					let queryString = "#root-list [uri = \"" + CSS.escape(main_id) + "\"]";
					let newSelectedNavElement = this.shadowRoot.querySelector(queryString);

					if(newSelectedNavElement) {
						newSelectedNavElement.classList.add("selected");
						this._selectedNavElement = newSelectedNavElement;
					}

					this._highlightSelectedNavElementParents(main_id);

					// instantiate the new main element
					mainContentChildrenTag = document.createElement("ktbs4la2-main-resource");

					if(main_id != null)
						mainContentChildrenTag.setAttribute("uri", main_id);

					if(ktbs_type != null)
						mainContentChildrenTag.setAttribute("resource-type", ktbs_type);

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
			mainContentChildrenTag.setAttribute("lang", this._lang);
			this._mainContentDiv.appendChild(mainContentChildrenTag);

			// reset main area scrollbar
			this.shadowRoot.querySelector("#main-scrollable").scrollTop = 0;

			// push new entry to navigation history
			if(!skipHistoryPush)
				history.pushState(historyState, historyLabel, historyURL);
			else
				history.replaceState(historyState, historyLabel, historyURL);

			window.document.title = historyLabel;
		}
	}

	/**
	 * 
	 */
	_highlightSelectedNavElementParents(selected_element_uri) {
		const previousHighlightedParents = this.shadowRoot.querySelectorAll("#lists .parent-of-selected");
		const selectedNavParents = [];
		const uri_parts = selected_element_uri.split("/");

		for(let i = uri_parts.length - 1; i > 2; i--) {
			const parent_uri_parts = uri_parts.slice(0, i);
			const parent_uri = parent_uri_parts.join("/") + "/";

			if(parent_uri != selected_element_uri) {
				const parents_query_string = "#root-list [uri=\"" + CSS.escape(parent_uri) + "\"]";
				const parents = this.shadowRoot.querySelectorAll(parents_query_string);
				
				for(let j = 0; j < parents.length; j++) {
					if(!parents[j].classList.contains("parent-of-selected"))
						parents[j].classList.add("parent-of-selected");

					if(!selectedNavParents.includes(parents[j]))
						selectedNavParents.push(parents[j]);
				}
			}
		}

		for(let i = 0; i < previousHighlightedParents.length; i++)
			if(!selectedNavParents.includes(previousHighlightedParents[i]))
				previousHighlightedParents[i].classList.remove("parent-of-selected");
	}

	/**
	 * 
	 */
	_resourceUriIsParentOfSelected(uri) {
		let mainElement = this.shadowRoot.querySelector("#main-content > *");

		if(mainElement && mainElement.hasAttribute("uri"))
			return (mainElement.getAttribute("uri").startsWith(uri.toString()));
		else
			return false;
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
		let mainElement = this.shadowRoot.querySelector("#main-content > *");

		if(!mainElement || (mainElement.localName != "ktbs4la2-main-home"))
			this.setMainObject("home");
		/*else {
			mainElements[0].setAttribute("page", "");
			let historyState = {main_type: "documentation", doc_path: ""}
			let newTitle = "KTBS4LA2 - " + this._translateString("Home");
			history.pushState(historyState, newTitle, window.location.pathname);
			window.document.title = newTitle;

			// reset main area scrollbar
			this.shadowRoot.querySelector("#main-scrollable").scrollTop = 0;
		}*/
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
	_onRequestNavigateToKtbsResource(event) {
		if(event.detail)
			this.setMainObject("ktbs-resource", event.detail.uri, event.detail.resource_type, event.detail.label);
	}

	/**
	 * 
	 */
	_onRequestDocumentationPage(event) {
		if(event.detail && event.detail.page)
			this.setMainObject("documentation", event.detail.page);
	}

	/**
	 * 
	 */
	toggleLeftPanelHidden(event) {
		if(!this.leftPanel.classList.contains("folded")) {
			this._resizing_initial_width = this.leftPanel.offsetWidth;
			this._nav_initial_scroll = this._navContentDiv.scrollTop;
			this.leftPanel.classList.add("folded");
			
			if(this.leftPanel.classList.contains("masked"))
				this.leftPanel.classList.remove("masked");

			this.leftPanel.style.width = "20px";
			this.foldButton.title = this._translateString("Show navigation panel");
			window.addEventListener("mousemove", this._bindedOnMouseMoveFunction, true);

			this._maskLeftPanelTaskID = setTimeout(() => {
				if(!this.leftPanel.classList.contains("masked"))
					this.leftPanel.classList.add("masked");

				delete this._maskLeftPanelTaskID;
			}, 1000);
		}
		else {
			this.foldButton.title = this._translateString("Hide navigation panel");
			this.leftPanel.classList.remove("folded");

			if(this.leftPanel.classList.contains("masked"))
				this.leftPanel.classList.remove("masked");

			if(this._resizing_initial_width > 0) {
				this.leftPanel.style.width = this._resizing_initial_width + "px";
				this._ignoreNextScrollEvents = true;
				this._navContentDiv.scrollTop = this._nav_initial_scroll;
			}
			else
				this.leftPanel.style.width = "250px";

			if(this._maskLeftPanelTaskID) {
				clearTimeout(this._maskLeftPanelTaskID);
				delete this._maskLeftPanelTaskID;
			}

			window.removeEventListener("mousemove", this._bindedOnMouseMoveFunction, true);
		}

		if(this._saveNavStateTaskID)
				clearTimeout(this._saveNavStateTaskID);

			this._saveNavStateTaskID = setTimeout(() => {
				try {
					window.sessionStorage.setItem("nav-hidden", !(this.leftPanel.className == "unfolded"));
				}
				catch(error) {
					this.emitErrorEvent(error);

					if(this.debug)
						console.error(error);
				}
				finally {
					delete this._saveNavStateTaskID;
				}
			});
	}

	/**
	 *
	 */
	_onMouseMove(event) {
		if(event.clientX < 20) {
			if(this.leftPanel.classList.contains("masked"))
				this.leftPanel.classList.remove("masked");

			if(this._maskLeftPanelTaskID)
				clearTimeout(this._maskLeftPanelTaskID);

			this._maskLeftPanelTaskID = setTimeout(() => {
				if(!this.leftPanel.classList.contains("masked"))
					this.leftPanel.classList.add("masked");

				delete this._maskLeftPanelTaskID;
			}, 1000);
		}
	}

	/**
	 * 
	 */
	startResizing(event) {
		this._is_resizing = true;
		this._resizing_origin_x = event.clientX;
		this._resizing_initial_width = this.leftPanel.offsetWidth;
		this._nav_initial_scroll = this._navContentDiv.scrollTop;
		window.addEventListener("mousemove", this._bindedResizeFunction, true);
		window.addEventListener("mouseup", this._bindedStopresizingFunction, true);
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

			if(this._saveNavWidthTaskID)
				clearTimeout(this._saveNavWidthTaskID);

			this._saveNavWidthTaskID = setTimeout(() => {
				try {
					window.sessionStorage.setItem("nav-width", newNavWidth);
				}
				catch(error) {
					this.emitErrorEvent(error);

					if(this.debug)
						console.error(error);
				}
				finally {
					delete this._saveNavWidthTaskID;
				}
			});

			event.preventDefault();
		}
	}

	/**
	 * 
	 */
	stopResizing(event) {
		window.removeEventListener("mousemove", this._bindedResizeFunction, true);
		window.removeEventListener("mouseup", this._bindedStopresizingFunction, true);
		this._is_resizing = false;
		event.preventDefault();
	}

	/**
	 * 
	 */
	_onRequestAddKtbsRoot(event) {
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

		try {
			this.storeNewRoot(newRootUri, newRootLabel);
			this.addRootItem(newRootUri, newRootLabel, true);
			this.removeOverlay();

			let mainElement = this.shadowRoot.querySelector("#main-content > *");

			if(mainElement && mainElement.localName == "ktbs4la2-main-home") {
				mainElement.dispatchEvent(new CustomEvent("added-ktbs-root", {
					bubbles: false, 
					composed: false, 
					cancelable: false, 
					detail: {
						uri: newRootUri,
						label: newRootLabel
					}
				}));
			}
		}
		catch(error) {
			alert(error.name + " " + error.message);
		}
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
			let rootElements = this.shadowRoot.querySelectorAll("#root-list [resource-type = \"Ktbs\"][uri = \"" + oldRootUri + "\"]");
			
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
	addRootItem(newRootUri, newRootLabel, mark_as_new = false) {
		if(newRootUri) {
			let newRootElement = document.createElement("ktbs4la2-nav-resource");
			newRootElement.setAttribute("uri", newRootUri);
			newRootElement.setAttribute("label", newRootLabel);
			newRootElement.setAttribute("resource-type", "Ktbs");
			newRootElement.setAttribute("lang", this._lang);
			newRootElement.addEventListener("nav-fold", this._onFoldNavItem.bind(this));
			newRootElement.addEventListener("nav-unfold", this._onUnfoldNavItem.bind(this));

			const navUnfoldedResources_string = window.sessionStorage.getItem("nav-unfolded-resources");

			if(navUnfoldedResources_string != null) {
				const navUnfoldedResources = JSON.parse(navUnfoldedResources_string);

				if((navUnfoldedResources instanceof Array) && navUnfoldedResources.includes(newRootUri))
					newRootElement.setAttribute("expand", "true");
			}

			this._rootElementsMutationObserver.observe(newRootElement, {childList: true, subtree: true, attributes: false});

			if(mark_as_new)
				newRootElement.classList.add("new");

			this._rootList.appendChild(newRootElement);
			
			if(mark_as_new)
				setTimeout(() => {
					if(newRootElement.classList.contains("new"))
						newRootElement.classList.remove("new");
				}, 4000);
		}
		else
			throw new Error("Cannot instanciate root item with empty URI");
	}

	/**
	 * 
	 */
	_onRootElementsMutation(mutationRecords, observer) {
		setTimeout(() => {
			let added_new_nav_element = false;

			for(let i = 0; i < mutationRecords.length; i++) {
				const currentMutationRecord = mutationRecords[i];

				if(currentMutationRecord.type == "childList") {
					let navUnfoldedResources;
					const navUnfoldedResources_string = window.sessionStorage.getItem("nav-unfolded-resources");

					if(navUnfoldedResources_string != null)
						navUnfoldedResources = JSON.parse(navUnfoldedResources_string);

					for(let j = 0; j < currentMutationRecord.addedNodes.length; j++) {
						let newChildNode = currentMutationRecord.addedNodes[j];
						
						if(newChildNode.localName == "ktbs4la2-nav-resource") {
							const newNavElement_uri = newChildNode.getAttribute("uri");

							if((navUnfoldedResources instanceof Array) && navUnfoldedResources.includes(newNavElement_uri))
								newChildNode.setAttribute("expand", "true");

							
							added_new_nav_element = true;
						}
					}
				}
			}

			if(added_new_nav_element && !this._userScrolled) {
				const navScroll = window.sessionStorage.getItem("nav-scroll");
				const scrollTopBefore = this._navContentDiv.scrollTop;
				
				if(navScroll != scrollTopBefore) {
					this._navContentDiv.scrollTop = navScroll;
					
					if(this._navContentDiv.scrollTop != scrollTopBefore)
						this._ignoreNextScrollEvents = true;
				}
			}
		});
	}

	/**
	 * 
	 */
	_onFoldNavItem(event) {
		const navItem = event.target;
		const navItem_uri = navItem.getAttribute("uri");

		try {
			const navUnfoldedResources_string = window.sessionStorage.getItem("nav-unfolded-resources");
			let navUnfoldedResources;

			if(navUnfoldedResources_string != null)
				navUnfoldedResources = JSON.parse(navUnfoldedResources_string);
			else
				navUnfoldedResources = new Array();

			if(navUnfoldedResources instanceof Array) {
				const navItem_uri_index = navUnfoldedResources.indexOf(navItem_uri);

				if(navItem_uri_index != -1)
					navUnfoldedResources.splice(navItem_uri_index, 1);

				window.sessionStorage.setItem("nav-unfolded-resources", JSON.stringify(navUnfoldedResources));
			}
			else
				throw new Error("Session storage item \"nav-unfolded-resources\" exists but does not contain a valid JSON representation of an Array");
		}
		catch(error) {
			if(this.debug)
				console.error(error);
		}
	}

	/**
	 * 
	 */
	 _onUnfoldNavItem(event) {
		const navItem = event.target;
		const navItem_uri = navItem.getAttribute("uri");

		try {
			const navUnfoldedResources_string = window.sessionStorage.getItem("nav-unfolded-resources");
			let navUnfoldedResources;

			if(navUnfoldedResources_string != null)
				navUnfoldedResources = JSON.parse(navUnfoldedResources_string);
			else
				navUnfoldedResources = new Array();

			if(navUnfoldedResources instanceof Array) {
				const navItem_uri_index = navUnfoldedResources.indexOf(navItem_uri);

				if(navItem_uri_index == -1)
					navUnfoldedResources.push(navItem_uri);

				window.sessionStorage.setItem("nav-unfolded-resources", JSON.stringify(navUnfoldedResources));
			}
			else
				throw new Error("Session storage item \"nav-unfolded-resources\" exists but does not contain a valid JSON representation of an Array");
		}
		catch(error) {
			if(this.debug)
				console.error(error);
		}
	}

	/**
	 * 
	 */
	setOverlay(childContentElement) {
		if(this.currentOverlay != null)
			this.currentOverlay.remove();

		this.currentOverlay = document.createElement("ktbs4la2-overlay");
		this.currentOverlay.setAttribute("lang", this._lang);
		this.currentOverlay.appendChild(childContentElement);
		this.currentOverlay.addEventListener("closerequest", this.removeOverlay.bind(this));

		this._overlayDiv.appendChild(this.currentOverlay);
		this._overlayDiv.style.display = "block";
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
	/*onClickAddDashboardButton(event) {
		console.log("KTBS4LA2Ui::onClickAddDashboardButton()");
	}*/

	/**
	 * 
	 */
	storeNewRoot(newRootUri, newRootLabel) {
		if(newRootUri) {
			this.ktbsRoots.push({uri: newRootUri, label: newRootLabel});
			window.localStorage.setItem("ktbs-roots", JSON.stringify(this.ktbsRoots));
		}
		else
			throw new Error("Cannot store new root with empty URI");
	}

	/**
	 * 
	 */
	loadStoredRoots() {
		if(window.localStorage.getItem("ktbs-roots") != null) {
			try {
				this.ktbsRoots = JSON.parse(window.localStorage.getItem("ktbs-roots"));

				for(let i = 0; i < this.ktbsRoots.length; i++) {
					let aRootData = this.ktbsRoots[i];

					if(!ResourceMultiton.has_resource(aRootData.uri)) {
						const rootResource = ResourceMultiton.get_resource(Ktbs, aRootData.uri);

						if(!rootResource.label)
							rootResource.label = aRootData.label
					}

					this.addRootItem(aRootData.uri, aRootData.label);
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

	/**
	 * 
	 */
	 disconnectedCallback() {
		super.disconnectedCallback();
		this._rootElementsMutationObserver.disconnect();
	 }
}

customElements.define('ktbs4la2-application', KTBS4LA2Application);
