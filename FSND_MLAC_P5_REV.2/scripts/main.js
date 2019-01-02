var map = {};
var infowindow = {};

var beachData = [
    { name: 'Itararé', latitude: '-23.9728131', longitude: '-46.3761992' },
    { name: 'Pitangueiras', latitude: '-23.9990193', longitude: '-46.2627678' },
    { name: 'Camburi', latitude: '-23.7777902', longitude: '-45.6546707' },
    { name: 'Embaré', latitude: '-23.9645224', longitude: '-46.3415395' },
    { name: 'Ponta da Praia', latitude: '-23.9841793', longitude: '-46.3102317' },
];

var Beach = function (name, lat, lng) {
    var self = this;
    this.name = name;
    this.lat = lat;
    this.lng = lng;

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.markerSelected = function () {
        if (document.querySelector('.mdl-layout__drawer.is-visible')) {
            var layout = document.querySelector('.mdl-layout');
            layout.MaterialLayout.toggleDrawer();
        }

        map.panTo(self.marker.getPosition());

        infowindow.setContent(self.markerContent);
        infowindow.open(map, self.marker);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 700);
    };

    this.marker.addListener('click', this.markerSelected);

    this.isVisible = ko.observable(true);

    this.isVisible.subscribe(function (currentState) {
        self.marker.setVisible(currentState);
    });

    this.markerContent = '<h4>' + this.name + '</h4>' + '<p>Carregando</p>';

    /* TODO
     * - handle when data is missing from openweathermap
     */
    (function () {
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + self.lat + '&lon=' + self.lng + '&appid=d132d4090f6202ea29bc28da5c07bf63&units=metric';
        $.getJSON(url)
            .done(function (data) {
                var desc = data.weather[0].description ? data.weather[0].description : 'no description available';
                var temp = data.main.temp ? data.main.temp : 'no temp available';
                var windSpeed = data.wind.speed ? data.wind.speed : 'no wind speed available';
                var windDeg = data.wind.deg ? data.wind.deg : 'no wind degree available';

                self.markerContent = '<div>' +
                                        '<h4>' + self.name + '</h4>' +
                                            '<dl>' +
                                                '<dt>Conditions</dt>' +
                                                '<dd>' + desc + '</dd>' +
                                                '<dt>Temp</dt>' +
                                                '<dd>' + temp + '°</dd>' +
                                                '<dt>Wind</dt>' +
                                                '<dd>' + windSpeed + ' km/h<br>' + windDeg + '°</dd>' +
                                            '<dl>' +
                                        '</div>';
            }).fail(function (error) {
                console.log('Error: ', error);
                self.markerContent = '<h4>' + self.name + '</h4>' +
                                     "<strong>Error:</strong> informação indisponível";
            });
    })();
};

ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        var mapOptions = {
            zoom: 10,
            center: new google.maps.LatLng(value.centerLat, value.centerLon),
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            mapTypeControl: false
        };

        map = new google.maps.Map(element, mapOptions);
        infowindow = new google.maps.InfoWindow();

        google.maps.event.addDomListener(window, 'resize', function () {
            var center = map.getCenter();
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
        });

        for (var i = 0; i < beachData.length; i++) {
            var beach = beachData[i];
            value.beaches.push(new Beach(beach.name, beach.latitude, beach.longitude));
        }
    }
};

var beachesModel = {
    beaches: ko.observableArray([]),
    query: ko.observable('')
};

beachesModel.filteredBeaches = ko.computed(function () {
    var query = this.query().toLowerCase();
    return ko.utils.arrayFilter(this.beaches(), function (beach) {
        var isMatch = beach.name.toLowerCase().indexOf(query) !== -1 || !query;
        beach.isVisible(isMatch);
        return isMatch;
    });
}, beachesModel);

function initMap () {
    ko.applyBindings(beachesModel);
}

function mapError () {
    var dialog = document.querySelector('dialog');
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    dialog.showModal();
}

// map doesn't render correctly on init. Call resize after window load event to fix.
$(window).on('load', function () {
    google.maps.event.trigger(map, 'resize');
});
