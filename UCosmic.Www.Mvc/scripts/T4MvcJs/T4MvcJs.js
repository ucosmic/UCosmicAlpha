

var MvcJs = {
	
	Admin: {
		Index: function() {
			var url = "/admin";

			return url.replace(/([?&]+$)/g, "");
		},
		NameConst: "Admin"
	},
	Agreements: {
		Index: function() {
			var url = "/agreements";

			return url.replace(/([?&]+$)/g, "");
		},
		NameConst: "Agreements"
	},
	Establishments: {
		Index: function() {
			var url = "/establishments";

			return url.replace(/([?&]+$)/g, "");
		},
		New: function() {
			var url = "/establishments/new";

			return url.replace(/([?&]+$)/g, "");
		},
		NameConst: "Establishments"
	},
	Home: {
		Index: function() {
			var url = "/";

			return url.replace(/([?&]+$)/g, "");
		},
		Employees: function() {
			var url = "/home/employees";

			return url.replace(/([?&]+$)/g, "");
		},
		Alumni: function() {
			var url = "/home/alumni";

			return url.replace(/([?&]+$)/g, "");
		},
		Students: function() {
			var url = "/home/students";

			return url.replace(/([?&]+$)/g, "");
		},
		Representatives: function() {
			var url = "/home/representatives";

			return url.replace(/([?&]+$)/g, "");
		},
		Travel: function() {
			var url = "/home/travel";

			return url.replace(/([?&]+$)/g, "");
		},
		CorporateEngagement: function() {
			var url = "/home/corporateengagement";

			return url.replace(/([?&]+$)/g, "");
		},
		GlobalPress: function() {
			var url = "/home/globalpress";

			return url.replace(/([?&]+$)/g, "");
		},
		NameConst: "Home"
	},
	Tenancy: {
		Tenant: function(id, returnUrl) {
			var url = "/as/{id}?returnUrl={returnUrl}";
			
			if (id) {
				url = url.replace("{id}", id);
			} else {
				url = url.replace("id={id}", "").replace("?&","?").replace("&&","&");
			}
			
			if (returnUrl) {
				url = url.replace("{returnUrl}", returnUrl);
			} else {
				url = url.replace("returnUrl={returnUrl}", "").replace("?&","?").replace("&&","&");
			}

			return url.replace(/([?&]+$)/g, "");
		},
		Css: function() {
			var url = "/tenancy/css";

			return url.replace(/([?&]+$)/g, "");
		},
		NameConst: "Tenancy"
	},
	Shared: {

	}};






