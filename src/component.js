(function(dex, ko, jQuery){

    function component(name, container, config = {})
    {
        this.name = name;
        this.container = container;

        dex.attach(this, config);

        return this;
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
            var extended = dex.extend(this, config);
            extended.constructor = constructor;

            return extended;
        },

        applyBindings: function()
        {
            if(this.container)
                ko.cleanNode(this.container);

            jQuery(this.container).on('click', (event) => this.delegateEvent(event));
            
            if(jQuery(this.container).find('[component-onchange]').length)
                jQuery(this.container).on('change', '[component-onchange]', {}, (event) => this.delegateEvent(event, 'component-onchange'));

            if(this.container)
                ko.applyBindings(this, this.container);
        },

        delegateEvent: function(event, trigger = 'component-function')
        {
            var element = event.target;

            //buble up
            if (!element.hasAttribute(trigger))
                element = jQuery(element).closest(`[${trigger}]`);

            var method = element.getAttribute(trigger);
            var args = element.getAttribute('component-function-args');

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


