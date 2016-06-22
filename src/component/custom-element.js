(function(dex, ko, jQuery){

    class CustomElement extends HTMLElement {
        getComponent() {
            return this._dex_component;
        }

        setComponent(component) {
            this._dex_component = component;
        }
    }

    dex.component.custom_element = CustomElement;
    
})(dex, ko, jQuery);


