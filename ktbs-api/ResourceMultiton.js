import {Resource} from "./Resource.js";
import {Ktbs} from "./Ktbs.js";
import {Model} from "./Model.js";
import {Base} from "./Base.js";
import {ComputedTrace, StoredTrace} from "./Trace.js";
import {Method} from "./Method.js";

/**
 * This static class allows to share ktbs Resource instances in order to avoid instanciating duplicates of the same resource.
 * \static
 */
export class ResourceMultiton {

    /**
     * Checks if there is an already instanciated ktbs resource for a type and uri.
     * \param class or String resource_type - the type for the desired ktbs resource instance
     * \param URL or string uri - The URI for the desired resource
     * \static
     * \return Boolean
     * \public
     */
    static has_resource(uri) {
        let uri_string = (uri instanceof URL)?uri.toString():uri;
        return (uri_string in ResourceMultiton._resources);
    }

    /**
     * 
     * \param Resource resource
     * \public
     */
    static register_resource(resource) {
        if(resource instanceof Resource) {
            ResourceMultiton._resources[resource.uri.toString()] = resource;
            resource.registerObserver(ResourceMultiton.onDeleteResource, "lifecycle-status-change", "deleted");
        }
        else
            throw new TypeError("Not a Ktbs Resource instance");
    }

    /**
     * Gets a ktbs resource instance from it's type and uri.
     * \param class or String resource_type - the type for the desired ktbs resource instance
     * \param URL or string uri - The URI for the desired resource
     * \static
     * \return Resource
     * \public
     */
    static get_resource(resource_type, uri) {
        let uri_string = (uri instanceof URL)?uri.toString():uri;

        if(!ResourceMultiton.has_resource(uri_string)) {
            let type_class;

            if((typeof resource_type === 'function') && (/^\s*class\s+/.test(resource_type.toString()))) {
                type_class = resource_type;
            }
            else if (typeof resource_type === 'string') {
                type_class = {
                    'Base': Base,
                    'ComputedTrace': ComputedTrace,
                    'KtbsRoot': Ktbs,
                    'Method': Method,
                    'Model': Model,
                    'StoredTrace': StoredTrace,
                    'TraceModel': Model,
                }[resource_type];
            }
            if (type_class === undefined) {
                throw new TypeError(resource_type + " is not a valid type");
            }
            let newInstance = new (type_class)(uri);
            ResourceMultiton.register_resource(newInstance);
        }

        return ResourceMultiton._resources[uri_string];
    }

    /**
     * Callback function triggered when a resource from the Multiton is deleted
     * \static
     * \public
     */
    static onDeleteResource(sender_resource) {
        // we stop observing it
        sender_resource.unregisterObserver(ResourceMultiton.onDeleteResource, "lifecycle-status-change", "deleted");
        
        // then we update the resource store
        if(ResourceMultiton._resources[sender_resource.uri.toString()])
            delete ResourceMultiton._resources[sender_resource.uri.toString()];
    }
}

/**
 * Stores already instanciated resources for further use.
 * \static
 * \var Object
 * \protected
 */
ResourceMultiton._resources = {};