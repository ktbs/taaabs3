import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Model} from "../../ktbs-api/Model.js";
import {AttributeType} from "../../ktbs-api/AttributeType.js";

import "./ktbs4la2-model-diagram-obseltype.js";
import "./ktbs4la2-model-diagram-arrow.js";

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
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
		this._errorMessage = this.shadowRoot.querySelector("#error-message");
		this._detailsButton = this.shadowRoot.querySelector("#details");
		this._detailsButton.addEventListener("click", this._onClickDetailsButton.bind(this));
		this._moveButton = this.shadowRoot.querySelector("#move");
		this._moveButton.addEventListener("click", this._onClickMoveButton.bind(this));
		this._autoArrangeButton = this.shadowRoot.querySelector("#auto-arrange");
		this._autoArrangeButton.addEventListener("click", this._onClickAutoArrangeButton.bind(this));
		this._createObseltypeButton = this.shadowRoot.querySelector("#create-obseltype");
		this._createObseltypeButton.addEventListener("click", this._onClickCreateObseltypeButton.bind(this));
		this._createInheritanceButton = this.shadowRoot.querySelector("#create-inheritance");
		this._createInheritanceButton.addEventListener("click", this._onClickCreateInheritanceButton.bind(this));
		this._defaultObseltypeElement = this.shadowRoot.querySelector("#default-obseltype");
		this._defaultObseltypeTitle = this.shadowRoot.querySelector("#default-obseltype-title");
		this._defaultObseltypeAttributetypesList = this.shadowRoot.querySelector("#default-obseltype-attributetypes-list");

		for(let i = 0; i < AttributeType.builtin_attribute_types.length; i++) {
			const aBuiltinAttribute = AttributeType.builtin_attribute_types[i];
			const aBuilitinAttributeElement = document.createElement("li");

			let attributetype_preferred_label = aBuiltinAttribute.get_translated_label(this._lang);

			if(!attributetype_preferred_label)
				attributetype_preferred_label = aBuiltinAttribute.label;

			if(!attributetype_preferred_label)
				attributetype_preferred_label = aBuiltinAttribute.id;

			aBuilitinAttributeElement.innerText = attributetype_preferred_label;
			this._defaultObseltypeAttributetypesList.appendChild(aBuilitinAttributeElement);
		}

		this._modelObselTypesContainer = this.shadowRoot.querySelector("#model-obseltypes");
	}

	/**
	 * 
	 */
	auto_arrange_obseltypes() {
		if((this._ktbsResource.obsel_types instanceof Array) && (this._ktbsResource.obsel_types.length > 0)) {
			const boxes_grid = new Array();
			
			// assign obsel types rows
			for(let i = 0; i < this._ktbsResource.obsel_types.length; i++) {
				const anObselType = this._ktbsResource.obsel_types[i];
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

			// set boxes positions ...
			const BOXES_HORIZONTAL_SPACING = 20;
			const BOXES_VERTICAL_SPACING = 50;
			let topCursor = 155;

			for(let row = 0; row < boxes_grid.length; row++) {
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
					const rightStartObselElement = this._modelObselTypesContainer.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(rightStartObsel.id));
					rightCursor = -(rightStartObselElement.clientWidth / 2);
				}

				leftCursor = rightCursor;

				// adjust boxes position from the middle to the right
				for(let col = middleColStart; col < aRow.length; col++) {
					const anObsel = aRow[col];
					const anObselElement = this._modelObselTypesContainer.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(anObsel.id));

					if(anObselElement) {
						anObselElement.style.left = "calc(50% + " + rightCursor + "px)";
						rightCursor += (anObselElement.clientWidth + BOXES_HORIZONTAL_SPACING);
						anObselElement.style.top = topCursor + "px";
						anObselElement.dispatchEvent(new CustomEvent("move", {composed: false, bubbles: false, cancelable: false}));

						if(anObselElement.clientHeight > rowMaxHeight)
							rowMaxHeight = anObselElement.clientHeight;
					}
				}

				// adjust boxes position from the middle to the left
				for(let col = middleColStart - 1; col >= 0; col--) {
					const anObsel = aRow[col];
					const anObselElement = this._modelObselTypesContainer.querySelector("ktbs4la2-model-diagram-obseltype#" + CSS.escape(anObsel.id));

					if(anObselElement) {
						leftCursor -= (anObselElement.clientWidth + BOXES_HORIZONTAL_SPACING);
						anObselElement.style.left = "calc(50% - " + Math.abs(leftCursor) + "px)";
						anObselElement.style.top = topCursor + "px";
						anObselElement.dispatchEvent(new CustomEvent("move", {composed: false, bubbles: false, cancelable: false}));

						if(anObselElement.clientHeight > rowMaxHeight)
							rowMaxHeight = anObselElement.clientHeight;
					}
				}

				topCursor += rowMaxHeight + BOXES_VERTICAL_SPACING;
			}
			// ... box position are now set

			// adjust the diagram element's height so it fits the content
			this._container.style.height = (topCursor - BOXES_VERTICAL_SPACING + 20) + "px";

			// update arrows
			const allDiagramArrowElements = this._modelObselTypesContainer.querySelectorAll("ktbs4la2-model-diagram-arrow");

			for(let i = 0; i < allDiagramArrowElements.length; i++) {
				const anArrowElement = allDiagramArrowElements[i];
				anArrowElement.fromAnchor = "top";
				anArrowElement.toAnchor = "bottom";
			}
		}
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
	_onClickMoveButton(event) {
		if(this._container.classList.contains("details"))
			this._container.classList.remove("details");

		if(this._detailsButton.classList.contains("selected"))
			this._detailsButton.classList.remove("selected");

		if(!this._container.classList.contains("move"))
			this._container.classList.add("move");

		if(!this._moveButton.classList.contains("selected"))
			this._moveButton.classList.add("selected");
	}

	/**
	 * 
	 */
	_onClickAutoArrangeButton(event) {
		setTimeout(() => {
			this.auto_arrange_obseltypes();
		});
	}

	/**
	 * 
	 */
	_onClickCreateObseltypeButton(event) {

	}

	/**
	 * 
	 */
	_onClickCreateInheritanceButton(event) {
		
	}

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
				const obselType_id = clickedBox.getAttribute("id");
				console.log("view obsel type details : " + obselType_id);

				const previousltySelectedBoxes = this._modelObselTypesContainer.querySelectorAll("ktbs4la2-model-diagram-obseltype.selected");

				for(let i = 0; i < previousltySelectedBoxes.length; i++)
					previousltySelectedBoxes[i].classList.remove("selected");

				clickedBox.classList.add("selected");
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
				const previousltyMovedBoxes = this._modelObselTypesContainer.querySelectorAll("ktbs4la2-model-diagram-obseltype.moved");
				
				for(let i = 0; i < previousltyMovedBoxes.length; i++)
					previousltyMovedBoxes[i].classList.remove("moved");

				this._draggedBox = clickedBox;
				
				this._drag_origin = {
					x: clickedBox.getBoundingClientRect().left - (this._modelObselTypesContainer.getBoundingClientRect().left + event.clientX), 
					y: clickedBox.getBoundingClientRect().top - (this._modelObselTypesContainer.getBoundingClientRect().top + event.clientY)
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
				this._draggedBox.style.left = (event.clientX + this._drag_origin.x) + "px";
				this._draggedBox.style.top = (event.clientY + this._drag_origin.y) + "px";
				this._draggedBox.dispatchEvent(new CustomEvent("move", {composed: false, bubbles: false, cancelable: false}));
				delete this._updateDraggedBoxPositionTaskID;
			}
		});
	}

	/**
	 * 
	 */
	_onDocumentMouseUp(event) {
		if(this._draggedBox) {
			if(this._draggedBox.classList.contains("moved"))
				this._draggedBox.classList.remove("moved");

			delete this._draggedBox;
		}
		
		document.removeEventListener('mousemove', this._onDocumentMouseMoveBindedMethod);
    	document.removeEventListener('mouseup', this._onDocumentMouseUpBindedMethod);
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {
			if(this._container.classList.contains("waiting"))
				this._container.classList.remove("waiting");

			// @TODO : effacer les éventuels childnodes précédemment instanciés

			// instanciate diagram elements
			if((this._ktbsResource.obsel_types instanceof Array) && (this._ktbsResource.obsel_types.length > 0)) {
				const newNodeContent = document.createDocumentFragment();
				const obseltypesElementsPopulatedPromises = new Array();

				// instanciate obsel type's boxes
				for(let i = 0; i < this._ktbsResource.obsel_types.length; i++) {
					const anObselType = this._ktbsResource.obsel_types[i];
					const aChildObselTypeNode = document.createElement("ktbs4la2-model-diagram-obseltype");
					aChildObselTypeNode.setAttribute("id", this._ktbsResource.obsel_types[i].id);
					aChildObselTypeNode.obsel_type = anObselType;
					aChildObselTypeNode.addEventListener("click", this._onClickObselTypeBox.bind(this));
					aChildObselTypeNode.addEventListener("mousedown", this._onMouseDownObselTypeBox.bind(this));
					newNodeContent.appendChild(aChildObselTypeNode);
					obseltypesElementsPopulatedPromises.push(aChildObselTypeNode.elementPopulated);
				}

				// instanciate inheritance arrows
				for(let i = 0; i < this._ktbsResource.obsel_types.length; i++) {
					const anObselType = this._ktbsResource.obsel_types[i];
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
					this.auto_arrange_obseltypes();

					if(!this._container.classList.contains("details"))
						this._container.classList.add("details");
				});

				this._modelObselTypesContainer.appendChild(newNodeContent);
			}
			else {
				if(!this._container.classList.contains("empty"))
					this._container.classList.add("empty");
			}
		});
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

    }

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		return Model;
	}
}

customElements.define('ktbs4la2-model-diagram', KTBS4LA2ModelDiagram);