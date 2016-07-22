(function(dex, ko, jQuery){

    function component(name, container, config = {})
    {
        this.name = name;
        this.container = container;

        dex.attach(this, config);

        return this.initialize();
    };

    component.prototype = dex.view_model.prototype.extend(component, {

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

            let method = element.getAttribute(trigger) || '';
            let args = element.getAttribute('component-function-args');

            if(!method)
                return true;

            if(args)
                args = String(args).split(', '); // sometimes integers get passed in, cant do string.split() on an integer!
            else
                args = [];

            // maybe we want to pass the event!
            if (element.hasAttribute('component-function-pass-event'))
                args.push(event);

            //dex.debug(['im doing ', method, ' to ', element, ' in component ', this.name, ' the event is : ', event]);

            let nested = method.split('.');

            if(nested.length === 1 && typeof this[method] == 'function')
                this[method].apply(this, args);

            // ability to pass functions from a components childlike: component.child.grandchild.call_me()
            if(nested.length > 1)
            {
                let current = this;
                let previous = undefined;
                let fn = undefined;

                while(nested.length)
                {
                    fn = nested.shift();

                    if(current[fn])
                    {
                        previous = current;
                        current = current[fn];
                    }
                }

                if(typeof current == 'function')
                    previous[fn](args)
            }

            return true;
        },

        useVM: function(vm)
        {
            dex.debug(`component ${this.name} needs to implement the useVM method for data-binding to components from ko-for-loops`);
        },
    });

    dex.component = component;

})(dex, ko, jQuery);


