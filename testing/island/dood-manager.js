(function(dex, island){

    // Constructor
    function dood_manager(name, container)
    {
        this.name = name;
        this.container = container;

        this.doods = window.myDoodCollection;

        this.filter = ko.observable(['canDrink', true]);

        this.filtered = ko.computed(this.get_filtered_doods, this);

        
        return this.initialize();
    }


    // Interface functions
    dood_manager.prototype = dex.component.prototype.extend(dood_manager, {
        get_filtered_doods: function()
        {
            let filter = this.filter();
            let field = filter[0];
            let val = filter[1];

            return this.doods().filter(dood => dood.get(field) == val);
        }

    });


    // Custom elements
    let element_name = 'dood-manager';
    class DoodManager extends HTMLElement {
        createdCallback() {
            this._component = new dood_manager(element_name, this);
        };

        getComponent() {
            return this._component;
        }
    }

    class PropertyElement extends HTMLElement {
        createdCallback(){
            let property = this.getAttribute('name');
            this.setAttribute('data-bind', `text: $data.get('${property}')`);
        }
    }
    
    document.registerElement('vm-property', PropertyElement);
    document.registerElement(element_name, DoodManager);


    island.dood_manager = dood_manager;

})(dex, island);