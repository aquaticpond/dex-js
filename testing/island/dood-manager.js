(function(dex, island){

    // Constructor
    function dood_manager(name, container)
    {
        this.name = name;
        this.container = container;

        this.doods = window.myDoodCollection;

        this.filter = ko.observable({field: 'canDrink', value: true});

        this.filtered = ko.computed(this.get_filtered_doods, this);
        
        return this.initialize();
    }


    // Interface functions
    dood_manager.prototype = dex.component.prototype.extend(dood_manager, {
        get_filtered_doods: function()
        {
            let filter = this.filter();
            let field = filter.field;
            let val = filter.value;

            return this.doods().filter(dood => dood.get(field) == val);
        }

    });


    // Custom elements
    let element_name = 'dood-manager';
    class DoodManager extends dex.component.custom_element {
        createdCallback() {
            this.setComponent(new dood_manager(element_name, this));
        };
    }

    document.registerElement(element_name, DoodManager);


    island.dood_manager = dood_manager;

})(dex, island);