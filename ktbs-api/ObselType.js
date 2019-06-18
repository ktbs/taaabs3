import {Resource} from "./Resource.js";

/**
 * 
 */
export class ObselType extends Resource {

	/**
	 * @return Model
	 */
	get_model() {}

	/**
	 * List the supertypes of this obsel type.
	 * @param include_indirect – defaults to false; if true, all supertypes are listed, including indirect supertypes and this obsel type itself
	 * @return [ObselType]
	 */
	list_supertypes(include_indirect:bool?) {}

	/**
	 * 
	 */
	add_supertype(ot:ObselType) {}

	/**
	 * 
	 */
	remove_supertype(ot:ObselType) {}

	/**
	 * List the subtypes of this obsel type from the same model.
	 * @param include_indirect – defaults to false; if true, all subtypes from the same model are listed, including indirect supertypes and this obsel type itself
	 * @return [ObselType]
	 */
	list_subtypes(include_indirect:bool?) {}

	/**
	 * List the attribute types of this obsel type (direct or inherited).
	 * @param include_inherited – defaults to true and means that attributes types inherited from supertypes should be included
	 * @return [AttributeType]
	 */
	list_attribute_types(include_inherited:bool?) {}

	/**
	 * List the outgoing relation types of this obsel type (direct or inherited).
	 * include_inherited – defaults to true and means that relation types inherited from supertypes should be included
	 * @return [RelationType]
	 */
	list_relation_types(include_inherited:bool?) {}

	/**
	 * List the inverse relation types of this obsel type (direct or inherited).
	 * @param include_inherited – defaults to true and means that inverse relation types inherited from supertypes should be included
	 * @return [RelationType]
	 */
	list_inverse_relation_types(include_inherited:bool?) {}

	/**
	 * Shortcut to get_model().create_attribute_type where this ObselType is the obsel type.
	 * @return AttributeType
	 */
	create_attribute_type(id:uri?, data_types:[uri]?, value_is_list:book?, label:str) {}

	/**
	 * Shortcut to get_model().create_relation_type where this ObselType is the origin.
	 * @return RelationType
	 */
	create_relation_type(id:uri?, destinations:[ObselType]?, supertypes:[RelationType]?, label:str) {}
}
