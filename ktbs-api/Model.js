import {Resource} from "./Resource.js";

/**
 * 
 */
export class Model extends Resource {

	/**
	 * Return the URI of this resource relative to its “containing” resource; basically, this is short ‘id’ that could have been used to create this resource in the corresponding ‘create_X’ method
	 * @return	str
	 */
	get_id() {
		let graphs = this._parsedJson["@graph"];

		if(graphs instanceof Array) {
			let modelGraph = null;

			for(let i = 0; (modelGraph == null) && (i < graphs.length); i++) {
				let graph = graphs[i];

				if((graph["@type"]) && (graph["@type"] == "TraceModel"))
					modelGraph = graph;
			}

			if(modelGraph != null) {
				if(modelGraph["@id"])
					return modelGraph["@id"];
				else
					throw new Error("Could not find @id in TraceModel type graph in Model");
			}
			else
				throw new Error("Could not find a TraceModel type graph in Model");
		}
		else
			throw new Error("Could not find @graph in Model");
	}

	/**
	 * 
	 */
	get_stylesheets() {
		let styleSheets = new Array();
		let graphs = this._parsedJson["@graph"];

		if(graphs instanceof Array) {
			for(let i = 0; (i < graphs.length); i++) {
				let graph = graphs[i];

				if((graph["@type"]) && (graph["@type"] == "TraceModel") && (graph["http://www.example.com/TODO#ModelStylesheets"])) {
					let styleSheetsData = graph["http://www.example.com/TODO#ModelStylesheets"];

					for(let j = 0; j < styleSheetsData.length; j++) {
						let aStyleSheetData = styleSheetsData[j];
						let parsedStyleSheet = JSON.parse(aStyleSheetData);
						styleSheets.push(parsedStyleSheet);
					}
				}
			}
		}
		return styleSheets;
	}

	/**
	 * @return Base
	 */
	/*get_base() {

	}*/

	/**
	 * @TODO find stable reference to unit names
	 * @return str
	 */
	/*get_unit() {

	}*/

	/**
	 * @param string unit
	 */
	/*set_unit(unit) {

	}*/

	/**
	 * Return the element of this model identified by the URI, or null.
	 * @param string id
	 * @return ObselType | AttributeType | RelationType
	 */
	/*get(id) {

	}*/

	/**
	 * List parent models. Note that some of these models may not belong to the same KTBS, and may be readonly —see get_readonly.
	 * @param bool include_indirect – defaults to false and means that parent’s parents should be returned as well.
	 * @return [Model]
	 */
	/*list_parents(include_indirect = false) {

	}*/

	/**
	 * @param bool include_inherited – defaults to true and means that attributes types from inherited models should be included
	 * @return [AttributeType]
	 */
	/*list_attribute_types(include_inherited = true) {

	}*/

	/**
	 * @param bool include_inherited – defaults to true and means that relation types from inherited models should be included
	 * @return [RelationType]
	 */
	/*list_relation_types(include_inherited = true) {

	}*/

	/**
	 * @param bool include_inherited – defaults to true and means that obsel types from inherited models should be included
	 * @return [ObselType]
	 */
	list_obsel_types(include_inherited = true) {
		let obsel_types = new Array();
		let graphs = this._parsedJson["@graph"];

		if(graphs instanceof Array) {
			for(let i = 0; i < graphs.length; i++) {
				let aGraph = graphs[i];

				if(aGraph["@type"] == "ObselType")
					obsel_types.push(aGraph);
			}
		}

		return obsel_types;
	}

	/**
	 * @param Model m
	 */
	/*add_parent(m) {

	}*/

	/**
	 * @param Model m
	 */
	/*remove_parent(m) {

	}*/

	/**
	 * NB: if id is not provided, label is used to mint a human-friendly URI
	 * @param string id
	 * @param ObselType supertypes
	 * @param string label
	 * @return ObselType
	 */
	/*create_obsel_type(id = null, supertypes = Array(), label) {

	}*/

	/**
	 * NB: if data_type represent a “list datatype”, value_is_list must not be true NB: if id is not provided, label is used to mint a human-friendly URI 
	 * @TODO specify a minimum list of datatypes that must be supported 
	 * @TODO define a URI for representing “list of X” for each supported datatype?
	 * @param string id
	 * @param ObselType[] obsel_types
	 * @param string[] data_type – uri is an XML-Schema datatype URI.
	 * @param bool value_is_list – indicates whether the attributes accepts a single value (false, default) or a list of values (true)
	 * @param string label
	 * @return AttributeType
	 */
	/*create_attribute_type(id = null, obsel_types = Array(), data_types = Array(), value_is_list = false, label) {

	}*/

	/**
	 * NB: if id is not provided, label is used to mint a human-friendly URI
	 * @param string id
	 * @param ObselType[] origins
	 * @param ObselType[] destinations
	 * @param RelationType[] supertypes
	 * @param string label
	 * @return RelationType
	 */
	/*create_relation_type(id, origins = Array(), destinations = Array(), supertypes = Array(), label) {

	}*/
}
