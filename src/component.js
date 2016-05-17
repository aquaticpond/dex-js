(function(dex, ko, jQuery){

    function component(name, container, config)
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
            ko.cleanNode(this.container[0]);

            this.container.on('click', '[component-function]', {}, (event) => this.delegateEvent(event));
            
            if(this.container.find('[component-onchange]').length)
                this.container.on('change', '[component-onchange]', {}, (event) => this.delegateEvent(event, 'component-onchange'));

            ko.applyBindings(this, this.container[0]);
        },

        delegateEvent: function(event, trigger = 'component-function')
        {
            var element = jQuery(event.target);

            //buble up
            if (!element.attr(trigger))
                element = element.closest(`[${trigger}]`);

            var method = element.attr(trigger);
            var args = element.attr('component-function-args');

            if(args)
                args = String(args).split(', '); // sometimes integers get passed in, cant do string.split() on an integer!
            else
                args = [];

            // maybe we want to pass the event!
            if (element[0].hasAttribute('component-function-pass-event'))
                args.push(event);

            //dex.debug(['im doing ', method, ' to ', element, ' in component ', this.name, ' the event is : ', event]);

            if(method && typeof this[method] == 'function')
                this[method].apply(this, args);

            return true;
        }
    };

    dex.component = component;

})(dex, ko, jQuery);


