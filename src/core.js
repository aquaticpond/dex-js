window.dex = (function(jQuery){

    var dex = {};

    dex.utils = {};
    dex.debug = (arg) => console.log(arg);

    // jquery deep extend which modifies the original
    // instead of returning a new object
    dex.attach = (original, attachMe) => jQuery.extend(true, original, attachMe);

    // variadic jQuery deep extend which returns a new object
    // instead of modifying an original
    dex.mix = function(){

        var args = Array.prototype.slice.call(arguments);
        args.unshift({});
        args.unshift(true);
        return jQuery.extend.apply(undefined, args);
    };

    // mix one
    dex.clone = (wan) => dex.mix(wan);

    // mix two
    dex.extend = (wan, too) => dex.mix(wan, too);

    dex.config = {
        observable: (initial) => ({initial: initial}),
        collection: (vm) => ({vm: vm}),
        child: (vm) => ({vm: vm}),
    }

    return dex;

})(jQuery);


