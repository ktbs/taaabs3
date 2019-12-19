/**
 * 
 */
addEventListener("message", (messageEvent) => {
    let eventsData = messageEvent.data.eventsData;
    let maxDisplayableRows = messageEvent.data.maxDisplayableRows;
    let firstRepresentedTime = messageEvent.data.firstRepresentedTime;
    let timeBeginThreshold = messageEvent.data.timeBeginThreshold;
    let timeEndThreshold = messageEvent.data.timeEndThreshold;

    let previousEventsPerRow = new Array();
    let previousEventsTimePerRow = new Array();
    let minDisplayableTime = firstRepresentedTime;
    let eventsNewRows = new Array();
    let eventsNewHiddenSiblinbgsCounts = new Array();
    let hiddenEventsCountSinceLastVisible = 0;
    let lastVisibleMaxRowEventIndex = null;

    // we browse events
    for(let i = 0; i < eventsData.length; i++) {
        let currentEvent = eventsData[i];
        let availableRow = null;

        if(currentEvent.beginTime >= minDisplayableTime) {
            // we browse the "previousEventsPerRow" Array
            for(let j = 0; (j < maxDisplayableRows) && (j < previousEventsPerRow.length); j++) {
                let rowPreviousEvent = previousEventsPerRow[j];

                if((rowPreviousEvent.shape && (rowPreviousEvent.shape != "duration-bar")) || rowPreviousEvent.hasSymbol) {
                    let timeDelta = currentEvent.beginTime - rowPreviousEvent.beginTime;

                    if(timeDelta >= timeBeginThreshold) {
                        availableRow = j;
                        break;
                    }
                }
                else {
                    let timeBeginDelta = currentEvent.beginTime - rowPreviousEvent.beginTime;
                    let timeEndDelta = currentEvent.beginTime - rowPreviousEvent.endTime;

                    if((timeBeginDelta >= timeBeginThreshold) && (timeEndDelta >= timeEndThreshold)) {
                        availableRow = j;
                        break;
                    }
                }
            }
        }

        if(availableRow == null)
            availableRow = previousEventsPerRow.length;

        if(availableRow < maxDisplayableRows) {
            if(availableRow == (maxDisplayableRows - 1))
                lastVisibleMaxRowEventIndex = i;

            if(currentEvent.row != availableRow) {
                eventsNewRows[currentEvent.id] = availableRow;
                eventsData[i].row = availableRow;
            }
            
            previousEventsPerRow[availableRow] = currentEvent;
            previousEventsTimePerRow[availableRow] = currentEvent.beginTime;

            if(previousEventsPerRow.length >= maxDisplayableRows)
                minDisplayableTime = Math.min(...previousEventsTimePerRow) + timeBeginThreshold;

            hiddenEventsCountSinceLastVisible = 0;

            if(currentEvent.hasHiddenSiblings) {
                eventsNewHiddenSiblinbgsCounts[currentEvent.id] = null;
                eventsData[i].hasHiddenSiblings = false;
            }
        }
        else {
            if(currentEvent.row != null) {
                eventsNewRows[currentEvent.id] = null;
                eventsData[i].row = null;
            }

            if(lastVisibleMaxRowEventIndex) {
                if(!eventsNewHiddenSiblinbgsCounts[eventsData[lastVisibleMaxRowEventIndex].id])
                    eventsNewHiddenSiblinbgsCounts[eventsData[lastVisibleMaxRowEventIndex].id] = 1;
                else
                    eventsNewHiddenSiblinbgsCounts[eventsData[lastVisibleMaxRowEventIndex].id]++;

                eventsData[lastVisibleMaxRowEventIndex].hasHiddenSiblings = true;
            }
        }
    }
    
    postMessage({
        eventsNewData: eventsData,
        eventsNewRows: eventsNewRows,
        eventsNewHiddenSiblinbgsCounts: eventsNewHiddenSiblinbgsCounts
    });

    close();
});
