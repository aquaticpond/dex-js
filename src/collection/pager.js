(function(dex, ko){

    function pager()
    {
        this.items.subscribe(this.updatePaging);

        return this;
    }

    pager.prototype = dex.view_model.prototype.extend(pager, {
        config:
        {
            observables: {
                page_limit: 9999,
                pages: 1,
                page: 1,
                items: 1,
            },
            collections: {
                page_options: {decorator: (...data) => [...data], initial: [1] },
            },
        },

        page_limit_options: [25,50,100,200,500],

        next_page: function()
        {
            let current = this.page();
            let max = this.pages();
            let next = current + 1;

            this.page(next <= max ? next : 1);
        },

        previous_page: function()
        {
            let current = this.page();
            let previous = current - 1;
            let max = this.pages();

            this.page(previous >= 1 ? previous : max);
        },

        updatePaging: function(item_count)
        {
            let limit = this.page_limit();
            let items = raw.length || 1;
            let pages = Math.ceil(item_count/limit);

            if(this.page() > pages)
                this.page(pages);

            if(this.page() < 1)
                this.page(1);

            let page_options = Array.apply(null, Array(pages)).map((e,i)=>i+1);
            let page = this.page();
            let slice = [
                (page-1) * limit,
                (page * limit)
            ];

            this.pages(pages);
            this.page_options(page_options);
        }

    });

    dex.collection.pager = pager;

})(dex, ko);
