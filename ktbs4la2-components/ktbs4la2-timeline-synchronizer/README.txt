DESCRIPTION :
-------------
This component allows to synchronize several instances of <ktbs4la2-timeline> from it's subtree.
The synchronizable elements are the timelines' cursors (= the vertical red bar over the timeline) and the timelines' views (zoom and position of the displayed portion of the timeline)

It provides one custom element : <ktbs4la2-timeline-synchronizer> which is described below


<ktbs4la2-timeline-synchronizer> :
---------------------
    Attributes :
    ------------
        - sync-view (optional)
            Description : whether or not we should synchronize the child timelines views
            Accepted values : "true", "1", "false", "0"
            Default : "true"
        - sync-cursor (optional)
            Description : whether or not we should synchronize the child timelines cursors
            Accepted values : "true", "1", "false", "0"
            Default : "true"

    Child nodes :
    -------------
        Any HTML content can be nested inside the element.
        Any occurence of <ktbs4la2-timeline> found in the subtree will be automatically included in the synchronization process.
        Any other nested HTML element will stay unaffected.


EXAMPLE :
---------
See the "sample.html" file provided alongside this one.