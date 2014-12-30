//Module: First to load after libraries
(function(global, factory) {

	//Expose TestApp
	global.TestApp = factory();

	//Object definitions begin from here
	
	//Shell is a container to hold app specific data and methods
	TestApp.Shell = {
		__appRouter: false
	};
	
	//TestApp Routers
	TestApp.Routers = {
		AppRouter: Backbone.Router.extend({
			_currentView: false,
			
			routes: {
				"": "index",
				"about": "about",
				"*default": "error"
			},
			
			index: function() {
				//Handle landing page view here
				this._currentView ? this._currentView.undelegateEvents() : '';
				this._currentView = new TestApp.Views.LandingPageView({el: $("#application")});
			},
			
			about: function() {
				this._currentView ? this._currentView.undelegateEvents() : '';
				this._currentView = new TestApp.Views.AboutPage({el: $("#application")});
			},
			
			error: function() {
				//Handle a 404 page here
				this._currentView ? this._currentView.undelegateEvents() : '';
				this._currentView = new TestApp.Views.ErrorPage({el: $("#application")});
			}
		})
	};
	
	//TestApp Models
	TestApp.Models = {
		LPModel: Backbone.Model.extend({
			initialize: function() {}
		})
	};
	
	//Collections
	TestApp.Collections = {
		LPCollection: Backbone.Collection.extend({
			model: TestApp.Models.LPModel,
			
			defaults: flightsData
		})	
	};
	
	//Views
	TestApp.Views = {
		LandingPageView: Backbone.View.extend({
			_model: false,
			_collection: false,
			_sortState: {
				price: false,
				takeoffTime: false,
				landingTime: false
			},
			
			initialize: function() {
				var closure = this;
				this._model = new TestApp.Models.LPModel();
				this._collection = new TestApp.Collections.LPCollection();
				//Loop through flightsData and put them into collections
				$.each(flightsData, function(i, item) {
					closure._collection.add(item);
				});
				this.render();
			},
			
			events: {
			'click #price-sort': 'simpleSort',
			'click #takeoff-sort': 'simpleSort',
			'click #landing-sort': 'simpleSort',
			'click .airline-codes li a': 'airlineFilter',
			'click .travel-class li a': 'classFilter',
			'click .reset': 'resetData'
			},
			
			render: function() {
				this.$el.html('<div class="panel panel-default">\
									<!-- Default panel contents -->\
								  	<div class="panel-heading">\
								  		<ul class="nav nav-pills">\
								  			<li class="active">\
								  				<a href="#">Filters</a>\
								  			</li>\
									  		<li class="dropdown airline-codes">\
												<a id="drop4" class="airline-codes" role="button" data-toggle="dropdown" href="#">Airline Codes <span class="caret"></span></a>\
												<ul class="dropdown-menu" role="menu" aria-labelledby="drop4">\
													<li role="presentation">\
														<a role="menuitem" tabindex="-1" afilter="SJ" href="#">SJ - '+airlineMap.SJ+'</a>\
													</li>\
													<li role="presentation">\
														<a role="menuitem" tabindex="-1" afilter="AI" href="#">AI - '+airlineMap.AI+'</a>\
													</li>\
													<li role="presentation">\
														<a role="menuitem" tabindex="-1" afilter="G8" href="#">G8 - '+airlineMap.G8+'</a>\
													</li>\
													<li role="presentation">\
														<a role="menuitem" tabindex="-1" afilter="JA" href="#">JA - '+airlineMap.JA+'</a>\
													</li>\
													<li role="presentation">\
														<a role="menuitem" tabindex="-1" afilter="IN" href="#">IN - '+airlineMap.IN+'</a>\
													</li>\
												</ul>\
											</li>\
											<li class="dropdown travel-class">\
												<a id="drop4" class="travel-class" role="button" data-toggle="dropdown" href="#">Travel Class<span class="caret"></span></a>\
												<ul class="dropdown-menu" role="menu" aria-labelledby="drop4">\
													<li role="presentation">\
														<a role="menuitem" tabindex="-1" tclass="Economy" href="#">Economy</a>\
													</li>\
													<li role="presentation">\
														<a role="menuitem" tabindex="-1" tclass="Business" href="#">Business</a>\
													</li>\
												</ul>\
											</li>\
											<li class="inactive pull-right reset">\
												<a href="#"><span class="glyphicon glyphicon-refresh"></span> Reset</a>\
											</li>\
										</ul>\
								  	</div>\
									<table class="table flight-results">\
										<thead>\
											<tr>\
												<td>\
													<div class="row">\
														<div id="price-sort" class="col-lg-3 col-md-3 col-xs-12 price"><b>Price</b> <span class="glyphicon glyphicon-sort"></span></div>\
														<div id="takeoff-sort" class="col-lg-3 col-md-3 col-xs-12 takeoff"><b>Takeoff</b> <span class="glyphicon glyphicon-sort"></span></div>\
														<div id="landing-sort" class="col-lg-3 col-md-3 col-xs-12 landing"><b>Landing Times</b> <span class="glyphicon glyphicon-sort"></span></div>\
													</div>\
												</td>\
											</tr>\
										</thead>\
										<tbody></tbody>\
									</table>\
								</div>\
				');
				this.populateRecords();
			},
			
			simpleSort: function(e) {
				var event_org, selector;
				if ($(e.currentTarget).hasClass('price')) {
					event_org = "price";
					selector = "#price-sort";
				}
				else if ($(e.currentTarget).hasClass('takeoff')) {
					event_org = "takeoffTime";
					selector = "#takeoff-sort";
				}
				else if ($(e.currentTarget).hasClass('landing')) {
					event_org = "landingTime";
					selector = "#landing-sort";
				}

				switch(this._sortState[event_org]) {
					//Default is ascending
					case false:
					case "asc":
						var temp = this._collection.sortBy(function(data) {
							return data.get(event_org) * -1;
						});
						this._collection.models = [] && temp.reverse();
						//change sort image
						this.$el.find(selector+' .glyphicon').removeClass('glyphicon-sort').removeClass('glyphicon-sort-by-attributes-alt').addClass('glyphicon-sort-by-attributes');
						this._sortState[event_org] = "desc";
						break;
					//Descending
					case "desc":
						var temp = this._collection.sortBy(function(data) {
							return data.get(event_org) * -1;
						});
						this._collection.models = [] && temp;
						//Change sort image
						this.$el.find(selector+' .glyphicon').removeClass('glyphicon-sort').removeClass('glyphicon-sort-by-attributes').addClass('glyphicon-sort-by-attributes-alt');
						this._sortState[event_org] = "asc";
						break;
				}
				this.populateRecords();
			},
			
			airlineFilter: function(e) {
				var airline = $(e.currentTarget).attr('aFilter');
				var refined_results = this._collection.filter(function(item) {
					return (item.get("airlineCode") === airline ? true : false)
				});
				this._collection.models = [] && refined_results;
				this.populateRecords();
			},
			
			classFilter: function(e) {
				var travel_class = $(e.currentTarget).attr('tClass');
				var refined_results = this._collection.filter(function(item) {
					return (item.get("class") === travel_class ? true : false)
				});
				this._collection.models = [] && refined_results;
				this.populateRecords();
			},
			
			resetData: function() {
				var closure = this;
				this._collection.models = [];
				$.each(flightsData, function(i, item) {
					closure._collection.add(item);
				});
				this.populateRecords();
				this.$el.find('.row .glyphicon').removeClass('glyphicon-sort-by-attributes').removeClass('glyphicon-sort-by-attributes-alt').addClass('glyphicon-sort');
			},
			
			populateRecords: function() {
				var closure = this;
				this.$el.find('.flight-results tbody').empty();
				this._collection.each(function(item, index) {
					var oneHour = 60*60*1000; // minutes*seconds*milliseconds
					var firstDate = new Date(parseInt(item.get("landingTime")));
					var secondDate = new Date(parseInt(item.get("takeoffTime")));
					var diffHours = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneHour)), 2);
					closure.$el.find('.flight-results tbody')
							.append('<tr>\
										<td>\
											<div class="row flight-data-row">\
												<div class="primary-flight-box col-lg-6 col-md-6 col-xs-12">\
													<h4>'+airlineMap[item.get("airlineCode")]+' - '+item.get("class")+'</h4>\
													<h4>'+airportMap[item.get("originCode")]+' to '+airportMap[item.get("destinationCode")]+'</h4>\
													<h4>'+new Date(parseInt(item.get("takeoffTime")))+' - '+new Date(parseInt(item.get("landingTime")))+'</h4>\
												</div>\
												<div class="secondary-flight-box col-lg-6 col-md-6 xol-xs-12">\
													<h4>Rs. '+item.get("price")+'/- <small>INR</small></h4>\
													<h4>'+diffHours+' hours on <small>('+item.get("originCode")+' - '+item.get("destinationCode")+')</small> route</h4>\
												</div>\
											</div>\
										</td>\
									</tr>\
							');
				});
			},
		}),
		
		//Render AboutPage Views
		AboutPage: Backbone.View.extend({
			initialize: function() {
				this.render();
			},
			
			render: function() {
				this.$el.html('<h2>Anvesh Checka</h2>\
					<span>Reach me at anvesh.checka@gmail.com</span>\
				');
			}
		}),
		
		//Render ErrorPage view
		ErrorPage: Backbone.View.extend({
			initialize: function() {
				this.render();
			},
			
			render: function() {
				this.$el.html('<h2>404! Page not found </h2>');
			}
		})
	};
	
	//Load this on $ document ready
	TestApp.Shell.__appRouter = new TestApp.Routers.AppRouter();

	//Enable PushState
	Backbone.history.start();
})(this,
	function() {
		return {
			Models: {},
			Collections: {},
			Views: {},
			Routers: {},
			Shell: {}
		};
});
