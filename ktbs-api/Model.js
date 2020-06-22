import {Resource} from "./Resource.js";
import {Base} from "./Base.js";
import {ObselType} from "./ObselType.js";
import {AttributeType} from "./AttributeType.js";
import {ResourceProxy} from "./ResourceProxy.js";
import {Stylesheet} from "./Stylesheet.js";
import {KtbsError} from "./Errors.js";

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
		this._JSONData["@graph"] = [{"@type": "TraceModel"}];

		/**
		 * Obsel type instances of the the Model
		 * @type Array
		 */
		this._obsel_types = null;

		/**
		 * Attribute type instances of the the Model
		 * @type Array
		 */
		this._attribute_types = null;

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
	 * Gets the rank of the data graph in which are described general information for the Model itself (as the resource may contain other data graphes describing ObselTypes and AttributeTypes)
	 * @return int
	 */
	_get_model_own_graph_rank() {
		if(this._model_own_graph_rank == null) {
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Object) {
				for(let i = 0; (i < graphs.length); i++) {
					let aGraph = graphs[i];

					if(aGraph["@type"] == "TraceModel") {
						this._model_own_graph_rank = i;
						break;
					}
				}
			}
		}

		return this._model_own_graph_rank;
	}

	/**
	 * Gets the data graph in which are described general information for the Model itself (as the resource may contain other data graphes describing ObselTypes and AttributeTypes)
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
	 * Gets the data to be send in a POST query
	 * @returns Object
	 */
	_getPostData() {
		let postData = {"@graph" : [this._get_model_own_graph()]};

		for(let i = 0; i <  this.obsel_types.length; i++) {
			if(!(this.obsel_types[i].parent_model))
				this.obsel_types[i].parent_model = this;

			for(let j = 0; j < this.obsel_types[i].attribute_types.length; j++) {
				if(!(this.obsel_types[i].attribute_types[j].parent_model))
					this.obsel_types[i].attribute_types[j].parent_model = this;

				if(!(this.obsel_types[i].attribute_types[j].obsel_types.includes(this.obsel_types[i])))
					this.obsel_types[i].attribute_types[j].obsel_types.push(this.obsel_types[i]);

				if(!(this.attribute_types.includes(this.obsel_types[i].attribute_types[j])))
					this.attribute_types.push(this.obsel_types[i].attribute_types[j]);
			}

			postData["@graph"].push(this.obsel_types[i]._getPostData());
		}
	
		for(let i = 0; i < this.attribute_types.length; i++) {
			if(!(this.attribute_types[i].parent_model))
				this.attribute_types[i].parent_model = this;

			postData["@graph"].push(this.attribute_types[i]._getPostData());
		}

		return postData;
	}

	/**
	 * Gets the ID of this resource, relative to its parent resource URI.
	 * @return string
	 */
	get id() {
		let ownGraph = this._get_model_own_graph();

		if(ownGraph["@id"])
			return ownGraph["@id"];
		else if(this._uri)
			return Resource.extract_relative_id(this._uri.toString());
		else
			return undefined;
	}

	/**
	 * Sets the ID of this resource, relative to its parent resource URI.
	 * @param string id the new ID for the resource.
	 * @throws Error Throws an Error if we try to set the ID of a resource that already exists on a kTBS service.
	 */
	set id(id) {
		if(this.syncStatus == "needs_sync")
			this._JSONData["@graph"][this._get_model_own_graph_rank()]["@id"] = id;
		else
			throw new KtbsError("Resource's ID can not be changed anymore");
	}

	/**
	 * Returns a user-friendly label
	 * @return string
	 */
	get label() {
		if(!this._label) {
			let modelOwnGraph = this._get_model_own_graph();

			if(modelOwnGraph) {
				if(modelOwnGraph["label"])
					this._label = modelOwnGraph["label"];
				else
					this._label = modelOwnGraph["http://www.w3.org/2000/01/rdf-schema#label"];
			}
		}
		
		return this._label;
	}

	/**
	 * Set a user-friendly label.
	 * @param string new_label The new label for the Model
	 */
	set label(new_label) {
		let modelOwnGraphRank = this._get_model_own_graph_rank();
		this._JSONData["@graph"][modelOwnGraphRank]["label"] = new_label;
		this._label = new_label;
	}

	/**
	 * Gets the "comment" of the resource
	 * @return string
	 */
	get comment() {
		if(!this._comment) {
			let modelOwnGraph = this._get_model_own_graph();

			if(modelOwnGraph)
				this._comment = modelOwnGraph["http://www.w3.org/2000/01/rdf-schema#comment"];
		}

		return this._comment;
	}

	/**
	 * Set the "comment" for the resource
	 * @param string new_comment The new comment for the Model
	 */
	set comment(new_comment) {
		let modelOwnGraphRank = this._get_model_own_graph_rank();
		this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#comment"] = new_comment;
		this._label = new_comment;
	}

	/**
	 * Gets the parent resource of this resource.
	 * @return Resource the resource's parent resource if any, or undefined if the resource's parent is unknown (i.e. the resource hasn't been read or recorded yet), or null if the resource doesn't have any parent (i.e. Ktbs Root).
	 */
	get parent() {
		if(!this._parent) {
			let modelOwnGraph = this._get_model_own_graph();

			if(modelOwnGraph && modelOwnGraph.inBase)
				this._parent = ResourceProxy.get_resource(Base, this.resolve_link_uri(modelOwnGraph.inBase));
		}

		return this._parent;
	}

	/**
	 * Gets the obsel types defined in the Model
	 * @return ObselType[]
	 */
	get obsel_types() {
		if(!this._obsel_types) {
			this._obsel_types = new Array();
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Array) {
				for(let i = 0; i < graphs.length; i++) {
					let aGraph = graphs[i];

					if(aGraph["@type"] == "ObselType") {
						let obsel_type = new ObselType(this, aGraph);
						this._obsel_types.push(obsel_type);
					}
				}
			}
		}

		return this._obsel_types;
	}

	/**
	 * 
	 */
	set obsel_types(new_obsel_types) {
		if(new_obsel_types instanceof Array) {
			for(let i = 0; i < new_obsel_types.length; i++)
				if(!(new_obsel_types[i] instanceof ObselType))
					throw new TypeError("New value for obsel_types property must be an array of ObselType");

			for(let i = 0; i < new_obsel_types.length; i++)
				if(new_obsel_types[i].parent_model && (new_obsel_types[i].parent_model != this))
					throw new KtbsError("Cannot associate an ObselType to a different Model once it has been set");

			for(let i = 0; i < new_obsel_types.length; i++)
				if(!new_obsel_types[i].parent_model)
					new_obsel_types[i].parent_model = this;

			this._obsel_types = new_obsel_types;
		}
		else
			throw new TypeError("New value for obsel_types property must be an array of ObselType");
	}

	/**
	 * Gets the obsel type with the given id from the current Model
	 * @param string obsel_type_id the id of the obsel type we are looking for
	 * @return ObselType or null if no obsel type with the given obsel_type_id has been found in the model
	 */
	get_obsel_type(obsel_type_id) {
		let obsel_types = this.obsel_types;

		for(let i = 0; i < obsel_types.length; i++) {
			let obsel_type = obsel_types[i];

			if(obsel_type.id == obsel_type_id)
				return obsel_type;
		}

		return undefined;
	}

	/**
	 * Gets the attribute types defined in the Model
	 * @return AttributeType[]
	 */
	get attribute_types() {
		if(!this._attribute_types) {
			this._attribute_types = new Array();
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Array) {
				for(let i = 0; i < graphs.length; i++) {
					let aGraph = graphs[i];

					if(aGraph["@type"] == "AttributeType") {
						let attribute_type = new AttributeType(this, aGraph);
						this._attribute_types.push(attribute_type);
					}
				}
			}
		}

		return this._attribute_types;
	}

	/**
	 * 
	 */
	set attribute_types(new_attribute_types) {
		if(new_attribute_types instanceof Array){
			for(let i = 0; i < new_attribute_types.length; i++)
				if(!(new_attribute_types[i] instanceof AttributeType))
					throw new TypeError("New value for attribute_types property must be an array of AttributeType");

			for(let i = 0; i < new_attribute_types.length; i++)
				if(new_attribute_types[i].parent_model && (new_attribute_types[i].parent_model != this))
					throw new KtbsError("Cannot associate an AttributeType to a different Model once it has been set");

			for(let i = 0; i < new_attribute_types.length; i++)
				if(!new_attribute_types[i].parent_model)
					new_attribute_types[i].parent_model = this;

			this._attribute_types = new_attribute_types;
		}
		else
			throw new TypeError("New value for attribute_types property must be an array of AttributeType");
	}

	/**
	 * Gets the attribute type with the given id from the current Model
	 * @param string attribute_type_id the id of the attribute type we are looking for
	 * @return AttributeType or null if no attribute type with the given attribute_type_id has been found in the model
	 */
	get_attribute_type(attribute_type_id) {
		let attribute_types = this.attribute_types;

		for(let i = 0; i < attribute_types.length; i++) {
			let attribute_type = attribute_types[i];

			if(attribute_type.id == attribute_type_id)
				return attribute_type;
		}

		return undefined;
	}

	/**
	 * Gets the user stylesheets defined in the Model
	 * @return Array
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
							styleSheets.push(new Stylesheet(this, JSON.parse(aStyleSheetData)));
						}
					}
					else {
						styleSheets.push(new Stylesheet(this, JSON.parse(styleSheetsData)));
					}
				}
			}
		}

		return styleSheets;
	}

	/**
	 * Stores a new resource as a child of the current resource
	 * @throws KtbsError always throws a KtbsError when invoked for a Model as it is not a container resource
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Only Ktbs roots, Bases and Traces can contain child resources");
	}
}
