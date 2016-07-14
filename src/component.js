(function(dex, ko, jQuery){

    function component(name, container, config = {})
    {
        this.name = name;
        this.container = container;

        dex.attach(this, config);

        return this.initialize();
    };

    component.prototype = {

        // override this
        initialize: function()
        {
            this.applyBindings();
            return this;
        },

        extend: function(constructor, config)
        {
            let extended = dex.extend(this, config);
            extended.constructor = constructor;

            return extended;
        },

        // overload this in component for custom handling
        registerCustomElement: function(element_name, component = dex.component, config = {})
        {
            class ComponentElement extends component.custom_element {
                createdCallback() {
                    this._component = new component(element_name, this, config);
                };
            }

            document.registerElement(element_name, ComponentElement);
        },

        applyBindings: function()
        {
            if(this.container)
                ko.cleanNode(this.container);

            jQuery(this.container).on('click', '[component-function]', (event) => this.delegateEvent(event));

            if(this.container)
                ko.applyBindings(this.getViewModel(), this.container);
        },

        getViewModel: function()
        {
            return this;
        },

        delegateEvent: function(event, trigger = 'component-function')
        {
            let element = event.target;

            let method = element.getAttribute(trigger);
            let args = element.getAttribute('component-function-args');

            if(args)
                args = String(args).split(', '); // sometimes integers get passed in, cant do string.split() on an integer!
            else
                args = [];

            // maybe we want to pass the event!
            if (element.hasAttribute('component-function-pass-event'))
                args.push(event);

            //dex.debug(['im doing ', method, ' to ', element, ' in component ', this.name, ' the event is : ', event]);

            if(method && typeof this[method] == 'function')
                this[method].apply(this, args);

            return true;
        }
    };

    dex.component = component;

})(dex, ko, jQuery);


