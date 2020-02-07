# Description
This component provides a widget that fetches the obsels' data from a KTBS trace and instanciates a ktbs4la2-timeline to represent fetched obsels as it's events.

It also offers support for KTBS stylesheets (stylesheet selection and current stylesheet legend) aswell as data load control tools.

Wheteher or not any stylesheet is described in the trace's Model, the widget always provides a "default" stylesheet built on the fly from the model's obsel types if possible, or from raw obsel's types if the model fails to be fetched.

This component provides one custom element : **\<ktbs4la2-trace-timeline\>**

# Usage
First, you have to import [ktbs4la2-trace-timeline.js](./ktbs4la2-trace-timeline.js),

either from HTML :
```HTML
<script type="module" src="/<path>/ktbs4la2-trace-timeline/ktbs4la2-trace-timeline.js"></script>
```

or from Javascript :
```javascript
import "/<path>/ktbs4la2-trace-timeline/ktbs4la2-trace-timeline.js";
```

In order to create a timeline widget that fetches its events from a KTBS trace, you must then add a \<ktbs4la2-trace-timeline\> element to your HTML document as following :
```HTML
<ktbs4la2-trace-timeline uri="https://<hostname>/<path>/<to>/<trace>"></ktbs4la2-trace-timeline>
```

This element is decribed in details below.


# \<ktbs4la2-trace-timeline\>

## Attributes
| Name | Description | Format | Required | Default |
| ----:|:----------- |:------ |:-------- |:------- |
| uri | The uri of the KTBS trace to fetch and display. | URL | Required | |
| allow-fullscreen | Whether or not the widget should display a "fullscreen" button and allow switching to fullscreen mode.<br><br> **Important**: this attribute value will not be automatically updated to expose the widgets' state (for this purpose, use instead the "set-stylesheet" events described further below). | "true", "1", "false" or "0" | Optional | "true" |
| stylesheet | Sets which stylesheet should be applied to obsels at startup. | "default" or a valid stylesheet ID from the trace's Model | Optional | "default" |
| allow-change-stylesheet | Whether or not the user should be able to change the stylesheet currently applied to the obsels. | "true", "1", "false" or "0" | Optional | "true" |
| show-stylesheet-legend | Whether or not the user should see a legend for the current stylesheet. | "true", "1", "false" or "0" | Optional | "true" |

## Emitted events
| Type | Description | Bubbles | Cancelable | Detail |
| ----:|:----------- |:------- |:---------- |:------ |
| set-stylesheet | Emitted when the users changes the current stylesheet. | true | false | **stylesheet_id**: ID of the newly selected stylesheet |

## Child nodes
Any nested content will be discarded.


# EXAMPLE
See the [sample file](./sample.html) provided alongside this one.