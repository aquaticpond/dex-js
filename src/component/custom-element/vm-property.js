(function(dex, ko, jQuery){

    // @todo: this is probably useless
    class VMPropertyElement extends HTMLElement {
        createdCallback(){
            let property = this.getAttribute('name');
            this.setAttribute('data-bind', `text: $data.get('${property}')`);
        }
    }

    document.registerElement('vm-property', VMPropertyElement);

})(dex, ko, jQuery);


