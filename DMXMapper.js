/* Copyright (c) 2015 Adam Simpson */
document.addEventListener("DOMContentLoaded", function(event) { 
    
    /* Render lights list */
    renderLightsList();
    
    /* 
     *  Sortable library lists using sortable Library 
     */
    
    /* Lights Menu - contains all the lights that can be dragged onto the DMX map (universe)
        Can't reorder list
        Can't put items onto list
        Clones item when dragged onto a universe
    */
    var lightsMenuList = document.getElementById("lightsMenuList");
    
    var lmlSort = Sortable.create(lightsMenuList,{
        group: {
            name: 'lightMenu',
            pull: 'clone',
            put: false
        },
        sort: false,
    });
    
   /* DMX Map List - contains a list of the lights on the universe
        Can reorder list
        Can't pull items onto other lists
        Can only have items added from lightsMenuList
    */
    var DMXMapList = document.getElementById("DMXUniverseList");
    
    var dmxmSort = Sortable.create(DMXUniverseList,{
        group: {
            name: 'DMXUniverse',
            pull: false,
            put: ["lightMenu"]
        },
        sort: true,
        filter: '.js-remove',
        onFilter: function (evt) {
            var el = dmxmSort.closest(evt.item); // get dragged item
            el && el.parentNode.removeChild(el);
            renderUniverse(evt.from);
        },
        onAdd: function(event) {
            addLightToUniverse(event);
        },
        onSort: function(event) {
            renderUniverse(event.item.parentElement);
        }
    });
    
});

/* Renders the lights menu list from the data found in the /lights.js file. */
function renderLightsList() {

    var lightsMenuList = document.getElementById("lightsMenuList");
    
    for(var i = 0; i < lights.length; i++) {
    
        var newListItem = document.createElement("li");
        var newListItemName = document.createTextNode(lights[i].name + " (" + lights[i].dmxChannels.toString() + " Channels)");
        var itemImg = document.createElement("img");
        itemImg.setAttribute("src", lights[i].img);
        newListItem.appendChild(itemImg);
        var itemName = document.createElement("p");
        newListItem.appendChild(itemName);
        itemName.appendChild(newListItemName);
        
        newListItem.setAttribute("title", lights[i].description);
        
        newListItem.setAttribute("class", "light lightMenuItem");
        
        newListItem.setAttribute("style", "background-color:" + lights[i].bgColor);
        
        newListItem.setAttribute("data-name", lights[i].name);
        newListItem.setAttribute("data-dmxChannels", lights[i].dmxChannels);
        newListItem.setAttribute("data-bgColor", lights[i].bgColor);
        newListItem.setAttribute("data-img", lights[i].img);
        newListItem.setAttribute("data-powerConsumption", lights[i].powerConsumption);
        newListItem.setAttribute("data-powerOutput", lights[i].powerOutput);
        
        
        lightsMenuList.appendChild(newListItem);
        
    } 
}

function renderUniverse(universe) {

    var liElements = universe.getElementsByTagName("li");

    var channel = 0;
    var powerConsumption = 0;
    var numLights = 0;
    var powerOutput = 0;

    /* loop through all the li elements in the list (universe) */
    for (var i = 0; i < liElements.length; i++) {

        numLights++;

        var liE = liElements[i];

        /* Removed all the child elements of the list item so they can be rendered corrently for this is */
        while (liE.firstChild) {
            liE.removeChild(liE.firstChild);
        }

        // adds the power consumption of the light to the total power consumption of the universe
        powerConsumption = powerConsumption + parseInt(liE.getAttribute("data-powerConsumption"));

        //adds the power out put of the light to the total for the universe
        powerOutput = powerOutput + parseInt(liE.getAttribute("data-powerOutput"));

        //create dip switch div
        var dipDiv = document.createElement("div");
        dipDiv.setAttribute("class", "dipCon");
        //call the renderDipSwitch function
        dipDiv.appendChild(renderDipSwitch(channel + 1));
        liE.appendChild(dipDiv);



        //name
        var nameDiv = document.createElement("div");
        nameDiv.setAttribute("class", "nameCon");
        var nameP = document.createElement("p");
        nameP.appendChild(document.createTextNode(liE.getAttribute("data-name")));
        nameDiv.appendChild(nameP);
        liE.appendChild(nameDiv);

        //create channel
        renderChDisplay(liE.getAttribute("data-dmxChannels"), "Channels", liE);

        //create min channel
        renderChDisplay(channel + 1, "DMX Start", liE);
        
        //add the number of channels from this light to the total channels of used in the universe
        channel = channel + parseInt(liE.getAttribute("data-dmxChannels"));

        //create max channel
        renderChDisplay(channel, "DMX Finish", liE);

        //create delete button
        var deleteDiv = document.createElement("div");
        deleteDiv.setAttribute("class", "deleteCon");
        var deleteP = document.createElement("p");
        deleteP.setAttribute("class", "js-remove");
        deleteP.appendChild(document.createTextNode("✖"));
        deleteDiv.appendChild(deleteP);
        liE.appendChild(deleteDiv);
    };

    document.getElementById("TotNumLights").innerHTML = numLights;

    document.getElementById("ChUsed").innerHTML = channel;

    document.getElementById("POWatts").innerHTML = powerOutput;

    document.getElementById("PCWatts").innerHTML = powerConsumption;

    document.getElementById("PCAmps").innerHTML = (powerConsumption/240).toFixed(3);
}

function renderChDisplay(data, name, liE) {
    var chDiv = document.createElement("div");
    chDiv.setAttribute("class", "chDisCon");
    var chDisP = document.createElement("p");
    chDisP.appendChild(document.createTextNode(data));
    chDisP.setAttribute("class", "chDisNum");
    chDiv.appendChild(chDisP);
    var chP = document.createElement("p");
    chP.setAttribute("class", "chDisName");
    chP.appendChild(document.createTextNode(name));
    chDiv.appendChild(chP);
    liE.appendChild(chDiv);
}

function addLightToUniverse(event) {

    event.item.setAttribute("class", "light");

    /*  Adds up the number of channels being used by all the lights including the light which was just added.*/
    var channels = 0;
    var parentList = event.item.parentNode;
    for (var i = 0; i < parentList.getElementsByTagName("li").length; i++) {
        channels = channels + parseInt(parentList.getElementsByTagName("li")[i].getAttribute("data-dmxChannels"));
    };

    /* if the number of channels used is greater than 511 then it removed the light from the universe
       because a universe can only have 2^9 channels. Also alert the user to let them know they can't
       add any more lights
    */
    if (channels > 511) {
        console.log(event.item);
        parentList.removeChild(event.item);
        alert("You can\'t add any more lights to this universe because it\'s full. You only have 511 channels per universe.");
    };

}

function renderDipSwitch(channelNumber) {
    var dipArray = channelToDipArray(channelNumber);

    var dipContainer = document.createElement("div");
    dipContainer.setAttribute("class", "dipContainer");
    for(i = 0; i < 10; i++) {
        var switchCont = document.createElement("div");
        switchCont.setAttribute("class", "dipSwitchContainer");
        var switchRep = document.createElement("div");
        if (dipArray[i]) {
            switchRep.setAttribute("class", "dipOn dipSwitch");
        } else {
            switchRep.setAttribute("class", "dipOff dipSwitch");
        };
        var switchNum = document.createElement("p");
        switchNum.setAttribute("class", "dipSwitchP");
        switchNum.appendChild(document.createTextNode(i + 1));
        switchCont.appendChild(switchRep);
        switchCont.appendChild(switchNum);
        dipContainer.appendChild(switchCont);
    }

    return dipContainer;
}

/* used to convert dmx channel number to array representing the dip switch positions */
function channelToDipArray(dmxChannel) {
    var dmxChannelBinary = (dmxChannel).toString(2);

    var dmxChB = dmxChannelBinary.split("");

    var dipArray = [];

    for (var i = dmxChB.length - 1; i >= 0; i--) {
        dipArray.push(parseInt(dmxChB[i]));
    };

    if (dipArray.length != 10) {
        for (var i = dipArray.length; i <= 9; i++) {
            if (dipArray.length == 9) {
                dipArray.push(1);
            } else {
                dipArray.push(0);
            };
        };
    }

    return dipArray;
}