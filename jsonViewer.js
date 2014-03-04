window.JSONViewer = (function(element){

    var obj = {};

    obj.name = null;


    obj.init = function(data, name){
        if(name === undefined){
            name = "data";
        }
        obj.name = name;
        $(element).html("");
        loadData(name, data);
    }

    function loadData(name, data, parent, level, recursive){

        // Check if we are at the top level
        if(level === undefined || level === 0){

            // Reset Path Information
            obj.location.path = [];
            level = 0;

            // Set the Top Level
            obj.location.top = data;

            // Top level variables are not recursive
            recursive = false;
            
        }else{

            // Record the parent
            obj.location.parent = parent;
        }

        // Check if this is a recursive object
        if(recursive === undefined){
            recursive = false;
        }

        // Set the current data
        obj.location.current = data;

        // Add this data to the path
        obj.location.path.push({
            "key" : name,
            "value" : data,
            "level" : level,
            "recursive" : recursive
        });

        var children = obj.parse.json(data);

        var column = obj.html.createColumn(name, data, children.properties, children.members, level, recursive);
        $(element).append(column);
        $(window).scrollLeft($(column).offset().left);

        obj.location.update();

    }

    obj.location = {};
    
    obj.location.top = null;
    obj.location.parent = null;
    obj.location.current = null;
    obj.location.path = [];

    obj.location.update = function(){

        var text = $("<span />", {
            "id" : "location-text"
        });

        for(var x in obj.location.path){
            var click = createLocationEvent(obj.location.path[x].key, obj.location.path[x].value, obj.location.path[x].level, obj.location.path[x].recursive)

            var item = obj.location.path[x];
            if(isNaN(item.key)){
                if(x == 0){
                    $(text).append($("<span />", {
                        "class" : typeof item.value,
                        "text" : item.key,
                        "click" : click
                    }));
                }else{
                    $(text).append($("<span />", {
                        "class" : typeof item.value,
                        "text" : "." + item.key,
                        "click" : click
                    }));
                }
            }else{
                $(text).append($("<span />", {
                        "class" : typeof item.value,
                        "text" : "[" + item.key + "]",
                        "click" : click
                    }));
            }
        }

        $("#location-text").html(text);
        
    }

    function createLocationEvent (name, data, level, recursive){
        var parent = obj.location.current;

        return function(){

            // Remove All Columns
            var t = obj.location.path.slice(0, level);
            obj.location.path = t;
            if(level == 0){
                $(".column").remove();
            }else{
                $(".column").eq(level).nextAll().remove();
                $(".column").eq(level).remove();
            }
            loadData(name, data, parent, level, recursive)
        }
    }

    obj.parse = {};

    obj.parse.json = function (data){

        var members = [];
        var properties = [];

        for(var i in data){

            // Check if anything is recursive
            var recursive = false;
            for(var x in obj.location.path){
                if(obj.location.path[x].value == data[i]){
                    recursive = obj.location.path[x].key;
                }
            }

            if(data[i] === null){
                properties.push({
                    "key" : i,
                    "value" : null,
                    "prototype" : false,
                    "recursive" : false
                });
                continue;
            }

            var type = typeof data[i];
            switch(type){
                case 'string':
                case 'number':
                case 'boolean':
                    properties.push({
                        "key" : i,
                        "value" : data[i],
                        "prototype" : false,
                        "recursive" : false
                    });
                    break;
                default:
                    members.push({
                        "key" : i,
                        "value" : data[i],
                        "prototype" : false,
                        "recursive" : recursive
                    });
                    break;
            }
        }

        return {
            "properties" : properties,
            "members" : members
        }
        
    }

    obj.html = {};

    obj.html.createColumn = function(name, data, properties, members, level, recursive){

        var html = $("<div />", {
            "class" : "column"
        });

        if(recursive == false){
            recursive = "";
        }else{
            recursive = " same as " + recursive;
        }

        $(html).append($("<div />", {
            "class" : "element",
            "html" : name + " " + wrap(typeof data, "(" + typeof data + ")") + recursive
        }));

        if(recursive != ""){
            $(".element", html).addClass("recursive");
        }

        if(properties.length > 0){
            $(html).append($("<div />", {
                "class" : "heading",
                "text" : "Properties (" + properties.length + ")"
            }));
            $(html).append(obj.html.createProperties(properties));

        }

        if(members.length > 0){
            $(html).append($("<div />", {
                "class" : "heading",
                "text" : "Members (" + members.length + ")"
            }));
            $(html).append(obj.html.createMembers(members, data, level));
        }

        $(html).css({
            "height" : ($(window).height() - 70) + "px"
        });

        $(window).resize(function(e){
            return function(){
                $(e).css({
                    "height" : ($(window).height() - 70) + "px"
                });
            };
        }(html));

        return html;

    }

    obj.html.createProperties = function(properties){

        var html = $("<ul />", {
            "class" : "properties"
        });

        for(var i in properties){

            var text = $("<li />");

            $(text).append($("<span />", {
                "class" : "key",
                html : properties[i].key + ": "
            }));

            $(text).append($("<span />", {
                "class" : "value",
                html : wrap(typeof properties[i].value, htmlentities(properties[i].value))
            }));

            if(properties[i].isPrototype == true){
                $(text).addClass("prototype")
            }

            $(html).append(text);
        }
        $(html).append($(("<li />")));
        return html;

    }

    obj.html.createMembers = function(members, parent, level){

        var html = $("<ul />", {
            "class" : "members"
        });

        for(var i in members){

            var text = $("<li />");

            // Check for a length value
            var length = "";
            if(members[i].value !== undefined && typeof members[i].value.length != undefined)
                length = members[i].value.length;

            var name = "";

            if(length !== ""  && length != undefined)
                name += " <div class=\"length\">(" + length + ")</div>";

            name += wrap(typeof members[i].value, members[i].key);

            if(members[i].recursive !== false){
                $(text).addClass("recursive");
            }

            $(text).html(name);
            $(text).click(createClickEvent(members[i].key, members[i].value, parent, level, members[i].recursive));

            if(members[i].isPrototype == true){
                $(text).addClass("prototype");
            }

            $(html).append(text);
        }

        return html;

    }

    function createClickEvent(name, data, parent, level, recursive){
        return function(){

            // Remove All Columns
            $(this).parent().parent().nextAll().remove();
            obj.location.path = obj.location.path.slice(0, level + 1);
            loadData(name, data, parent, level + 1, recursive);
        }
    }

    /*
     * Wraps a value in a <span>
     */
    function wrap(type, value){
        var o =  "<span class=\"" + type + "\">" + value + "</span>";
        return o;
    }

    function htmlentities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    

    return obj;

})
