(function(dex, ko){

    function pager()
    {
        this.initialize();
        return this;
    }

    pager.prototype = dex.view_model.prototype.extend(pager, {
        config:
        {
            observables: {
                page_limit: 9999,
                pages: 1,
                page: 1,
                items: 1
            },
            collections: {
                page_options: {decorator: (...data) => [...data], initial: [1], use_pager: false},
            },
            computeds: {
                slice: function()
                {
                    let item_count = this.items();
                    let limit = this.page_limit();
                    let pages = Math.ceil(item_count/limit);
                    let page = this.page();

                    if(page > pages)
                        this.page(pages);

                    if(page < 1)
                        this.page(1);

                    page = this.page();
                    let page_options = Array.apply(null, Array(pages)).map((e,i)=>i+1);
                    let slice = [
                        (page-1) * limit,
                        (page * limit)
                    ];

                    this.pages(pages);
                    this.page_options(page_options);

                    return slice;
                }
            }
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

    });

    dex.collection.pager = pager;

})(dex, ko);
