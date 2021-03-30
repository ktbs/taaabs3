import {AttributeType} from "./AttributeType.js";

/**
 * This class handles attributes of Obsels.
 */
export class Attribute {

    /**
     * Constructor
     * \param Obsel parentObsel the obsel the attribute belongs to
     * \param AttributeType attributeType the type of the attribute
     * \param string value the value for the attribute
     * \public
     */
    constructor(parentObsel, attributeType, value) {

        /**
         * The obsel the attribute belongs to
         * \var Obsel
         * \protected
         */
        this._parentObsel = parentObsel;

        /**
         * The attribute's type
         * \var AttributeType
         * \protected
         */
        this._type = attributeType;

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
        if(this._type)
            return this._type.id;
        else
            return undefined;
    }

    /**
     * Gets the attribute's type
     * \return AttributeType
     * \public
     */
    get type() {
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