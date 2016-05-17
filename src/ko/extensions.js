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
    
})(dex,ko,jQuery);