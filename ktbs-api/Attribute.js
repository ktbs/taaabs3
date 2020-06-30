/**
 * This class handles attributes of Obsels.
 */
export class Attribute {

    /**
     * Constructor
     * \param Obsel parentObsel - the obsel the attribute belongs to
     * \param string type_link - a link to the AttributeType (may be a relative link from the parent Obsel)
     * \param string value - the value for the attribute
     * \public
     */
    constructor(parentObsel, type_link, value) {

        /**
         * The obsel the attribute belongs to
         * \var Obsel
         * \protected
         */
        this._parentObsel = parentObsel;

        /**
         * A link to the AttributeType (may be a relative link from the parent Obsel)
         * \var string
         * \protected
         */
        this._type_link = type_link;

        /**
         * The value for the attribute
         * \var string
         * \protected
         */
        this._value = value;
    }

    /**
     * Gets the AttributeType's ID
     * \return string
     * \public
     */
    get type_id() {
        if(!this._type_id) {
            let type_uri = this._parentObsel.uri?this._parentObsel.resolve_link_uri(this._type_link):this._type_link;

            if(type_uri.hash)
                this._type_id = decodeURIComponent(type_uri.hash.substring(1));
            else
                this._type_id = decodeURIComponent(this._type_link);
        }

        return this._type_id;
    }

    /**
     * Gets the attribute's type
     * \return AttributeType
     * \public
     */
    get type() {
        if(!this._type && this._parentObsel.parent && this._parentObsel.parent.model)
            this._type = this._parentObsel.parent.model.get_attribute_type(this.type_id);
        
        return this._type;
    }

    /**
     * Gets the attribute value
     * \return string
     * \public
     */
    get value() {
        return this._value;
    }
}