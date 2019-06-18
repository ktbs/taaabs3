import {Resource} from "./Resource.js";

/**
 * 
 */
export class AttributeType extends Resource {

	/**
	 * @return Model
	 */
	get_model() {

	}

	/**
	 * @return [ObselType]
	 */
	list_obsel_types() {

	}

	/**
	 * 
	 */
	add_obsel_type(ot:ObselType) {

	}

	/**
	 * 
	 */
	remove_obsel_type(ot:ObselType) {

	}

	/**
	 * @return [uri]
	 */
	list_data_types() {

	}

	/**
	 * NB: if data_type represent a “list datatype”, value_is_list must not be true
	 * @param is_list – indicates whether the attribute accepts a single value (false, default) or a list of values (true)
	 */
	add_data_type(data_type:uri, is_list:bool?) {

	}

	/**
	 * 
	 */
	remove_data_type(data_type:uri) {

	}
}
