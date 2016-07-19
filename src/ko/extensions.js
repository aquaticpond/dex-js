(function(dex, ko, jQuery){
    'use strict';

    //extend textInput binding to touch valueAccessor if it is touchable
    var originalTextInput = ko.bindingHandlers.textInput;
    ko.bindingHandlers.textInput = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

            if('touch' in valueAccessor())
                jQuery(element).on('focusin', () => valueAccessor().touch());

            originalTextInput.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        },
    };

    // Useful for passing ko foreach context data down into a component
    ko.bindingHandlers.pass_component_data = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext){

            if(typeof element.getComponent === 'function')
            {
                let component = element.getComponent();
                let value = valueAccessor();
                let setter = 'useData';
                let data = value;

                if (value.setter && typeof component[value.setter] == 'function') {
                    setter = value.setter;
                    data = value.data;
                }

                // get the component and set its value
                component[setter](viewModel);
            }

            // strip the pass_component_data binding after use
            // because the usecase for this is that the component
            // will rebind its self, making this binding erroneous
            let databind = element.getAttribute('data-bind');
            let stripped = databind.replace(/pass_component_data(.*),/, '')
                .replace(/pass_component_data(.*)/, '');

            element.setAttribute('data-bind', stripped);
        },
    };

})(dex,ko,jQuery);