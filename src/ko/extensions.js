(function(dex, ko, jQuery){
    'use strict';

    //extend textInput binding to touch valueAccessor if it is touchable
    var originalTextInput = ko.bindingHandlers.textInput;
    ko.bindingHandlers.textInput = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

            if('touch' in valueAccessor())
                jQuery(element).on('focusout', () => valueAccessor().touch());

            originalTextInput.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        },
    };

    // Useful for passing ko foreach context data down into a component
    ko.bindingHandlers.pass_component_vm = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext){

            // if the binding context doesnt have a parent that means its the
            // initial ko template binding so lets ignore it until the context is a valid VM
            if(typeof bindingContext.$parent === 'undefined')
                return;

            let component = element.getComponent();
            let value = valueAccessor();
            let setter = 'useVM';
            let vm = value;

            if (value.setter && typeof component[value.setter] == 'function') {
                setter = value.setter;
                vm = value.vm;
            }

            // get the component and set its value
            component[setter](vm);

            // strip the pass_component_vm binding after use
            // because the use case for this is that the component
            // will rebind its self, making this binding erroneous
            let databind = element.getAttribute('data-bind');
            let stripped = databind.replace(/pass_component_vm(.*),/, '')
                .replace(/pass_component_vm(.*)/, '');

            element.setAttribute('data-bind', stripped);
        },
    };

})(dex,ko,jQuery);