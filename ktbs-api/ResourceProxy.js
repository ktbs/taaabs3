import {Ktbs} from "./Ktbs.js";
import {Base} from "./Base.js";
import {Method} from "./Method.js";
import {Model} from "./Model.js";
import {StoredTrace} from "./StoredTrace.js";
import {ComputedTrace} from "./ComputedTrace.js";

/**
 * This static class allows to share ktbs Resource instances in order to avoid instanciating duplicates of the same resource.
 * @static
 */
export class ResourceProxy {

    /**
     * Gets a ktbs resource instance from it's type and uri.
     * @param class or String resource_type the type for the desired ktbs resource instance
     * @param URL or string uri
     * @static
     * @return Resource
     */
    static get_resource(resource_type, uri) {
        let uri_string = (uri instanceof URL)?uri.toString():uri;
        let type_class, type_string;

        if((typeof resource_type === 'function') && (/^\s*class\s+/.test(resource_type.toString()))) {
            type_class = resource_type;
            type_string = resource_type.name;
        }
        else {
            type_string = resource_type.toString();
            type_class = this.get_resource_class(type_string);
        }

        if(ResourceProxy._resources[type_string] && ResourceProxy._resources[type_string][uri_string])
            return ResourceProxy._resources[type_string][uri_string];
        else {
            let newInstance = new (type_class)(uri);

            if(!ResourceProxy._resources[type_string])
                ResourceProxy._resources[type_string] = new Array();

            ResourceProxy._resources[type_string][uri_string] = newInstance;
            return newInstance;
        }
    }

    /**
     * Gets the Javascript class for a resource type from it's class name
     * @param string class_name the name of the class
     * @return class
     * @static
     */
    static get_resource_class(class_name) {
        if(class_name.match(/^[a-zA-Z0-9_]+$/)) {
            try {
                let JSClass = eval(class_name);

                if(JSClass && (typeof JSClass === 'function') && (/^\s*class\s+/.test(JSClass.toString())))
                    return JSClass;
                else
                    throw new Error("\"" + class_name + "\" is not a class name.");
            }
            catch(error) {
                throw new Error("Unknown class \"" + class_name + "\"");
            }
        }
        else
            throw new Error("Invalid class name \"" + class_name + "\"");
    }
}

/**
 * Stores already instanciated resources for further use.
 * @static
 * @type Array
 */
ResourceProxy._resources = new Array();