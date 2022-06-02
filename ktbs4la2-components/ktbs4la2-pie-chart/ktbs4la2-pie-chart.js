import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import {getDistinctColor} from "../common/colors-utils.js";

/**
 * 
 */
class KTBS4LA2PieChart extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);
		this._sliceNodesObserver = new MutationObserver(this._onSliceNodesMutation.bind(this));
		this._sliceNodesObserver.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["number", "color", "string"]});
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		const observedAttributes = super.observedAttributes;
		observedAttributes.push('title');
		observedAttributes.push('width');
		observedAttributes.push('height');
		observedAttributes.push('pie-radius');
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "title")
			this._componentReady.then(() => {
				this._title.innerText = newValue;
			}).catch(() => {});

		if((attributeName == "width") || (attributeName == "height"))
			this._componentReady.then(() => {
				this._requestUpdatePie();
			}).catch(() => {});

		if(attributeName == "pie-radius") {
			this._componentReady.then(() => {
				this._requestUpdatePie();
			}).catch(() => {});
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
		this._title = this.shadowRoot.querySelector("#title");
		this._pie = this.shadowRoot.querySelector("#pie");
		this._legend = this.shadowRoot.querySelector("#legend");
		this._popup = this.shadowRoot.querySelector("#popup");
		this._popupTitle = this.shadowRoot.querySelector("#popup-title");
		this._popupContent = this.shadowRoot.querySelector("#popup-content");
		this._requestUpdatePie();
	}

	/**
	 * 
	 */
	_onSliceNodesMutation(mutationRecords, observer) {
		if(this._valuesSum != undefined)
			delete this._valuesSum;

		this._componentReady.then(() => {
			this._requestUpdatePie();
		}).catch(() => {});
	}

	/**
	 * 
	 */
	_requestUpdatePie() {
		if(this._requestUpdatePieTaskID)
			clearTimeout(this._requestUpdatePieTaskID);

		this._requestUpdatePieTaskID = setTimeout(() => {
			this._updatePie();
			delete this._requestUpdatePieTaskID;
		});
	}

	/**
	 * 
	 */
	_updatePie() {
		// reset the "pie" SVG element's dimensions
		this._pie.setAttribute("viewBox", -1.2 * this.pieRadius + " " + -1.2 * this.pieRadius + " " + 2.4 * this.pieRadius + " " + 2.4 * this.pieRadius);
		this._pie.setAttribute("width", 2.4 * this.pieRadius);
		this._pie.setAttribute("height", 2.4 * this.pieRadius);
		// ---

		// cleanup previous slices and legend items
		const previousSlices = this._pie.childNodes;

		for(let i = previousSlices.length - 1; i >= 0; i--)
			previousSlices[i].remove();

		const previousLegendElements = this._legend.childNodes;

		for(let i = previousLegendElements.length - 1; i >= 0; i--)
			previousLegendElements[i].remove();
		// ---

		// re-instanciate each slice
		let cumulatedPercentages = 0;

		for(let i = 0; i < this.slices.length; i++) {
			const slice = this.slices[i];
			const value = parseFloat(slice.getAttribute("number"));
			const percentageValue = (value / this.valuesSum) * 100;
			const color = slice.hasAttribute("color")?slice.getAttribute("color"):getDistinctColor(i, this.slices.length);
			this._drawPieSlice(cumulatedPercentages, percentageValue, color, slice.getAttribute("string"));
			cumulatedPercentages += percentageValue;
		}
		// ---
	}

	/**
	 * 
	 */
	get valuesSum() {
		if(this._valuesSum == undefined) {
			let sum = 0;

			for(let i = 0; i < this.slices.length; i++) {
				const slice = this.slices[i];
				const value = parseFloat(slice.getAttribute("number"));
				sum += value;
			}

			this._valuesSum = sum;
		}

		return this._valuesSum;
	}

	/**
	 * 
	 */
	get pieRadius() {
		if(this.hasAttribute("pie-radius")) {
			const radius = parseFloat(this.getAttribute("pie-radius"), 10);

			if(!isNaN(radius))
				return radius;
			else 
				return 70;
		}
		else
			return 70;
	}

	/**
	 * 
	 * @param {*} beginPercentage 
	 * @param {*} sliceSizePercentage 
	 * @param {*} fillColor 
	 */
	_drawPieSlice(beginPercentage, sliceSizePercentage, fillColor, string) {
		const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
			// draw the slice
			const beginAngle = (beginPercentage / 100) * (2 * Math.PI);
			const cornerPoint = {x: 0, y: 0};
			const arcBeginPoint = {x: Math.sin(beginAngle) * this.pieRadius, y: -Math.cos(beginAngle) * this.pieRadius};
			const arcOrientationCode = (sliceSizePercentage > 50.0)?1:0;
			let endAngle, arcEndPoint, pathD;

			if(sliceSizePercentage < 100) {
				endAngle = ((beginPercentage + sliceSizePercentage) / 100) * (2 * Math.PI);
				arcEndPoint = {x: Math.sin(endAngle) * this.pieRadius, y: -Math.cos(endAngle) * this.pieRadius};

						// move (M) to the corner point
				pathD =	"M" + cornerPoint.x + "," + cornerPoint.y + " " + 
						// draw a line (L) to the arc begin point
						"L" + arcBeginPoint.x + "," + arcBeginPoint.y + " " + 
						// draw the arc (A) to the arc end point
						"A " + this.pieRadius + " " + this.pieRadius + " 0 " + arcOrientationCode + " 1 " + arcEndPoint.x + " " + arcEndPoint.y + 
						// close the path back to the begining (corner point)
						" Z";
			}
			else {
				endAngle = (2 * Math.PI - 0.0000001);
				arcEndPoint = {x: Math.sin(endAngle) * this.pieRadius, y: -Math.cos(endAngle) * this.pieRadius};

						// move (M) straight to the arc begin point point
				pathD =	"M" + arcBeginPoint.x + "," + arcBeginPoint.y + " " + 
						// draw the arc (A) to the arc end point
						"A " + this.pieRadius + " " + this.pieRadius + " 0 " + arcOrientationCode + " 1 " + arcEndPoint.x + " " + arcEndPoint.y +
						// close the path back to the begining (corner point)
						" Z";
			}
			
			const slicePathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
				slicePathElement.setAttribute("d", pathD);
				slicePathElement.setAttribute("fill", fillColor);
				slicePathElement.setAttribute("stroke", "white");
				slicePathElement.setAttribute("stroke-width", 1);

				const sliceTitleElement = document.createElement("title");
					sliceTitleElement.innerText = string + "(" + sliceSizePercentage + "%)";
				slicePathElement.appendChild(sliceTitleElement);
			groupElement.appendChild(slicePathElement);
			// ---

			// draw the slice's shadow (that is displayed when the slice is hovered)
			const shadowUpperLeftCorner = {x: 1.1 * Math.sin(beginAngle) * this.pieRadius, y: 1.1 * -Math.cos(beginAngle) * this.pieRadius};
			const shadowUpperRightCorner = {x: 1.1 * Math.sin(endAngle) * this.pieRadius, y: 1.1 * -Math.cos(endAngle) * this.pieRadius};

			let shadowPathD;

			if(sliceSizePercentage < 100) {
				shadowPathD =	"M" + arcBeginPoint.x + "," + arcBeginPoint.y + " " +
								"L" + shadowUpperLeftCorner.x + "," + shadowUpperLeftCorner.y + " " + 
								"A " + 1.1 * this.pieRadius + " " + 1.1 * this.pieRadius + " 0 " + arcOrientationCode + " 1 " + shadowUpperRightCorner.x + " " + shadowUpperRightCorner.y + 
								"L" + arcEndPoint.x + "," + arcEndPoint.y + " " + 
								"A " + this.pieRadius + " " + this.pieRadius + " 0 " + arcOrientationCode + " 0 " + arcBeginPoint.x + " " + arcBeginPoint.y + 
								// close the path back to the begining
								" Z";
			}
			else {
				shadowPathD =	"M" + arcBeginPoint.x + "," + arcBeginPoint.y + " " +
								"L" + shadowUpperLeftCorner.x + "," + shadowUpperLeftCorner.y + " " + 
								"A " + 1.1 * this.pieRadius + " " + 1.1 * this.pieRadius + " 0 " + arcOrientationCode + " 1 " + shadowUpperRightCorner.x + " " + shadowUpperRightCorner.y + 
								"L" + shadowUpperLeftCorner.x + "," + shadowUpperLeftCorner.y + " " +
								"L" + arcBeginPoint.x + "," + arcBeginPoint.y + " " + 
								"L" + arcEndPoint.x + "," + arcEndPoint.y + " " + 
								"A " + this.pieRadius + " " + this.pieRadius + " 0 " + arcOrientationCode + " 0 " + arcBeginPoint.x + " " + arcBeginPoint.y + 
								// close the path back to the begining
								" Z";
			}
			
			const sliceShadowPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
				sliceShadowPathElement.setAttribute("d", shadowPathD);
				sliceShadowPathElement.setAttribute("fill", fillColor);
				sliceShadowPathElement.setAttribute("stroke", "white");
				sliceShadowPathElement.setAttribute("stroke-width", Number(sliceSizePercentage < 100));
				sliceShadowPathElement.setAttribute("fill-opacity", 0.4);
				sliceShadowPathElement.setAttribute("visibility", "hidden");
			groupElement.appendChild(sliceShadowPathElement);
			// ---

			// display the percentage on the slice
			if(sliceSizePercentage >= 6) {
				const fontSize = this.pieRadius / 6;
				let labelX, labelY, textRotationAngleDeg;

				if(sliceSizePercentage < 100) {
					const middleAngle = beginAngle + ((endAngle - beginAngle) / 2);
					
					labelX = Math.sin(middleAngle) * (2/3) * this.pieRadius;
					labelY = -Math.cos(middleAngle) * (2/3) * this.pieRadius;

					let textRotationAngleRad = (middleAngle - Math.PI / 2);

					if(textRotationAngleRad > (Math.PI / 2))
						textRotationAngleRad -= Math.PI;

					textRotationAngleDeg = (textRotationAngleRad * 180 / Math.PI);
				}
				else {
					labelX = 0;
					labelY = 0;
					textRotationAngleDeg = 0;
				}

				const labelElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
					labelElement.setAttribute("fill", "white");
					labelElement.setAttribute("font-size", fontSize);
					labelElement.setAttribute("text-anchor", "middle");
					labelElement.setAttribute("x", labelX);
					labelElement.setAttribute("y", labelY);
					labelElement.setAttribute("dominant-baseline", "central");
					labelElement.setAttribute("transform", "rotate(" + textRotationAngleDeg + ", " + labelX + ", " + labelY + ")");
					labelElement.appendChild(document.createTextNode(Number.parseFloat(sliceSizePercentage).toFixed(1) + "%"));
				groupElement.appendChild(labelElement);
				// ---
			}

			groupElement.addEventListener("mouseover", this._onMouseOverPieSlice.bind(this));
			groupElement.addEventListener("mouseout", this._onMouseOutPieSlice.bind(this));
		this._pie.appendChild(groupElement);

		// add an item to the legend list
		const legendElement = document.createElement("li");
			legendElement.style.color = fillColor;

			const legendLabelElement = document.createElement("span");
				legendLabelElement.innerText = string;
			legendElement.append(legendLabelElement);

			legendElement.addEventListener("mouseover", this._onMouseOverLegendItem.bind(this));
			legendElement.addEventListener("mouseout", this._onMouseOutLegendItem.bind(this));
		this._legend.appendChild(legendElement);
		// ---
	}

	/**
	 * 
	 */
	_onMouseOverPieSlice(event) {
		const slice_group = event.target.closest("g");

		if(slice_group) {
			const node_index = Array.prototype.indexOf.call(this._pie.childNodes, slice_group);

			if(node_index != -1)
				this._highlightPieSlice(node_index);
		}
	}

	/**
	 * 
	 */
	_onMouseOutPieSlice(event) {
		this._unHighlightPieSlice();
	}

	/**
	 * 
	 */
	_onMouseOverLegendItem(event) {
		const list_item = event.target.closest("li");
		const node_index = Array.prototype.indexOf.call(this._legend.childNodes, list_item);

		if(node_index != -1)
			this._highlightPieSlice(node_index);
	}

	/**
	 * 
	 */
	 _onMouseOutLegendItem(event) {
		this._unHighlightPieSlice();
	}

	/**
	 * 
	 */
	_highlightPieSlice(slice_index) {
		const groupNode = this._pie.childNodes[slice_index];

		if(groupNode) {
			const slice = this.slices[slice_index];

			if(slice) {
				this._popupTitle.innerText = slice.getAttribute("string");

				if(slice.hasAttribute("number")) {
					const value = parseFloat(slice.getAttribute("number"));

					if(!isNaN(value) && (this.valuesSum > 0)) {
						const percentage = value / this.valuesSum * 100;
						this._popupContent.innerText = value + " (" + Number.parseFloat(percentage).toFixed(1) + "%)";
					}
					else
						this._popupContent.innerText = "";
				}

				const componentRect = this._container.getBoundingClientRect();
				const sliceRect = groupNode.getBoundingClientRect();
				const sliceCenterX = sliceRect.x + (sliceRect.width / 2) - componentRect.x;
				const sliceCenterY = sliceRect.y + (sliceRect.height / 2) - componentRect.y;

				this._popup.style.left = sliceCenterX + "px";
				this._popup.style.top = sliceCenterY + "px";

				if(this._popup.classList.contains("hidden"))
					this._popup.classList.remove("hidden");
			}

			const shadowNode = groupNode.childNodes[1];

			if(shadowNode)
				shadowNode.setAttribute("visibility", "visible");
		}
	}

	/**
	 * 
	 */
	_unHighlightPieSlice() {
		const visible_shadows = this._pie.querySelectorAll("path[visibility = visible]");

		for(let i = 0; i < visible_shadows.length; i++)
			visible_shadows[i].setAttribute("visibility", "hidden");

		if(!this._popup.classList.contains("hidden"))
			this._popup.classList.add("hidden");
	}

	/**
	 * 
	 */
	get width() {
		if(this.hasAttribute("width") && !isNaN(parseInt(this.getAttribute("width"), 10)))
			return parseInt(this.getAttribute("width"), 10);
		else
			return 150;
	}

	/**
	 * 
	 */
	get height() {
		if(this.getAttribute("height") && !isNaN(parseInt(this.getAttribute("width"), 10)))
			return parseInt(this.getAttribute("height"), 10);
		else
			return 150;
	}

	/**
	 * 
	 */
	get slices() {
		return this.querySelectorAll("ktbs4la2-pie-slice");
	}
}

customElements.define('ktbs4la2-pie-chart', KTBS4LA2PieChart);
