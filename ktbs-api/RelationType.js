import {Resource} from "./Resource.js";

/**
 * 
 */
export class RelationType extends Resource {

	/**
	 * @return Model
	 */
	get_model() {}

	/**
	 * List the supertypes of this relation type.
	 * @param include_indirect – defaults to false; if true, all supertypes are listed, including indirect supertypes and this relation type itself
	 * @return [RelationType]
	 */
	list_supertypes(include_indirect:bool?) {}

	/**
	 * 
	 */
	add_supertype(rt:RelationType) {}

	/**
	 * 
	 */
	remove_supertype(rt:RelationType) {}

	/**
	 * List the subtypes of this relation type from the same model.
	 * @param include_indirect – defaults to false; if true, all subtypes from the same model are listed, including indirect supertypes and this relation type itself
	 * @return [RelationType]
	 */
	list_subtypes(include_indirect:bool?) {}

	/**
	 * @return [ObselType]
	 */
	list_origins() {}

	/**
	 * 
	 */
	add_origin(ot:ObselType) {}

	/**
	 * 
	 */
	remove_origin(ot:ObselType) {}

	/**
	 * @return [ObselType]
	 */
	list_destinations() {}

	/**
	 * 
	 */
	add_destination(ot:ObselType) {}

	/**
	 * 
	 */
	remove_destination(ot:ObselType) {}
}
