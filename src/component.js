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

            ko.applyBindings(this, this.container[0]);
        },

        delegateEvent: function(event)
        {
            var element = jQuery(event.target);

            //buble up
            if (!element.attr('component-function'))
                element = element.closest('[component-function]');

            var method = element.attr('component-function');
            var args = element.attr('component-function-args');

            if (!args) args = '';
            args = String(args).split(', '); // sometimes integers get passed in, cant do string.split() on an integer!

            // maybe we want to pass the event!
            if (typeof element.data('component-function-function-pass-event') != 'undefined')
                args.push(event);

            //dex.debug(['im doing ', method, ' to ', element, ' in component ', this.name, ' the event is : ', event]);

            if(method && typeof this[method] == 'function')
                this[method].apply(this, args);

            return true;
        }
    };

    dex.component = component;

})(dex, ko, jQuery);

