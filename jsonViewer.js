window.JSONViewer = (function(element){

    var obj = {};

    obj.name = null;
    obj.top = null;
    obj.parent = null;
    obj.current = null;
    obj.path = [];


    obj.init = function(data, name){
        if(name === undefined){
            name = "data";
        }
        obj.name = name;
        $(element).html("");
        loadData(name, data);
    }

    function loadData(name, data, parent, level, recursive){

        // Check if we are the top level
        if(parent === undefined){
           obj.top = data;
        }else{
            obj.parent = parent;
        }
        obj.current = data;

        // Check if this is a recursive object
        if(recursive === undefined){
            recursive = false;
        }

        if(level === undefined){
            level = 0;
            obj.path = [];
        }

        // Add this data to the path
        obj.path.push({
            "key" : name,
            "value" : data
        });

        var members = [];
        var properties = [];

        for(var i in data){
            if(data[i] === null){
                properties.push({
                    "key" : i,
                    "value" : null
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
                        "value" : data[i]
                    });
                    break;
                default:
                    members.push({
                        "key" : i,
                        "value" : data[i]
                    });
                    break;
            }
        }
        $(element).append(createColumn(name, data, properties, members, level, recursive));

        var location = [];

        var text = "";
        for(var x in obj.path){
            var item = obj.path[x];
            if(isNaN(item.key)){
                if(x == 0){
                    text += wrap(typeof item.value, item.key);
                }else{
                    text += "." + wrap(typeof item.value, item.key);
                }
            }else{
                text += "[" + wrap(typeof item.value, item.key) + "]";
            }
        }

        $("#location-text").html(text);

    }

    function createColumn(name, data, properties, members, level, recursive){

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
            $(html).append(createProperties(properties));

        }

        if(members.length > 0){
            $(html).append($("<div />", {
                "class" : "heading",
                "text" : "Members (" + members.length + ")"
            }));
            $(html).append(createMembers(members, level));
        }

        return html;

    }

    function createProperties(properties){

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
                html : wrap(typeof properties[i].value, properties[i].value)
            }));

            $(html).append(text);
        }
        $(html).append($(("<li />")));
        return html;

    }

    function createMembers(members, level){

        var html = $("<ul />", {
            "class" : "members"
        });

        for(var i in members){

            var text = $("<li />");

            // Check for a length value
            var length = "";
            if(members[i].value !== undefined && typeof members[i].value.length != undefined)
                length = members[i].value.length;

            var recursive = false;
            for(var x in obj.path){
                if(obj.path[x].value == members[i].value){
                    recursive = obj.path[x].key;
                }
            }


            var name = "";

            if(length !== ""  && length != undefined)
                name += " <div class=\"length\">(" + length + ")</div>";

            name += wrap(typeof members[i].value, members[i].key);

            if(recursive !== false){
                $(text).addClass("recursive");
            }

            $(text).html(name);
            $(text).click(createClickEvent(members[i].key, members[i].value, level, recursive));

            $(html).append(text);
        }

        return html;

    }

    /*
     *
     */
    function createClickEvent (name, data, level, recursive){
        var top = obj.top;
        var parent = obj.current;
        var current = data;
        
        return function(){

            // Remove All Columns
            $(this).parent().parent().nextAll().remove();
            obj.path = obj.path.splice(0, level + 1);
            loadData(name, data, parent, level + 1, recursive);
        }
    }

    /*
     * Wraps a value in a <span>
     */
    function wrap(type, value){
        return "<span class=\"" + type + "\">" + value + "</span>";
    }

    return obj;

})