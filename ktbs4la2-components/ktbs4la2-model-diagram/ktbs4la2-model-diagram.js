import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Model} from "../../ktbs-api/Model.js";
import {AttributeType} from "../../ktbs-api/AttributeType.js";

import "./ktbs4la2-model-diagram-obseltype.js";
import "./ktbs4la2-model-diagram-arrow.js";
import "./ktbs4la2-model-diagram-obseltype-details.js";
import {ObselType} from "../../ktbs-api/ObselType.js";

/**
 * 
 */
class KTBS4LA2ModelDiagram extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
		this._onDocumentMouseMoveBindedMethod = this._onDocumentMouseMove.bind(this);
		this._onDocumentMouseUpBindedMethod = this._onDocumentMouseUp.bind(this);
		this._resolveTypeSet();
		this._is_valid = false;
	}

	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("mode");
		_observedAttributes.push("allow-fullscreen");
		return _observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

        if(name == "mode") {
			if((newValue == "view") || (newValue == "edit")) {
				this._componentReady.then(() => {
					if((newValue == "edit") && this._model)
						this._model_copy = this._model.clone();

					if((newValue == "view") && (oldValue == "edit"))
						this._obseltypeDetails.resetObselType();

					if((newValue == "edit") && (this.selected_obselType))
						this._obseltype_is_being_edited = true;

					this._obseltypeDetails.setAttribute("mode", newValue);
				});
			}
			else if(newValue == null) {
				this._componentReady.then(() => {
					if(oldValue == "edit")
						this._obseltypeDetails.resetObselType();

					if(this._obseltypeDetails.hasAttribute("mode"))
						this._obseltypeDetails.removeAttribute("mode");
				});
			}
			else
				this.emitErrorEvent(new RangeError("The only accepted values for attribute \"mode\" are : \"view\" or \"edit\""));
        }
		else if(name == "allow-fullscreen") {
			if(!this._allowFullScreen && (document.fullscreenElement === this))
				document.exitFullscreen();
		}
    }

	/**
	 * 
	 */
	get mode() {
		if(
				this.hasAttribute("mode") 
			&& 	(
					(this.getAttribute("mode") == "view")
				||	(this.getAttribute("mode") == "edit")
			)
		)
				return this.getAttribute("mode");
		else
			return "view";
	}

	/**
	 * 
	 */
	set mode(new_mode) {
		if((new_mode == "view") || (new_mode == "edit")) {
			this.setAttribute("mode", new_mode);
		}
		else if(new_mode == null) {
			if(this.hasAttribute("mode"))
				this.removeAttribute("mode");
		}
		else
			this.emitErrorEvent(new RangeError("The only accepted values for attribute \"mode\" are : \"view\" or \"edit\""));
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
		this._waitMessage = this.shadowRoot.querySelector("#wait-message");
		this._emptyMessage = this.shadowRoot.querySelector("#empty-message");
		this._errorMessage = this.shadowRoot.querySelector("#error-message");
		this._diagramArea = this.shadowRoot.querySelector("#diagram-area");
		this._defaultObseltypeElement = this.shadowRoot.querySelector("#default-obseltype");
		this._defaultObseltypeTitle = this.shadowRoot.querySelector("#default-obseltype-title");
		this._defaultObseltypeAttributetypesList = this.shadowRoot.querySelector("#default-obseltype-attributetypes-list");

		for(let i = 0; i < AttributeType.builtin_attribute_types.length; i++) {
			const aBuiltinAttribute = AttributeType.builtin_attribute_types[i];
			const aBuilitinAttributeElement = document.createElement("li");
			aBuilitinAttributeElement.innerText = aBuiltinAttribute.get_preferred_label(this._lang);
			this._defaultObseltypeAttributetypesList.appendChild(aBuilitinAttributeElement);
		}

		this._obseltypeDetailsPanel = this.shadowRoot.querySelector("#obseltype-details-panel");
		this._obseltypeDetails = this.shadowRoot.querySelector("#obseltype-details");
		this._obseltypeDetails.setAttribute("lang", this._lang);
		this._obseltypeDetails.addEventListener("change", this._onChangeObselTypeDetails.bind(this));
		this._obseltypeDetails.addEventListener("change-attribute-type", this._onChangeAttributeType.bind(this));
		this._closeObseltypeDetailsButton = this.shadowRoot.querySelector("#close-obseltype-details-button");
		this._closeObseltypeDetailsButton.addEventListener("click", this._onClickCloseObseltypeDetailsButton.bind(this));
		this._cancelObseltypeModificationsButton = this.shadowRoot.querySelector("#cancel-obseltype-modifications-button");
		this._cancelObseltypeModificationsButton.addEventListener("click", this._onClickCancelObseltypeModificationsButton.bind(this));
		this._duplicateObseltypeButton = this.shadowRoot.querySelector("#duplicate-obseltype-button");
		this._duplicateObseltypeButton.addEventListener("click", this._onClickDuplicateObseltypeButton.bind(this));
		this._deleteObseltypeButton = this.shadowRoot.querySelector("#delete-obseltype-button");
		this._deleteObseltypeButton.addEventListener("click", this._onClickDeleteObseltypeButton.bind(this));
		this._toggleFullscreenButton = this.shadowRoot.querySelector("#toggle-fullscreen-button");
		this._toggleFullscreenButton.addEventListener("click", this._onClickToggleFullscreenButton.bind(this));
		this._detailsButton = this.shadowRoot.querySelector("#details");
		this._detailsButton.addEventListener("click", this._onClickDetailsButton.bind(this));
		this._moveButton = this.shadowRoot.querySelector("#move");
		this._moveButton.addEventListener("click", this._onClickMoveButton.bind(this));
		this._autoArrangeButton = this.shadowRoot.querySelector("#auto-arrange");
		this._autoArrangeButton.addEventListener("click", this._onClickAutoArrangeButton.bind(this));
		this._createObseltypeButton = this.shadowRoot.querySelector("#create-obseltype");
		this._createObseltypeButton.addEventListener("click", this._onClickCreateObseltypeButton.bind(this));
		/*this._createInheritanceButton = this.shadowRoot.querySelector("#create-inheritance");
		this._createInheritanceButton.addEventListener("click", this._onClickCreateInheritanceButton.bind(this));*/
	}

	/**
	 * 
	 */
	_applyObselTypeChanges(changedObselType) {
		// update the model
		const model_obsel_types = this._model.obsel_types;

		for(let i = 0; i < model_obsel_types.length; i++)
			if(model_obsel_types[i].id == changedObselType.id) {
				model_obsel_types[i] = changedObselType;
			}

		this._model.obsel_types = model_obsel_types;

		// purge unused attribute types
		const model_attribute_types = this._model.attribute_types;

		for(let i = (model_attribute_types.length - 1); i >= 0; i--)
			if(model_attribute_types[i].obsel_types.length == 0)
				model_attribute_types.splice(i, 1);

		this._model.attribute_types = model_attribute_types;
		// ---

		const obselTypeBox = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(changedObselType.id));

		if(obselTypeBox) {
			const parentObselTypesIDs = new Array();

			for(let i = 0; i < changedObselType.super_obsel_types.length; i++)
				parentObselTypesIDs.push(changedObselType.super_obsel_types[i].id);

			obselTypeBox.obsel_type = changedObselType;
			const diagramArrows = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-arrow");

			for(let i = 0; i < diagramArrows.length; i++) {
				const aDiagramArrow = diagramArrows[i];

				if(aDiagramArrow.fromBox == obselTypeBox) {
					const toId = aDiagramArrow.toBox.id;

					if(
						(
								(toId != "default-obseltype")
							&&	(!parentObselTypesIDs.includes(toId))
						)
						||	(
								(toId == "default-obseltype")
							&&	(parentObselTypesIDs.length > 0)
						)
					)
						aDiagramArrow.remove();
				}
			}

			if(changedObselType.super_obsel_types.length > 0) {
				const newNodeContent = document.createDocumentFragment();

				for(let i = 0; i < changedObselType.super_obsel_types.length; i++) {
					const parentObselType = changedObselType.super_obsel_types[i];
					const parentObselTypeBox = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(parentObselType.id));

					if(parentObselTypeBox) {
						let arrowFound = false;

						for(let j = 0; !arrowFound && (j < diagramArrows.length); j++)
							arrowFound = (diagramArrows[j].fromBox == obselTypeBox) && (diagramArrows[j].toBox == parentObselTypeBox);

						if(!arrowFound) {
							const anArrow = document.createElement("ktbs4la2-model-diagram-arrow");
							anArrow.fromBox = obselTypeBox;
							anArrow.toBox = parentObselTypeBox;
							newNodeContent.appendChild(anArrow);
						}
					}
					else
						this.emitErrorEvent(new Error("Could not find box for obsel type " + parentObselType.id));
				}

				if(newNodeContent.childElementCount > 0)
					this._diagramArea.appendChild(newNodeContent);
			}
			else {
				const anArrow = document.createElement("ktbs4la2-model-diagram-arrow");
				anArrow.fromBox = obselTypeBox;
				anArrow.toBox = this._defaultObseltypeElement;
				this._diagramArea.appendChild(anArrow);
			}

			const modelsLayoutsString = window.localStorage.getItem("model-diagram-layouts");

			if(modelsLayoutsString != null) {
				const modelsLayouts = JSON.parse(modelsLayoutsString);

				if(!modelsLayouts[this._model.uri.toString()])
					this.auto_arrange_obseltypes();
			}
			else
				this.auto_arrange_obseltypes();
		}
	}

	/**
	 *  
	 */
	_onChangeObselTypeDetails(event) {
		if(this._obseltypeDetails.checkValidity()) {
			const changedObselType = this._obseltypeDetails.obsel_type;
			this._applyObselTypeChanges(changedObselType);
			this._is_valid = true;

			if(this._closeObseltypeDetailsButton.classList.contains("disabled"))
				this._closeObseltypeDetailsButton.classList.remove("disabled");

			this._closeObseltypeDetailsButton.setAttribute("title", this._translateString("Close"));

			if(this._duplicateObseltypeButton.classList.contains("disabled"))
				this._duplicateObseltypeButton.classList.remove("disabled");

			this._duplicateObseltypeButton.setAttribute("title", this._translateString("Delete this obsel type"));
		}
		else {
			this._is_valid = false;

			if(!this._closeObseltypeDetailsButton.classList.contains("disabled"))
				this._closeObseltypeDetailsButton.classList.add("disabled");

			this._closeObseltypeDetailsButton.setAttribute("title", this._translateString("Specified data for the obsel type is invalid.\nYou must correct it first to be able to close this panel."));

			if(!this._duplicateObseltypeButton.classList.contains("disabled"))
				this._duplicateObseltypeButton.classList.add("disabled");

			this._duplicateObseltypeButton.setAttribute("title", this._translateString("Specified data for the obsel type is invalid.\nYou must correct it first to be able to duplicate this obsel type."));
		}

		this._updateObseltypeDetailsReservedIds();
		this.dispatchEvent(new CustomEvent("change", {bubbles: true, cancelable: false, composed: false}));
	}

	/**
	 * 
	 */
	_updateObseltypeDetailsReservedIds() {
		const reserved_ids = ["@id"];

		for(let i = 0; i < AttributeType.builtin_attribute_types_ids.length; i++)
			reserved_ids.push(AttributeType.builtin_attribute_types_ids[i]);

		for(let i = 0; i < this._model.attribute_types.length; i++)
			reserved_ids.push(this._model.attribute_types[i].id);

		this._obseltypeDetails.reserved_attributetypes_ids = reserved_ids;
	}

	/**
	 * 
	 * @param {*} event 
	 */
	_onChangeAttributeType(event) {
		const changedAttribute = event.detail.attributeType;
		const affected_obselTypes = changedAttribute.obsel_types;

		for(let i = 0; i < affected_obselTypes.length; i++) {
			const obselTypeBox = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(affected_obselTypes[i].id));

			if(obselTypeBox)
				obselTypeBox.updateDisplay();
			else
				this.emitErrorEvent(new Error("Cannot retrieve box for obsel type " + affected_obselTypes[i].id));
		}

		this._updateObseltypeDetailsReservedIds();
	}

	/**
	 * 
	 */
	_onClickCloseObseltypeDetailsButton(event) {
		if(!this._closeObseltypeDetailsButton.classList.contains("disabled")) {
			if(!this._obseltypeDetailsPanel.classList.contains("hidden"))
				this._obseltypeDetailsPanel.classList.add("hidden");
			
			this._obseltype_is_being_edited = false;

			const selectedBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype.selected");

			for(let i = 0; i < selectedBoxes.length; i++)
				selectedBoxes[i].classList.remove("selected");

			const changedObselType = this._obseltypeDetails.obsel_type;
			const model_obselTypes = this._model.obsel_types;

			for(let i = 0; i < model_obselTypes.length; i++) {
				if(model_obselTypes[i].id == changedObselType.id) {
					model_obselTypes[i] = changedObselType;
					break;
				}
			}

			this._model.obsel_types = model_obselTypes;
		}
		else {
			alert(this._translateString("Specified data for the obsel type is invalid.\nYou must correct it first to be able to close this panel."));
			this._obseltypeDetails.reportValidity();
		}
	}

	/**
	 * 
	 */
	_onClickCancelObseltypeModificationsButton(event) {
		this._obseltypeDetails.resetObselType();
		this._applyObselTypeChanges(this._obseltypeDetails.obsel_type);

		if(!this._obseltypeDetailsPanel.classList.contains("hidden"))
			this._obseltypeDetailsPanel.classList.add("hidden");

		this._obseltype_is_being_edited = false;

		const selectedBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype.selected");

		for(let i = 0; i < selectedBoxes.length; i++)
			selectedBoxes[i].classList.remove("selected");

		this.dispatchEvent(new CustomEvent("change", {bubbles: true, cancelable: false, composed: false}));
	}

	/**
	 * 
	 */
	_onClickDuplicateObseltypeButton(event) {
		if(!this._closeObseltypeDetailsButton.classList.contains("disabled")) {
			const newObselTypeId = this._promptNewObseltypeID();

			if(newObselTypeId != null) {
				const modelObselTypes = this._model.obsel_types;
				const newObselType = this._obseltypeDetails.obsel_type.clone();
				newObselType.id = newObselTypeId;

				for(let i = 0; i < this._obseltypeDetails.obsel_type.attribute_types.length; i++)
					newObselType.addAttributeType(this._obseltypeDetails.obsel_type.attribute_types[i]);

				const label_translations = newObselType.label_translations;

				for(let i = (label_translations.length - 1); i >= 0; i--)
					newObselType.remove_label_translation(label_translations[i]["@language"]);

				newObselType.suggestedColor = null;
				newObselType.suggestedSymbol = null;
				modelObselTypes.push(newObselType);
				this._model.obsel_types = modelObselTypes;

				const newObselTypeBox = document.createElement("ktbs4la2-model-diagram-obseltype");
				newObselTypeBox.setAttribute("title", this._translateString("Click to view this obsel type's details"));
				newObselTypeBox.setAttribute("id", newObselTypeId);
				newObselTypeBox.setAttribute("lang", this._lang);
				newObselTypeBox.obsel_type = newObselType;
				newObselTypeBox.classList.add("selected")
				newObselTypeBox.addEventListener("click", this._onClickObselTypeBox.bind(this));
				newObselTypeBox.addEventListener("mousedown", this._onMouseDownObselTypeBox.bind(this));
				this._diagramArea.appendChild(newObselTypeBox);

				newObselTypeBox._componentReady.then(() => {
					const anArrowNode = document.createElement("ktbs4la2-model-diagram-arrow");
					anArrowNode.fromBox = newObselTypeBox;
					anArrowNode.toBox = this._defaultObseltypeElement;
					this._diagramArea.appendChild(anArrowNode);

					this._obseltypeDetails.obsel_type = newObselType;

					if(this._obseltypeDetailsPanel.classList.contains("hidden"))
						this._obseltypeDetailsPanel.classList.remove("hidden");

					this._obseltype_is_being_edited = true;

					const modelsLayoutsString = window.localStorage.getItem("model-diagram-layouts");

					if(modelsLayoutsString != null) {
						const modelsLayouts = JSON.parse(modelsLayoutsString);

						if(!modelsLayouts[this._model.uri.toString()])
							this.auto_arrange_obseltypes();
					}
					else
						this.auto_arrange_obseltypes();
				});
			}
		}
		else {
			alert(this._translateString("Specified data for the obsel type is invalid.\nYou must correct it first to be able to duplicate this obsel type."));
			this._obseltypeDetails.reportValidity();
		}
	}

	/**
	 * 
	 */
	_onClickDeleteObseltypeButton(event) {
		if(window.confirm(this._translateString("Are you sure you want to delete this obsel type ?\n(Please note that your changes will not be recorded until you click the \"save\" button)"))) {
			if(!this._obseltypeDetailsPanel.classList.contains("hidden"))
				this._obseltypeDetailsPanel.classList.add("hidden");

			this._obseltype_is_being_edited = false;

			const changedObselType = this._obseltypeDetails.obsel_type;
			const obselTypeBox = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(changedObselType.id));

			if(obselTypeBox) {
				const diagramArrows = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-arrow");

				for(let i = 0; i < diagramArrows.length; i++)
					if((diagramArrows[i].fromBox == obselTypeBox) || (diagramArrows[i].toBox == obselTypeBox))
						diagramArrows[i].remove();

				obselTypeBox.remove();
			}
			
			const model_obselTypes = this._model.obsel_types;

			for(let i = 0; i < model_obselTypes.length; i++) {
				if(model_obselTypes[i].id == changedObselType.id) {
					model_obselTypes.splice(i, 1);
					break;
				}
			}

			this._model.obsel_types = model_obselTypes;
		}
	}

	/**
	 * 
	 */
	auto_arrange_obseltypes() {
		if((this._model.obsel_types instanceof Array) && (this._model.obsel_types.length > 0)) {
			const boxes_grid = new Array();
			
			// assign obsel types rows
			for(let i = 0; i < this._model.obsel_types.length; i++) {
				const anObselType = this._model.obsel_types[i];
				const obselType_hierarchy_rank = anObselType.types_hierarchy_rank;

				if(!(boxes_grid[obselType_hierarchy_rank] instanceof Array))
					boxes_grid[obselType_hierarchy_rank] = new Array();

				boxes_grid[obselType_hierarchy_rank].push(anObselType);
			}

			// sort obsel types inside each row
			for(let row = 0; row < boxes_grid.length; row++) {
				const aRow = boxes_grid[row];

				// @TODO : sort aRow
			}

			// calculate boxes relative positions ...
			const BOXES_HORIZONTAL_SPACING = 10;
			const BOXES_VERTICAL_SPACING = 40;
			let topCursor = this._defaultObseltypeElement.getBoundingClientRect().bottom - this._diagramArea.getBoundingClientRect().top + this._diagramArea.scrollTop + BOXES_VERTICAL_SPACING;

			const boxes_relative_positions = new Array();
			let leftestBoxX = 0;

			for(let row = 0; row < boxes_grid.length; row++) {
				boxes_relative_positions[row] = new Array();
				let rowMaxHeight = 0;
				const aRow = boxes_grid[row];
				const middleColStart = Math.floor(aRow.length / 2);

				let leftCursor, rightCursor;
				
				// this row has an even number of obsels
				if(middleColStart == (aRow.length / 2))
					rightCursor = BOXES_HORIZONTAL_SPACING / 2;
				// this row has an odd number of obsels
				else {
					const rightStartObsel = aRow[middleColStart];
					const rightStartObselElement = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(rightStartObsel.id));
					rightCursor = -(rightStartObselElement.clientWidth / 2);
				}

				leftCursor = rightCursor;

				// adjust boxes position from the middle to the right
				for(let col = middleColStart; col < aRow.length; col++) {
					const anObsel = aRow[col];
					const anObselElement = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(anObsel.id));
					
					if(anObselElement) {
						boxes_relative_positions[row][col] = {x: rightCursor, y: topCursor};
						rightCursor += (anObselElement.clientWidth + BOXES_HORIZONTAL_SPACING);

						if(anObselElement.clientHeight > rowMaxHeight)
							rowMaxHeight = anObselElement.clientHeight;
					}
				}

				// adjust boxes position from the middle to the left
				for(let col = middleColStart - 1; col >= 0; col--) {
					const anObsel = aRow[col];
					const anObselElement = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(anObsel.id));

					if(anObselElement) {
						leftCursor -= (anObselElement.clientWidth + BOXES_HORIZONTAL_SPACING);

						if(leftCursor < leftestBoxX)
							leftestBoxX = leftCursor;

						boxes_relative_positions[row][col] = {x: -Math.abs(leftCursor), y: topCursor};

						if(anObselElement.clientHeight > rowMaxHeight)
							rowMaxHeight = anObselElement.clientHeight;
					}
				}

				topCursor += rowMaxHeight + BOXES_VERTICAL_SPACING;
			}
			// ... done calculating boxes relative positions

			// set boxes absolute positions ...
			const availableWidth = this._diagramArea.getBoundingClientRect().width;
			const middleX = availableWidth / 2;
			const leftOffset = Math.abs(leftestBoxX) > middleX?(Math.abs(leftestBoxX) - middleX + 8):0;
			let rightestBoxRight = 0;

			for(let row = 0; row < boxes_grid.length; row++) {
				const aRow = boxes_grid[row];

				for(let col = 0; col < aRow.length; col++) {
					const anObsel = aRow[col];
					const anObselElement = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(anObsel.id));

					if(anObselElement) {
						const boxLeft = middleX + leftOffset + boxes_relative_positions[row][col].x;
						anObselElement.style.left = boxLeft + "px";
						anObselElement.style.top = boxes_relative_positions[row][col].y + "px";
						anObselElement.dispatchEvent(new CustomEvent("move", {composed: false, bubbles: false, cancelable: false}));

						const boxRight = boxLeft + anObselElement.getBoundingClientRect().width;

						if(boxRight > rightestBoxRight)
							rightestBoxRight = boxRight;
					}
				}
			}
			// ... done setting boxes absolute positions

			// adjust the diagram element's height so it fits the content
			this._diagramArea.style.height = topCursor + "px";
			this._obseltypeDetails.style.maxHeight = topCursor + "px";
			
			// adjust the diagram element's horizontal scroll so it's centered
			if(rightestBoxRight > availableWidth)
				this._diagramArea.scrollLeft = (rightestBoxRight - availableWidth) / 2;

			// update arrows
			const allDiagramArrowElements = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-arrow");

			for(let i = 0; i < allDiagramArrowElements.length; i++) {
				const anArrowElement = allDiagramArrowElements[i];
				anArrowElement.fromAnchor = "top";
				anArrowElement.toAnchor = "bottom";
			}
		}

		this._layout_is_automatic = true;
	}

	/**
	 * 
	 */
	_onClickDetailsButton(event) {
		if(!this._obseltype_is_being_edited) {
			if(this._container.classList.contains("move"))
				this._container.classList.remove("move");

			if(this._moveButton.classList.contains("selected"))
				this._moveButton.classList.remove("selected");

			if(!this._container.classList.contains("details"))
				this._container.classList.add("details");

			if(!this._detailsButton.classList.contains("selected"))
				this._detailsButton.classList.add("selected");

			this._detailsButton.setAttribute("title", this._translateString("Currently selected tool : ") + this._translateString("View details\nClicking an obsel type show a modal panel including its full details and allowing edition"));
			this._moveButton.setAttribute("title", this._translateString("Click to select tool : ") + this._translateString("Move obsel types\nAllows to manually rearrange obsel types layout by individually dragging them"));

			const obselTypesBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype");

			for(let i = 0; i < obselTypesBoxes.length; i++)
				obselTypesBoxes[i].setAttribute("title", this._translateString("Click to view this obsel type's details"));
		}
		
	}

	/**
	 * 
	 */
	get _obseltype_is_being_edited() {
		return this._container.classList.contains("obseltype-is-being-edited");
	}

	/**
	 * 
	 */
	set _obseltype_is_being_edited(is_being_edited) {
		if(is_being_edited === true) {
			if(!this._container.classList.contains("obseltype-is-being-edited"))
				this._container.classList.add("obseltype-is-being-edited");
		}
		else if(is_being_edited === false) {
			if(this._container.classList.contains("obseltype-is-being-edited"))
				this._container.classList.remove("obseltype-is-being-edited");
		}
		else
			throw new TypeError("Value for private property _obseltype_is_being_edited must be a boolean");
	}

	/**
	 * 
	 */
	get selected_obselType() {
		return this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype.selected");
	}

	/**
	 * 
	 */
	get _layout_is_automatic() {
		return this._container.classList.contains("automatic-layout");
	}

	/**
	 * 
	 */
	set _layout_is_automatic(new_is_automatic) {
		if(typeof new_is_automatic == "boolean") {
			if(new_is_automatic && !this._container.classList.contains("automatic-layout"))
				this._container.classList.add("automatic-layout");
			else if(!new_is_automatic && this._container.classList.contains("automatic-layout"))
				this._container.classList.remove("automatic-layout");
		}
		else
			throw new TypeError("New value for property \"_layout_is_automatic\" must be a boolean");
	}

	/**
	 * 
	 */
	_onClickMoveButton(event) {
		if(this._container.classList.contains("details"))
			this._container.classList.remove("details");

		if(this._detailsButton.classList.contains("selected"))
			this._detailsButton.classList.remove("selected");

		if(!this._container.classList.contains("move"))
			this._container.classList.add("move");

		if(!this._moveButton.classList.contains("selected"))
			this._moveButton.classList.add("selected");

		this._detailsButton.setAttribute("title", this._translateString("Click to select tool : ") + this._translateString("View details\nClicking an obsel type show a modal panel including its full details and allowing edition"));
		this._moveButton.setAttribute("title", this._translateString("Currently selected tool : ") + this._translateString("Move obsel types\nAllows to manually rearrange obsel types layout by individually dragging them"));
			
		const obselTypesBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype");

		for(let i = 0; i < obselTypesBoxes.length; i++)
			obselTypesBoxes[i].setAttribute("title", this._translateString("Drag this obsel type"));
	}

	/**
	 * 
	 */
	_onClickAutoArrangeButton(event) {
		setTimeout(() => {
			this.auto_arrange_obseltypes();
			this._clearCurrentModelDiagramLayout();
		});
	}

	/**
	 * 
	 */
	_promptNewObseltypeID() {
		const reserved_ids = new Array();

		for(let i = 0; i < this._model.obsel_types.length; i++)
			reserved_ids.push(this._model.obsel_types[i].id);

		const idValidationPattern = new RegExp('^[a-zA-Z0-9\-_]+$');
		let newObselTypeId = "";

		while(newObselTypeId == "") {
			newObselTypeId = window.prompt(this._translateString("Please enter an ID for the new obsel type :\n(allowed characters : letters, numbers, \"-\" and \"_\")"));

			if(newObselTypeId != null) {
				let error = null;
				
				if(!idValidationPattern.test(newObselTypeId))
					error = "Invalid ID !\nPlease enter an non empty string containing only letters, numbers, \"-\" or \"_\".";
				else if(reserved_ids.includes(newObselTypeId))
					error = "This ID is already used by an other obsel type in the same model !\nPlease choose a different ID.";

				if(error) {
					window.alert(this._translateString(error));
					newObselTypeId = "";
				}
			}
		}

		return newObselTypeId;
	}

	/**
	 * 
	 */
	_onClickCreateObseltypeButton(event) {
		if(this.getAttribute("mode") == "edit") {
			const newObselTypeId = this._promptNewObseltypeID();

			if(newObselTypeId != null) {
				const modelObselTypes = this._model.obsel_types;
				const newObselType = new ObselType(this._model);
				newObselType.id = newObselTypeId;
				modelObselTypes.push(newObselType);
				this._model.obsel_types = modelObselTypes;

				const newObselTypeBox = document.createElement("ktbs4la2-model-diagram-obseltype");
				newObselTypeBox.setAttribute("title", this._translateString("Click to view this obsel type's details"));
				newObselTypeBox.setAttribute("id", newObselTypeId);
				newObselTypeBox.setAttribute("lang", this._lang);
				newObselTypeBox.obsel_type = newObselType;
				newObselTypeBox.classList.add("selected")
				newObselTypeBox.addEventListener("click", this._onClickObselTypeBox.bind(this));
				newObselTypeBox.addEventListener("mousedown", this._onMouseDownObselTypeBox.bind(this));
				this._diagramArea.appendChild(newObselTypeBox);

				newObselTypeBox._componentReady.then(() => {
					const anArrowNode = document.createElement("ktbs4la2-model-diagram-arrow");
					anArrowNode.fromBox = newObselTypeBox;
					anArrowNode.toBox = this._defaultObseltypeElement;
					this._diagramArea.appendChild(anArrowNode);

					this._obseltypeDetails.obsel_type = newObselType;

					if(this._obseltypeDetailsPanel.classList.contains("hidden"))
						this._obseltypeDetailsPanel.classList.remove("hidden");

					this._obseltype_is_being_edited = true;

					const modelsLayoutsString = window.localStorage.getItem("model-diagram-layouts");

					if(modelsLayoutsString != null) {
						const modelsLayouts = JSON.parse(modelsLayoutsString);

						if(!modelsLayouts[this._model.uri.toString()])
							this.auto_arrange_obseltypes();
					}
					else
						this.auto_arrange_obseltypes();
				});
			}
		}
	}

	/**
	 * 
	 */
	/*_onClickCreateInheritanceButton(event) {
		console.log("_onClickCreateInheritanceButton()");
	}*/

	/**
	 * 
	 */
	_onClickObselTypeBox(event) {
		if(this._container.classList.contains("details") && !this._obseltype_is_being_edited) {
			const clickedBox = event.target;

			if(
					clickedBox 
				&&	(clickedBox.localName == "ktbs4la2-model-diagram-obseltype")
				&& 	clickedBox.hasAttribute("id")
				&&	!clickedBox.classList.contains("selected")) {
					const previousltySelectedBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype.selected");

					for(let i = 0; i < previousltySelectedBoxes.length; i++)
						previousltySelectedBoxes[i].classList.remove("selected");

					clickedBox.classList.add("selected");

					const obselType_id = clickedBox.getAttribute("id");
					const obselType = this._model.get_obsel_type(obselType_id);

					if(obselType) {
						this._obseltypeDetails.obsel_type = obselType;

						if(this._obseltypeDetailsPanel.classList.contains("hidden"))
							this._obseltypeDetailsPanel.classList.remove("hidden");

						if(this.mode == "edit")
							this._obseltype_is_being_edited = true;
					}
			}
		}
	}

	/**
	 * 
	 */
	_onMouseDownObselTypeBox(event) {
		if(this._container.classList.contains("move")) {
			const clickedBox = event.target;

			if(
					clickedBox 
				&&	(clickedBox.localName == "ktbs4la2-model-diagram-obseltype")
				&& 	clickedBox.hasAttribute("id")) {
					const previousltyMovedBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype.moved");
					
					for(let i = 0; i < previousltyMovedBoxes.length; i++)
						previousltyMovedBoxes[i].classList.remove("moved");

					this._draggedBox = clickedBox;
				
					this._drag_origin = {
						x: event.offsetX, 
						y: event.offsetY
					};

					this._draggedBox.classList.add("moved");
					document.addEventListener('mousemove', this._onDocumentMouseMoveBindedMethod);
					document.addEventListener('mouseup', this._onDocumentMouseUpBindedMethod);
			}
		}
	}

	/**
	 * 
	 */
	_onDocumentMouseMove(event) {
		event.preventDefault();
		event.stopPropagation();

		if(this._updateDraggedBoxPositionTaskID)
			clearTimeout(this._updateDraggedBoxPositionTaskID);

		this._updateDraggedBoxPositionTaskID = setTimeout(() => {
			if(this._draggedBox) {
				const diagramAreaRect = this._diagramArea.getBoundingClientRect();
				let boxX = (event.offsetX + this._diagramArea.scrollLeft) - (diagramAreaRect.left + this._drag_origin.x);
				
				if(boxX < 10)
					boxX = 10;

				this._draggedBox.style.left = boxX + "px";
				
				let boxY = (event.offsetY + this._diagramArea.scrollTop) - (diagramAreaRect.top + this._drag_origin.y);
				
				if(boxY < 10)
					boxY = 10;

				this._draggedBox.style.top = boxY + "px";
				this._draggedBox.dispatchEvent(new CustomEvent("move", {composed: false, bubbles: false, cancelable: false}));
			}

			delete this._updateDraggedBoxPositionTaskID;
		});
	}

	/**
	 * 
	 */
	_saveCurrentModelDiagramLayout() {
		if(this._saveCurrentModelDiagramLayoutTaskID)
			clearTimeout(this._saveCurrentModelDiagramLayoutTaskID);

		this._saveCurrentModelDiagramLayoutTaskID = setTimeout(() => {
			const modelsLayoutsString = window.localStorage.getItem("model-diagram-layouts");

			let modelsLayouts;

            if(modelsLayoutsString != null)
                modelsLayouts = JSON.parse(modelsLayoutsString);
            else
                modelsLayouts = {};

			let currentModelLayout = {};

			const obselTypesBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype");

			for(let i = 0; i < obselTypesBoxes.length; i++) {
				const anobselTypeBox = obselTypesBoxes[i];

				currentModelLayout[anobselTypeBox.id] = {
					x: anobselTypeBox.getBoundingClientRect().left - this._diagramArea.getBoundingClientRect().left, 
					y: anobselTypeBox.getBoundingClientRect().top - this._diagramArea.getBoundingClientRect().top
				}
			}

			modelsLayouts[this._model.uri.toString()] = currentModelLayout;
			window.localStorage.setItem("model-diagram-layouts", JSON.stringify(modelsLayouts));
			delete this._saveCurrentModelDiagramLayoutTaskID;
		});
	}

	/**
	 * 
	 */
	 _clearCurrentModelDiagramLayout() {
		if(this._clearCurrentModelDiagramLayoutTaskID)
			clearTimeout(this._clearCurrentModelDiagramLayoutTaskID);

		this._clearCurrentModelDiagramLayoutTaskID = setTimeout(() => {
			const modelsLayoutsString = window.localStorage.getItem("model-diagram-layouts");

            if(modelsLayoutsString != null) {
                const modelsLayouts = JSON.parse(modelsLayoutsString);

				if(modelsLayouts[this._model.uri.toString()]) {
					delete modelsLayouts[this._model.uri.toString()];
					window.localStorage.setItem("model-diagram-layouts", JSON.stringify(modelsLayouts));
				}
			}
			
			delete this._clearCurrentModelDiagramLayoutTaskID;
		});
	}

	/**
	 * 
	 */
	_onDocumentMouseUp(event) {
		document.removeEventListener('mousemove', this._onDocumentMouseMoveBindedMethod);
    	document.removeEventListener('mouseup', this._onDocumentMouseUpBindedMethod);

		if(this._draggedBox) {
			if(this._draggedBox.classList.contains("moved"))
				this._draggedBox.classList.remove("moved");

			delete this._draggedBox;
			this._layout_is_automatic = false;
			this._saveCurrentModelDiagramLayout();
		}
	}

	/**
	 * 
	 */
	resetModel() {
		if(this._model_copy) {
			this._model = this._model_copy;

			if(this.getAttribute("mode") == "edit")
				this._model_copy = this._model.clone();
			else
				delete this._model_copy;

			this._updateDiagram();
		}
	}

	/**
	 * 
	 */
	_updateDiagram() {
		this._componentReady.then(() => {
			if(this._container.classList.contains("waiting"))
				this._container.classList.remove("waiting");

			// purge previous elemnts
			const previousContentElements = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype, ktbs4la2-model-diagram-arrow");

			for(let i = 0; i < previousContentElements.length; i++)
				previousContentElements[i].remove();
			// ---
			
			// instanciate diagram elements
			if((this._model.obsel_types instanceof Array) && (this._model.obsel_types.length > 0)) {
				const newNodeContent = document.createDocumentFragment();
				const obseltypesElementsPopulatedPromises = new Array();

				// instanciate obsel type's boxes
				for(let i = 0; i < this._model.obsel_types.length; i++) {
					const anObselType = this._model.obsel_types[i];
					const aChildObselTypeNode = document.createElement("ktbs4la2-model-diagram-obseltype");
					aChildObselTypeNode.setAttribute("title", this._translateString("Click to view this obsel type's details"));
					aChildObselTypeNode.setAttribute("id", this._model.obsel_types[i].id);
					aChildObselTypeNode.setAttribute("lang", this._lang);
					aChildObselTypeNode.obsel_type = anObselType;
					aChildObselTypeNode.addEventListener("click", this._onClickObselTypeBox.bind(this));
					aChildObselTypeNode.addEventListener("mousedown", this._onMouseDownObselTypeBox.bind(this));
					newNodeContent.appendChild(aChildObselTypeNode);
					obseltypesElementsPopulatedPromises.push(aChildObselTypeNode.elementPopulated);
				}

				// instanciate inheritance arrows
				for(let i = 0; i < this._model.obsel_types.length; i++) {
					const anObselType = this._model.obsel_types[i];
					const anObselTypeBox = newNodeContent.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(anObselType.id));

					if(anObselTypeBox) {
						// if the current obsel type inherits from other obsel types in the model, we draw arrows between their respective boxes
						if((anObselType.super_obsel_types instanceof Array) && (anObselType.super_obsel_types.length > 0)) {
							// instanciate arrows elements
							for(let j = 0; j < anObselType.super_obsel_types.length; j++) {
								const parentObselType = anObselType.super_obsel_types[j];
								const parentObselTypeBox = newNodeContent.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(parentObselType.id));
								
								if(parentObselTypeBox) {
									const anArrowNode = document.createElement("ktbs4la2-model-diagram-arrow");
									anArrowNode.fromBox = anObselTypeBox;
									anArrowNode.toBox = parentObselTypeBox;
									newNodeContent.appendChild(anArrowNode);
								}
								else
									this.emitErrorEvent(new Error("Could not find html element for obsel type " + parentObselType.id));
							}
						}
						// if the current obsel type does not inherit, we still draw an arrow between its box and the "Default" box
						else {
							const anArrowNode = document.createElement("ktbs4la2-model-diagram-arrow");
							anArrowNode.fromBox = anObselTypeBox;
							anArrowNode.toBox = this._defaultObseltypeElement;
							newNodeContent.appendChild(anArrowNode);
						}
					}
					else
						this.emitErrorEvent(new Error("Could not find html element for obsel type " + anObselType.id));
				}

				Promise.all(obseltypesElementsPopulatedPromises).then(() => {
					const modelsLayoutsString = window.localStorage.getItem("model-diagram-layouts");

					if(modelsLayoutsString != null) {
						const modelsLayouts = JSON.parse(modelsLayoutsString);

						if(modelsLayouts[this._model.uri.toString()]) {
							const currentModelLayout = modelsLayouts[this._model.uri.toString()];
							const obsel_types_ids = Object.keys(currentModelLayout);
							let maxBottom = 0;

							for(let i = 0; i < obsel_types_ids.length; i++) {
								const obselTypeBox = this._diagramArea.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(obsel_types_ids[i]));

								if(obselTypeBox) {
									obselTypeBox.style.left = currentModelLayout[obsel_types_ids[i]].x + "px";
									obselTypeBox.style.top = currentModelLayout[obsel_types_ids[i]].y + "px";
									obselTypeBox.dispatchEvent(new CustomEvent("move", {composed: false, bubbles: false, cancelable: false}));

									if((currentModelLayout[obsel_types_ids[i]].y + obselTypeBox.getBoundingClientRect().height) > maxBottom)
										maxBottom = currentModelLayout[obsel_types_ids[i]].y + obselTypeBox.getBoundingClientRect().height;
								}
							}

							// adjust the diagram element's height so it fits the content
							this._diagramArea.style.height = (maxBottom + 40) + "px";
							this._obseltypeDetails.style.maxHeight = (maxBottom + 40) + "px";
						}
						else
							this.auto_arrange_obseltypes();
					}
					else
						this.auto_arrange_obseltypes();

					if(!this._container.classList.contains("details"))
						this._container.classList.add("details");

					this._is_valid = true;

					if(this._closeObseltypeDetailsButton.classList.contains("disabled"))
						this._closeObseltypeDetailsButton.classList.remove("disabled");

					this._closeObseltypeDetailsButton.setAttribute("title", this._translateString("Close"));
				});

				this._diagramArea.appendChild(newNodeContent);
			}
			else {
				if(!this._container.classList.contains("empty"))
					this._container.classList.add("empty");
			}

			this._updateObseltypeDetailsReservedIds();
		});
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncInSync() {
		this._model = this._ktbsResource.clone();

		if(this.getAttribute("mode") == "edit")
			this._model_copy = this._model.clone();

		this._updateDiagram();
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncError(old_syncStatus, error) {
		super.onKtbsResourceSyncError(old_syncStatus, error);

		this._componentReady.then(() => {
			if(this._container.classList.contains("waiting"))
				this._container.classList.remove("waiting");
			
			this._errorMessage.innerText = "Error : " + error;

			if(!this._container.classList.contains("error"))
				this._container.classList.add("error");
		});
	}

	/**
     * 
     */
	_updateStringsTranslation() {
		this._waitMessage.innerText = this._translateString("Waiting for server response...");
		this._emptyMessage.innerText = this._translateString("No data to display");

		if(this._container.classList.contains("move")) {
			this._detailsButton.setAttribute("title", this._translateString("Click to select tool : ") + this._translateString("View details\nClicking an obsel type show a modal panel including its full details and allowing edition"));
			this._moveButton.setAttribute("title", this._translateString("Currently selected tool : ") + this._translateString("Move obsel types\nAllows to manually rearrange obsel types layout by individually dragging them"));
		}
		else {
			this._detailsButton.setAttribute("title", this._translateString("Currently selected tool : ") + this._translateString("View details\nClicking an obsel type show a modal panel including its full details and allowing edition"));
			this._moveButton.setAttribute("title", this._translateString("Click to select tool : ") + this._translateString("Move obsel types\nAllows to manually rearrange obsel types layout by individually dragging them"));
		}

		this._autoArrangeButton.setAttribute("title", this._translateString("Automatically rearrange obsel types layout"));
		this._createObseltypeButton.setAttribute("title", this._translateString("Create a new obsel type"));
		//this._createInheritanceButton.setAttribute("title", this._translateString("Create a new inheritance relationship"));
		this._defaultObseltypeTitle.innerText = this._translateString("Default");

		// translate "Default box"
		const defaultObseltypeAttributetypes = this.shadowRoot.querySelectorAll("#default-obseltype-attributetypes-list li");

		defaultObseltypeAttributetypes[0].innerText = this._translateString("ID");

		for(let i = defaultObseltypeAttributetypes.length - 1; i > 0; i--)
			defaultObseltypeAttributetypes[i].remove();

		for(let i = 0; i < AttributeType.builtin_attribute_types.length; i++) {
			const aBuiltinAttribute = AttributeType.builtin_attribute_types[i];
			const aBuilitinAttributeElement = document.createElement("li");
			aBuilitinAttributeElement.innerText = aBuiltinAttribute.get_preferred_label(this._lang);
			this._defaultObseltypeAttributetypesList.appendChild(aBuilitinAttributeElement);
		}
		// done

		const obselTypesBoxes = this._diagramArea.querySelectorAll("ktbs4la2-model-diagram-obseltype");

		for(let i = 0; i < obselTypesBoxes.length; i++) {
			if(this._container.classList.contains("move"))
				obselTypesBoxes[i].setAttribute("title", this._translateString("Drag this obsel type"));
			else
				obselTypesBoxes[i].setAttribute("title", this._translateString("Click to view this obsel type's details"));

			obselTypesBoxes[i].setAttribute("lang", this._lang);
		}

		setTimeout(() => {
			if(this._layout_is_automatic)
				this.auto_arrange_obseltypes();
		});

		this._obseltypeDetails.setAttribute("lang", this._lang);
    }

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		return Model;
	}

	/**
	 * 
	 */
	get _allowFullScreen() {
		return (
				!this.hasAttribute("allow-fullscreen") 
			||	!(
					(this.getAttribute("allow-fullscreen") == "0") 
				||	(this.getAttribute("allow-fullscreen") == "false")
			)
		);
	}

	/**
	 * 
	 */
	_onClickToggleFullscreenButton(event) {
		event.stopPropagation();
	
		if(this._allowFullScreen) {
			if(document.fullscreenElement === null) {
				if(this.dispatchEvent(new Event("request-fullscreen", {cancelable: true})))
					this._container.requestFullscreen();
			}
			else
				document.exitFullscreen();
		}
	}

	/**
	 * 
	 */
	checkValidity() {
		return this._is_valid;
	}

	/**
	 * 
	 */
	get model() {
		return this._model;
	}
}

customElements.define('ktbs4la2-model-diagram', KTBS4LA2ModelDiagram);