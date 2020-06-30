Javascript KTBS-API quick start guide
=====================================

# Description

The KTBS-API library is a client-side ES6 (Javascript) implementation for the KTBS REST API.

If you are not already familiar with the concepts of KTBS, you should start by reading [KTBS's online documentation](https://ktbs.readthedocs.io/en/latest/).

The provided classes are designed to make it easier for Javascript developpers to interact with a KTBS service.

# Requirements

KTBS-API library is a set of ES6 modules. Therefore, the Javascript interpreter you are using to run your code (in most cases, that would be the one embeded in your browser) must be ES6-compatible. Reasonably recent releases of Firefox, Chrome or Opera should work fine (not tested with Edge).

If you are querying a remote KTBS service, make sure that you have network connectivity and that the remote server allows [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) by providing the adequate [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

Finally, keep in mind that most browser's security policies won't allow CORS when opening a document directly from the local filesystem (origin = file://...). So your HTML documents MUST be delivered to the browser through HTTP protocol by an HTTP server. Install a local one if needed.

# Overview

Below is a UML class diagram of the KTBS API library, showing the most usefull classes, properties, public attributes and methods.

![KTBS API class diagram](ktbs-api_class_diagram.svg)

Note that everything is not represented in this diagram. For more detailed informations, check the [API Reference](#api-reference)

# Usage

## Modules import

In KTBS-API, each class is contained in it's own separate .js file, which is an ES6 module exporting that class (except for classes "StoredTrace" and "ComputedTrace" who are both contained in module "Trace.js").

Before explicitly using a class provided by the library, you have to import it from the corresponding ES6 module.

For instance, to be able to use the "Ktbs" class, you should do something like :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";
~~~~~~~~~~~~~~~~~~~~~

or for the "Obsel" class :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Obsel} from "/<path>/ktbs4la2/ktbs-api/Obsel.js";
~~~~~~~~~~~~~~~~~~~~~

etc ...

When a module depends on another one, it automatically imports it. So you don't have to worry about dependencies.

## Getting a resource instance

### Using the ResourceMultiton

ResourceMultiton is an implementation of the [Multiton design pattern](https://en.wikipedia.org/wiki/Multiton_pattern).

It is a static utility class that allows to share ktbs Resource instances in order to avoid duplicate instances of the same resource, avoiding conflicts, reducing memory usage and network brandwidth consumption.

For these reasons, it is recommended to get instances of existing remote resources through the ResourceMultiton, and not directly instanciate Ktbs resources classes unless you are creating a new resource or if you don't care about duplicates.

To get an instance for a resource out of the ResourceMultiton, use static `method get_resource()` :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Base} from "/<path>/ktbs4la2/ktbs-api/Base.js";
import {ResourceMultiton} from "/<path>/ktbs4la2/ktbs-api/ResourceMultiton.js";

const myBase = ResourceMultiton.get_resource(Base, "http://mydomain.com/ktbs/my-base/");
~~~~~~~~~~~~~~~~~~~~~

or (with an URL object) :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Base} from "/<path>/ktbs4la2/ktbs-api/Base.js";
import {ResourceMultiton} from "/<path>/ktbs4la2/ktbs-api/ResourceMultiton.js";

const myBase_url = new URL("http://mydomain.com/ktbs/my-base/");
const myBase = ResourceMultiton.get_resource(Base, myBase_url);
~~~~~~~~~~~~~~~~~~~~~

### Direct instanciation

If you are creating a new resource or if you don't care about duplicates, you can also instanciate a resource by directly calling the constructor of the class associated with that resource's type, optionally providing the resource's uri as an argument (type : String or URL).

For instance, for a new resource :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Base} from "/<path>/ktbs4la2/ktbs-api/Base.js";

const myBase = new Base();
~~~~~~~~~~~~~~~~~~~~~

or for an existing one (the four following examples are equivalent) :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";

const myKtbsService = new Ktbs("http://mydomain.com/ktbs/");
~~~~~~~~~~~~~~~~~~~~~

or, with an URL object :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";

const myKtbs_URL = new URL("http://mydomain.com/ktbs/");
const myKtbsService = new Ktbs(myKtbs_URL);
~~~~~~~~~~~~~~~~~~~~~

or you can also call the constructor without argument and then later set the instance's uri property :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";

const myKtbsService = new Ktbs();
myKtbsService.uri = "http://mydomain.com/ktbs/";
~~~~~~~~~~~~~~~~~~~~~

or, with an URL object :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";

const myKtbs_URL = new URL("http://mydomain.com/ktbs/");
const myKtbsService = new Ktbs();
myKtbsService.uri = myKtbs_URL;
~~~~~~~~~~~~~~~~~~~~~

**IMPORTANT** : even if you have specified the resource's URI, at this point remote data has not been fetched yet, so most of the instance's properties will still be undefined.

## Reading a resource's data

### Fetching data from server (GET)

In order to fetch the resource's data into the instance's properties, call method `get()` and use the returned promise (the resource's URI MUST have been set, either as an argument of the constructor, or by setting it's `uri` property):

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";

const myKtbsService = new Ktbs("http://mydomain.com/ktbs/");

myKtbsService.get()
    .then(() => {
        // success, do something with the fetched data
        alert("Ktbs service available, version = " + myKtbsService.version);
    })
    .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
~~~~~~~~~~~~~~~~~~~~~

**IMPORTANT** : the Promise object returned by the first call to `get()` is kept in memory and then returned by every further call to `get()` as long as the resource is considered to be in sync with it's remote version.

This allows that various pieces of code can work on shared resource instances (delivered by ResourceMultiton) and safely call `get()` without worrying about generating useless HTTP requests to the remote server.

However, if you want to force refreshing the resource's data with a new HTTP request, you can call method `force_state_refresh()` before calling `get()`.

### Using object properties

Once data is fetched, you can read objects properties listed in the API reference.

**IMPORTANT** : Javascript doesn't provide members visibility support, so by convention, all class members whose name is prefixed by character _ (underscore) should be considered private and client code should not attempt to read or write them. Instead, use public properties and method whose name is not prefixed with a _.

## Creating a new resource

In order to store a new resource on a remote Ktbs service, you have to :
1. Have an existing parent resource instance to post the new resource into
2. Instanciate the new resource
3. Set an identifier for the new resource (facultative for Obsels)
4. Post the new resource to it's parent
5. Use the Promise returned by the `post()` call

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";
import {Base} from "/<path>/ktbs4la2/ktbs-api/Base.js";

const myKtbsService = new Ktbs("http://mydomain.com/ktbs/"); // 1. Have a parent resource instance

const myNewBase = new Base(); // 2. Instanciate the new resource
myNewBase.id = "example_base/"; // 3. Set an identifier for the new resource (facultative for Obsels)
myNewBase.label = "Example base";

myKtbsService.post(myNewBase) // 4. Post the new resource to it's parent
    .then(() => { // 5. Use the Promise
        // The new base has been successfully posted to it's parent
        // Before using it, remember to do a get() on it (*)
        myNewBase.get()
            .then(() => {
                // do something with the new Base
            });
    })
     .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
~~~~~~~~~~~~~~~~~~~~~

(*) **IMPORTANT** : just after POSTing a new resource, it is still not ready for use yet even if the POST has been successfull. 
This is because the new resource's client-side representation is no more considered to be in sync with it's remote version (some modifications might have been made by the server during the resource creation). 
So remember performing a `get()` on it, as shown in the example above.

## Modifying an existing resource

After modifying an existing resource, to store modifications on the remote server, just call method `put()` on the modified instance, and use the returned Promise :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Base} from "/<path>/ktbs4la2/ktbs-api/Base.js";

const myBase = new Base("http://mydomain.com/ktbs/example_base/");
myBase.label = "Example base (renamed)";

myBase.put()
    .then(() => {
        // The base modification has been successfully recorded
        alert("PUT successfull");
    })
     .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
~~~~~~~~~~~~~~~~~~~~~

## Deleting an existing resource

To delete an existing resource from the server, just call `delete()` on the instance to delete, and use the returned Promise :

~~~~~~~~~~~~~~~~~~~~~{.js}
// (replace "<path>" with the adequate path prefix)
import {Base} from "/<path>/ktbs4la2/ktbs-api/Base.js";

const myBase = new Base("http://mydomain.com/ktbs/example_base/");

myBase.delete()
    .then(() => {
        // The base modification has been successfully recorded
        alert("DELETE successfull");
    })
     .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
~~~~~~~~~~~~~~~~~~~~~

## Authentication

Some KTBS services may implement access control over their hosted resources, requiring authentication from client.

KTBS-API offers optional support for basic HTTP authentication when sending requests to a Ktbs service (other means of authentication are not supported at this point).

To perform an authenticated HTTP request, you can provide a credentials object as an argument to methods `get()`, `post()`, `put()` or `delete()`. This credentials object is a basic Javascript object with two required members named "id" and "password" :

~~~~~~~~~~~~~~~~~~~~~{.js}
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";
import {ResourceMultiton} from "/<path>/ktbs4la2/ktbs-api/ResourceMultiton.js";

const myKtbsService = ResourceMultiton.get_resource(Ktbs, "http://mydomain.com/ktbs/");

const credentials = {
    id: "my_username",
    password: "my_password"
};
    
myKtbsService.get(null, credentials).then(() => {
    alert("Performed an authenticated GET request with success");
});
~~~~~~~~~~~~~~~~~~~~~

Once you have performed a successfull authenticated request on a resource, it will keep it's credential informations in memory, so you won't have to provide them again for any further requests during the session.

However, if you want to stop using these credentials and forget about them for future request, you can call method `disconnect()` on that resource :

~~~~~~~~~~~~~~~~~~~~~{.js}
myKtbsService.disconnect();
~~~~~~~~~~~~~~~~~~~~~

# Examples

Four sample files are provided alongside this library :
- [sample_create.html](sample_create.html)
- [sample_read.html](sample_read.html)
- [sample_update.html](sample_update.html)
- [sample_delete.html](sample_delete.html)

To run either one of them, the recommended procedure is :
- copy it (so you won't alter the original file) somewhere else in a folder exposed by your HTTP service
- edit it's source code to change the paths of modules import so they match the ktbs-api folder
- edit the resources URLs to work on an existing KTBS service of your choice
- open the modified sample's URL in a browser and show the console to monitor execution results

<a id="api-reference"></a>

# API reference

In order to generate a full HTML API reference documentation for the library, you can use doxygen with the provided Doxyfile :

~~~~~~~~~~~~~~~~~~~~~{.sh}
~/ktbs4la2/ktbs-api$ doxygen Doxyfile
~~~~~~~~~~~~~~~~~~~~~

then open file "index.html" under the generated folder "api-reference".