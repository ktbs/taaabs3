import {Resource} from "./Resource.js";
import {ObselType} from "./ObselType.js";
import {AttributeType} from "./AttributeType.js";
import {ResourceProxy} from "./ResourceProxy.js";

/**
 * Class for the "Model" resource type
 */
export class Model extends Resource {

	/**
	 * Constructor
	 * @param URL or string uri the resource's URI
	 */
	constructor(uri) {
		super(uri);

		/**
		 * Obsel type instances of the the Model
		 * @type Array
		 */
		this._obselTypeInstances = new Array();

		/**
		 * Attribute type instances of the the Model
		 * @type Array
		 */
		this._attributeTypeInstances = new Array();

		/**
		 * 
		 * @type int
		 */
		this._model_own_graph_rank = null;

		/**
		 * 
		 * @type Object
		 */
		this._model_own_graph = null;
	}

	/**
	 * 
	 * @return int
	 */
	_get_model_own_graph_rank() {
		if(this._model_own_graph_rank == null) {
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Object) {
				for(let i = 0; (i < graphs.length); i++) {
					let aGraph = graphs[i];

					if((aGraph["@type"] == "TraceModel") && (aGraph["@id"] == this._uri)) {
						this._model_own_graph_rank = i;
						break;
					}
				}
			}
		}

		return this._model_own_graph_rank;
	}

	/**
	 * 
	 * @return Object
	 */
	_get_model_own_graph() {
		if(this._model_own_graph == null) {
			let modelOwnGraphRank = this._get_model_own_graph_rank();

			if(modelOwnGraphRank != null)
				this._model_own_graph = this._JSONData["@graph"][modelOwnGraphRank];
		}

		return this._model_own_graph;
	}

	/**
	 * Returns a user-friendly label
	 * @return string
	 */
	get label() {
		let modelOwnGraph = this._get_model_own_graph();

		if(modelOwnGraph) {
			if(modelOwnGraph["label"])
				return modelOwnGraph["label"];
			else
				return modelOwnGraph["http://www.w3.org/2000/01/rdf-schema#label"];
		}
		else
			return undefined;
	}

	/**
	 * Gets the "comment" of the resource
	 * @return string
	 */
	get comment() {
		let modelOwnGraph = this._get_model_own_graph();

		if(modelOwnGraph) {
			return modelOwnGraph["http://www.w3.org/2000/01/rdf-schema#comment"];
		}
		else
			return undefined;
	}

	/**
	 * Gets the parent resource of this resource.
	 * @return Resource the resource's parent resource if any, or undefined if the resource's parent is unknown (i.e. the resource hasn't been read or recorded yet), or null if the resource doesn't have any parent (i.e. Ktbs Root).
	 */
	get parent() {
		let modelOwnGraph = this._get_model_own_graph();

		if(modelOwnGraph) {
			if(modelOwnGraph["inBase"])
				return ResourceProxy.get_resource("Base", new URL(modelOwnGraph["inBase"], this.uri));
			else if(modelOwnGraph["inRoot"])
				return ResourceProxy.get_resource("Ktbs", new URL(modelOwnGraph["inRoot"], this.uri));
			else
				return undefined;
		}
		else
			return undefined;
	}

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
	 * Gets the obsel types defined in the Model
	 * @return ObselType[]
	 */
	get obsel_types() {
		let obsel_types = new Array();
		let graphs = this._JSONData["@graph"];

		if(graphs instanceof Array) {
			for(let i = 0; i < graphs.length; i++) {
				let aGraph = graphs[i];

				if(aGraph["@type"] == "ObselType") {
					let obsel_type_id = aGraph["@id"].substring(1);
					obsel_types.push(this.get_obsel_type(obsel_type_id));
				}
			}
		}

		return obsel_types;
	}

	/**
	 * Gets the obsel type with the given id from the current Model
	 * @param string obsel_type_id the id of the obsel type we are looking for
	 * @return ObselType or null if no obsel type with the given obsel_type_id has been found in the model
	 */
	get_obsel_type(obsel_type_id) {
		let obsel_type = null;

		if(this._obselTypeInstances[obsel_type_id])
			obsel_type = this._obselTypeInstances[obsel_type_id];
		else {
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Array) {
				for(let i = 0; i < graphs.length; i++) {
					let aGraph = graphs[i];

					if((aGraph["@type"] == "ObselType") && (aGraph["@id"] == ('#' + obsel_type_id))) {
						obsel_type = new ObselType(this, aGraph);
						this._obselTypeInstances[obsel_type_id] = obsel_type;
						break;
					}
				}
			}
		}

		return obsel_type;
	}

	/**
	 * Gets the attribute types defined in the Model
	 * @return AttributeType[]
	 */
	get attribute_types() {
		let obsel_types = new Array();
		let graphs = this._JSONData["@graph"];

		if(graphs instanceof Array) {
			for(let i = 0; i < graphs.length; i++) {
				let aGraph = graphs[i];

				if(aGraph["@type"] == "ObselType") {
					let obsel_type_id = aGraph["@id"].substring(1);
					obsel_types.push(this.get_obsel_type(obsel_type_id));
				}
			}
		}

		return obsel_types;
	}

	/**
	 * Gets the attribute type with the given id from the current Model
	 * @param string attribute_type_id the id of the attribute type we are looking for
	 * @return AttributeType or null if no attribute type with the given attribute_type_id has been found in the model
	 */
	get_attribute_type(attribute_type_id) {
		let attribute_type = null;

		if(this._attributeTypeInstances[attribute_type_id])
			attribute_type = this._attributeTypeInstances[attribute_type_id];
		else {
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Array) {
				for(let i = 0; i < graphs.length; i++) {
					let aGraph = graphs[i];

					if((aGraph["@type"] == "AttributeType") && (aGraph["@id"] == ('#' + attribute_type_id))) {
						attribute_type = new AttributeType(this, aGraph);
						this._attributeTypeInstances[attribute_type_id] = attribute_type;
						break;
					}
				}
			}
		}

		return attribute_type;
	}
}
