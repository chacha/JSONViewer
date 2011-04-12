window.JSONViewer = (function(parent){

    var obj = {};

    obj.init = function(data){
        loadData("test", data);
    }

    function loadData(name, data){

        var members = [];
        var properties = [];

        for(var i in data){
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
        $(parent).append(createColumn(name, data, properties, members));

        // Location
        $(".location").append(name);

    }

    function createColumn(name, data, properties, members){

        var html = $("<div />", {
            "class" : "column"
        });

        $(html).append($("<div />", {
            "class" : "element",
            "html" : name + " " + wrap(typeof data, "(" + typeof data + ")")
        }));

        if(properties.length > 0){
            $(html).append($("<div />", {
                "class" : "heading",
                "text" : "Properties"
            }));
            $(html).append(createProperties(properties));

        }

        if(members.length > 0){
            $(html).append($("<div />", {
                "class" : "heading",
                "text" : "Members"
            }));
            $(html).append(createMembers(members));
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
                "text" : properties[i].key + ": "
            }));

            $(text).append($("<span />", {
                "class" : "value",
                "text" : properties[i].value
            }));

            $(html).append(text);
        }

        return html;

    }

    function createMembers(members){



        var html = $("<ul />", {
            "class" : "members"
        });

        for(var i in members){

            var text = $("<li />", {
                "text" : members[i].key,
                "click" : createClickEvent(members[i].key, members[i].value)
            });

            $(html).append(text);
        }

        return html;

    }

    /*
     *
     */
    function createClickEvent (name, data){
        return function(){

            // Remove All Columns
            $(this).parent().parent().nextAll().remove();
            loadData(name, data);
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