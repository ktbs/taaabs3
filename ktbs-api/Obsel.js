import {ResourceMultiton} from "./ResourceMultiton.js";
import {Resource} from "./Resource.js";
import {AttributeType} from "./AttributeType.js";
import {Attribute} from "./Attribute.js";
import {Trace} from "./Trace.js";
import {ObselType} from "./ObselType.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for the "Obsel" resource-type
 */
export class Obsel extends Resource {

    /**
     * Gets the relative ID of the Obsel's type (relative to the Model the ObselType is described in)
     * \return string
     * \public
     */
    get type_id() {
        if(!this._type_id) {
            // @TODO : handle the case when the Obsel has several types
            let type_link = (this._JSONData["@type"] instanceof Array)?this._JSONData["@type"][0]:this._JSONData["@type"];
            let type_uri = this.resolve_link_uri(type_link);

            if(type_uri.hash && type_uri.hash.startsWith('#'))
                this._type_id = decodeURIComponent(type_uri.hash.substring(1));
            else
                this._type_id = decodeURIComponent(this._JSONData["@type"]);
        }

        return this._type_id;
    }

    /**
     * Sets the relative ID of the Obsel's type (relative to the Model the ObselType is described in)
     * \param string newTypeId - the new relative ID for the Obsel's type
     * \public
     */
    set type_id(newTypeId) {
        this._JSONData["@type"] = newTypeId;
        this._type_id = null;
        this._type = null;
    }

    /**
     * Gets the Obsel's type
     * \return ObselType
     * \public
     */
    get type() {
        if(!this._type && this.parent && this.parent.model)
            this._type = this.parent.model.get_obsel_type(this.type_id);

        return this._type;
    }

    /**
     * Sets the Obsel's type
     * \param ObselType newType - the new type for the obsel
     * \throws TypeError throws a TypeError if the provided argument is not an ObselType
     * \public
     */
    set type(newType) {
        if(newType instanceof ObselType) {
            this._JSONData["@type"] = "m:" + newType.id;
            this._type_id = newType.id;
            this._type = newType;
        }
        else
            throw new TypeError("New value for property \"type\" mus be an instance of ObselType");
    }

    /**
	 * Gets the parent Trace of this Obsel, or undefined if the Obsel's Trace is unknown (i.e. the Obsel hasn't been read or recorded yet).
	 * \return Trace
     * \public
	 */
	get parent() {
        if(!this._parent && this._JSONData.hasTrace)
            this._parent = ResourceMultiton.get_resource(Trace, this.resolve_link_uri(this._JSONData.hasTrace));
            
        return this._parent;
    }

    /**
     * Sets the parent trace of the Obsel
     * \param Trace new_parent - the new parent Trace for the Obsel
     * \throws TypeError throws a TypeError if the provided argument is not a Trace
     * \public
     */
    set parent(new_parent) {
        if(new_parent instanceof Trace)
            this._parent = new_parent;
        else
            throw new TypeError("Obsel's parent must be of type Trace");
    }
    
    /**
     * Gets the begin timestamp of the obsel
     * \return int
     * \public
     */
    get begin() {
        if((this._begin == undefined) && (this._JSONData.begin != undefined))
            this._begin = parseInt(this._JSONData.begin, 10);

        return this._begin;
    }

    /**
     * Gets the begin Date of the obsel
     * \return Date
     * \public
     */
    get beginDT() {
        if(!this._beginDT && this._JSONData.beginDT)
            this._beginDT = new Date(this._JSONData.beginDT);
        
        return this._beginDT;
    }

    /**
     * Gets the end timestamp of the obsel
     * \return int
     * \public
     */
    get end() {
        if((this._end == undefined) && (this._JSONData.end != undefined))
            this._end = parseInt(this._JSONData.end, 10);
        
        return this._end;
    }

    /**
     * Gets the end Date of the obsel
     * \return Date
     * \public
     */
    get endDT() {
        if(!this._endDT && this._JSONData.endDT)
            this._endDT = new Date(this._JSONData.endDT);
        
        return this._endDT;
    }

    /**
     * Gets the subject of the obsel
     * \return string
     * \public
     */
    get subject() {
        return this._JSONData.subject;
    }

    /**
     * Gets the source obsels of the current obsel (when it belongs to a computed trace)
     * \return Array of Obsel
     * \public
     */
    get sourceObsels() {
        if(!this._sourceObsels && this._JSONData.hasSourceObsel) {
            this._sourceObsels = new Array();
            let source_obsels_links = this._JSONData.hasSourceObsel;
            
            for(let i = 0; i < source_obsels_links.length; i++) {
                let a_source_obsel_link = source_obsels_links[i];
                let aSourceObsel = ResourceMultiton.get_resource(Obsel, this.resolve_link_uri(a_source_obsel_link));
                this._sourceObsels.push(aSourceObsel);
            }
        }
        
        return this._sourceObsels;
    }

    /**
     * Gets the attributes of the Obsel, including builtin attributes (except @id, which is accessible through Obsel's property "id")
     * \return Array of Attribute
     * \public
     */
    get attributes() {
        if(!this._attributes) {
            this._attributes = new Array();

            for(let attribute_type_link in this._JSONData) {
                if(!AttributeType.system_types_ids.includes(attribute_type_link)) {
                    let attributeType;

                    if(AttributeType.builtin_attribute_types_ids.includes(attribute_type_link))
                        attributeType = AttributeType.get_builtin_attribute_type(attribute_type_link);
                    else {
                        const attributeType_uri = this.resolve_link_uri(attribute_type_link);
                        const attributeType_id = attributeType_uri.hash.substring(1);
                        attributeType = this.parent.model.get_attribute_type(attributeType_id);
                    }

                    let attribute_value = this._JSONData[attribute_type_link];
                    let attribute = new Attribute(this, attributeType, attribute_value);
                    this._attributes.push(attribute);
                }
            }
        }

        return this._attributes;
    }

    /**
     * Gets the non-builtin attributes of the Obsel
     * \return Array of Attribute
     * \public
     */
    get non_builtin_attributes() {
        if(!this._attributes) {
            this._attributes = new Array();

            for(let attribute_type_link in this._JSONData) {
                if((!AttributeType.system_types_ids.includes(attribute_type_link)) && (!AttributeType.builtin_attribute_types_ids.includes(attribute_type_link))) {
                    const attributeType_uri = this.resolve_link_uri(attribute_type_link);
                    const attributeType_id = attributeType_uri.hash.substring(1);
                    const attributeType = this.parent.model.get_attribute_type(attributeType_id);
                    let attribute_value = this._JSONData[attribute_type_link];
                    let attribute = new Attribute(this, attributeType, attribute_value);
                    this._attributes.push(attribute);
                }
            }
        }

        return this._attributes;
    }

    /**
     * Sets the non-system attributes of the Obsel
     * \param Array of Attributes - newAttribute the new non-system attributes for the Obsel
     * \throws KtbsError throws a KtbsError if at least one of the new attributes is a reserved system attribute (ex: @context, @type, hasSourceObsel, hasTrace etc...)
     * \public
     */
    set attributes(newAttributes) {
        // first, we check validity of new attributes
        for(let i = 0; i < newAttributes.length; i++) {
            let new_attribute = newAttributes[i];

            if(AttributeType.system_types_ids.includes(new_attribute.type_id))
                throw new KtbsError("Attribute type \"" + new_attribute.type_id + "\" illegal (reserved system id)");
        }
        
        // then, we remove previous non-system attributes
        for(let previous_attribute_type_id in this._JSONData)
            if(!AttributeType.system_types_ids.includes(previous_attribute_type_id))
                delete this._JSONData[previous_attribute_type_id];

        // finally, we add the new attributes
        for(let i = 0; i < newAttributes.length; i++) {
            let new_attribute = newAttributes[i];
            this._JSONData[new_attribute.type.id] = new_attribute.value;
        }

        this._attributes = null;
    }

    /**
     * Adds an attribute to the the Obsel
     * \param AttributeType attributeType - the type for the new attribute
     * \param * value - the value for the new attribute
     * \throws TypeError throws a TypeError if the first provided argument is not an AttributeType
     * \public
     */
    add_attribute(attributeType, value) {
        if(attributeType instanceof AttributeType) {
            let attribute = new Attribute(this, attributeType, value);
            this.attributes.push(attribute);

            if(attributeType.is_builtin)
                this._JSONData[attributeType.id] = value;
            else
                this._JSONData["m:" + attributeType.id] = value;
        }
        else
            throw new TypeError("First argument for Obsel::add_attribute() must be of type AttributeType");
    }

    /**
	 * Stores a new resource as a child of the current resource
	 * \throws KtbsError always throws a KtbsError when invoked for a Obsel as it is not a container resource
     * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Only Ktbs roots, Bases and Traces can contain child resources");
    }
    
    /**
	 * Resets the calculated data temporarily stored in memory as instance variables. Descendant classes that add such variables should override this method, reset their own-level variables and then call super._resetCalculatedData()
	 * \public
	 */
	_resetCalculatedData() {
		if(this._type_id)
			delete this._type_id;

		if(this._type)
            this._type = undefined;

		if(this._parent)
            this._parent = undefined;

		if(this._beginDT)
            delete this._beginDT;
            
        if(this._endDT)
            delete this._endDT;

        if(this._sourceObsels)
            delete this._sourceObsels;

        if(this._attributes)
            delete this._attributes;
            
        super._resetCalculatedData();
    }
}