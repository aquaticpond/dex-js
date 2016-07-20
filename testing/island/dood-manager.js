(function(dex, island){

    // Constructor
    function dood_manager(name, container)
    {
        this.initialize();
        
        this.name = name;
        this.container = container;
        this.doods = window.myDoodCollection;

        this.applyBindings();
        return
    }


    // Interface functions
    dood_manager.prototype = dex.component.prototype.extend(dood_manager, {
        config:
        {
            observables: {
                filter : {initial: {field: 'canDrink', value: true}},
            },

            computeds: {
                filtered: function () {
                    let filter = this.filter();
                    let field = filter.field;
                    let val = filter.value;

                    return this.doods().filter(dood => dood.get(field) == val);
                }
            }
        },
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