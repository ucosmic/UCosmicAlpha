Polymer('is-page-locations-index', {
    isAjaxing: false,
    ready: function () {
    },
    countriesResponse: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            console.log(response.detail.response);
            this.countries = response.detail.response;
        } else {
            console.log(response.detail.response.error);
        }
    },
    ajaxError: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            console.log(response.detail.response);
            this.countries = response.detail.response;
        } else {
            console.log(response.detail.response.error);
        }
    }
});
