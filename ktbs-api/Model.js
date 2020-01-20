import {Resource} from "./Resource.js";

/**
 * Class for the "Model" resource type
 */
export class Model extends Resource {

	/**
	 * Gets the stylesheets for the Model
	 * @return Object[]
	 */
	get stylesheets() {
		let styleSheets = new Array();
		let graphs = this._JSONData["@graph"];

		if(graphs instanceof Object) {
			for(let i = 0; (i < graphs.length); i++) {
				let graph = graphs[i];

				if((graph["@type"]) && (graph["@type"] == "TraceModel") && (graph["http://www.example.com/TODO#ModelStylesheets"])) {
					let styleSheetsData = graph["http://www.example.com/TODO#ModelStylesheets"];
					
					if(styleSheetsData instanceof Array) {
						for(let i = 0; i < styleSheetsData.length; i++) {
							let aStyleSheetData = styleSheetsData[i];
							styleSheets.push(JSON.parse(aStyleSheetData));
						}
					}
					else {
						styleSheets.push(JSON.parse(styleSheetsData));
					}	
				}
			}
		}

		return styleSheets;
	}

	/**
	 * Gets the Obsel types defined in the Model
	 * @return Object[]
	 */
	get obsel_types() {
		let obsel_types = new Array();
		let graphs = this._JSONData["@graph"];

		if(graphs instanceof Array) {
			for(let i = 0; i < graphs.length; i++) {
				let aGraph = graphs[i];

				if(aGraph["@type"] == "ObselType")
					obsel_types.push(aGraph);
			}
		}

		return obsel_types;
	}
}
