import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2PieChart extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, false, false);

		this._GoogleApiReady = new Promise((resolve, reject) => {
			this.loadHeadScriptElement("https://www.gstatic.com/charts/loader.js").then(() => {
				// Load the Visualization API and the corechart package.
				google.charts.load('current', {'packages':['corechart']});

				// Set a callback to run when the Google Visualization API is loaded.
				google.charts.setOnLoadCallback(resolve);
			});
		});

		this._slicesNodesObserver = new MutationObserver(this._updatePie.bind(this));
		this._slicesNodesObserver.observe(this, {childList: true, subtree: true, attributes: true, attributeFilter: ["string", "number"]});
		
		this._chartOptions = {'title': "",
								'width': 400,
								'height': 300};

		this._stringLabel = "String";
		this._numberLabel = "Number";
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push('title');
		observedAttributes.push('width');
		observedAttributes.push('height');
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "title")
			this._chartOptions.title = newValue;
		else if (attributeName == "width") {
			this._chartOptions.width = parseInt(newValue);
			this._updatePie();
		}
		else if (attributeName == "height") {
			this._chartOptions.height = parseInt(newValue);
			this._updatePie();
		}
	}

	/**
	 * Looks for a script tag pointing to the url passed as "src" in the document header, and creates it if it doesn't exists yet.
	 * @param src the URL of the script
	 * @returns a Promise
	 */
	loadHeadScriptElement(src) {
		return new Promise((resolve, reject) => {
			let existingScriptTag = document.head.querySelector("script[src=\"" + src + "\"]");

			if(existingScriptTag)
				resolve();
			else {
				let newScriptTag = document.createElement("script");
				newScriptTag.src = src;
				document.head.appendChild(newScriptTag);
				newScriptTag.addEventListener("load", resolve);
			}
		});
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._chartDiv = this.shadowRoot.querySelector("#chart");

		this._GoogleApiReady.then(() => {
			this._updatePie();
		});
	}

	/**
	 * 
	 */
	_updatePie() {
		this._GoogleApiReady.then(() => {
			// Create the data table.
			let chartData = new google.visualization.DataTable();
			chartData.addColumn("string");
			chartData.addColumn("number");

			let pieSlices = this.querySelectorAll("ktbs4la2-pie-slice[string][number]");

			for(let j = 0; j < pieSlices.length; j++) {
				let aSlice = pieSlices[j];
				chartData.addRow([aSlice.getAttribute("string"), parseFloat(aSlice.getAttribute("number"))]);
			}

			this._componentReady.then(() => {
				const chart = new google.visualization.PieChart(this._chartDiv);
				chart.draw(chartData, this._chartOptions);
				//this._chart.draw(chartData, this._chartOptions);
			});
		});
	}
}

customElements.define('ktbs4la2-pie-chart', KTBS4LA2PieChart);
