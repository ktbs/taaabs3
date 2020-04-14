/**
 * This static class allows to share ktbs Resource instances in order to avoid instanciating duplicates of the same resource.
 * @static
 */
export class ResourceProxy {

    /**
     * Checks if there is an already instanciated ktbs resource for a type and uri.
     * @param class or String resource_type the type for the desired ktbs resource instance
     * @param URL or string uri The URI for the desired resource
     * @static
     * @return Boolean
     */
    static has_resource(uri) {
        let uri_string = (uri instanceof URL)?uri.toString():uri;
        return (uri_string in ResourceProxy._resources);
    }

    /**
     * Gets a ktbs resource instance from it's type and uri.
     * @param class or String resource_type the type for the desired ktbs resource instance
     * @param URL or string uri The URI for the desired resource
     * @static
     * @return Resource
     */
    static get_resource(resource_type, uri) {
        let uri_string = (uri instanceof URL)?uri.toString():uri;

        if(!ResourceProxy.has_resource(uri_string)) {
            let type_class;

            if((typeof resource_type === 'function') && (/^\s*class\s+/.test(resource_type.toString()))) {
                type_class = resource_type;
                let newInstance = new (type_class)(uri);
                ResourceProxy._resources[uri_string] = newInstance;
            }
            else
                throw new TypeError(resource_type + " is not a valid type");
        }

        return ResourceProxy._resources[uri_string];
    }
}

/**
 * Stores already instanciated resources for further use.
 * @static
 * @type Object
 */
ResourceProxy._resources = {};