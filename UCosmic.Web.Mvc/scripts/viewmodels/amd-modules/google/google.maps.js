var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    var MVCObject = (function () {
        function MVCObject() { }
        return MVCObject;
    })();
    exports.MVCObject = MVCObject;    
    var MVCArray = (function (_super) {
        __extends(MVCArray, _super);
        function MVCArray() {
            _super.apply(this, arguments);

        }
        return MVCArray;
    })(MVCObject);
    exports.MVCArray = MVCArray;    
    var Map = (function (_super) {
        __extends(Map, _super);
        function Map() {
            _super.apply(this, arguments);

        }
        return Map;
    })(MVCObject);
    exports.Map = Map;    
    (function (MapTypeId) {
        MapTypeId._map = [];
        MapTypeId._map[0] = "HYBRID";
        MapTypeId.HYBRID = 0;
        MapTypeId._map[1] = "ROADMAP";
        MapTypeId.ROADMAP = 1;
        MapTypeId._map[2] = "SATELLITE";
        MapTypeId.SATELLITE = 2;
        MapTypeId._map[3] = "TERRAIN";
        MapTypeId.TERRAIN = 3;
    })(exports.MapTypeId || (exports.MapTypeId = {}));
    var MapTypeId = exports.MapTypeId;
    (function (MapTypeControlStyle) {
        MapTypeControlStyle._map = [];
        MapTypeControlStyle._map[0] = "DEFAULT";
        MapTypeControlStyle.DEFAULT = 0;
        MapTypeControlStyle._map[1] = "DROPDOWN_MENU";
        MapTypeControlStyle.DROPDOWN_MENU = 1;
        MapTypeControlStyle._map[2] = "HORIZONTAL_BAR";
        MapTypeControlStyle.HORIZONTAL_BAR = 2;
    })(exports.MapTypeControlStyle || (exports.MapTypeControlStyle = {}));
    var MapTypeControlStyle = exports.MapTypeControlStyle;
    (function (ScaleControlStyle) {
        ScaleControlStyle._map = [];
        ScaleControlStyle._map[0] = "DEFAULT";
        ScaleControlStyle.DEFAULT = 0;
    })(exports.ScaleControlStyle || (exports.ScaleControlStyle = {}));
    var ScaleControlStyle = exports.ScaleControlStyle;
    (function (ZoomControlStyle) {
        ZoomControlStyle._map = [];
        ZoomControlStyle._map[0] = "DEFAULT";
        ZoomControlStyle.DEFAULT = 0;
        ZoomControlStyle._map[1] = "LARGE";
        ZoomControlStyle.LARGE = 1;
        ZoomControlStyle._map[2] = "SMALL";
        ZoomControlStyle.SMALL = 2;
    })(exports.ZoomControlStyle || (exports.ZoomControlStyle = {}));
    var ZoomControlStyle = exports.ZoomControlStyle;
    (function (ControlPosition) {
        ControlPosition._map = [];
        ControlPosition._map[0] = "BOTTOM_CENTER";
        ControlPosition.BOTTOM_CENTER = 0;
        ControlPosition._map[1] = "BOTTOM_LEFT";
        ControlPosition.BOTTOM_LEFT = 1;
        ControlPosition._map[2] = "BOTTOM_RIGHT";
        ControlPosition.BOTTOM_RIGHT = 2;
        ControlPosition._map[3] = "LEFT_BOTTOM";
        ControlPosition.LEFT_BOTTOM = 3;
        ControlPosition._map[4] = "LEFT_CENTER";
        ControlPosition.LEFT_CENTER = 4;
        ControlPosition._map[5] = "LEFT_TOP";
        ControlPosition.LEFT_TOP = 5;
        ControlPosition._map[6] = "RIGHT_BOTTOM";
        ControlPosition.RIGHT_BOTTOM = 6;
        ControlPosition._map[7] = "RIGHT_CENTER";
        ControlPosition.RIGHT_CENTER = 7;
        ControlPosition._map[8] = "RIGHT_TOP";
        ControlPosition.RIGHT_TOP = 8;
        ControlPosition._map[9] = "TOP_CENTER";
        ControlPosition.TOP_CENTER = 9;
        ControlPosition._map[10] = "TOP_LEFT";
        ControlPosition.TOP_LEFT = 10;
        ControlPosition._map[11] = "TOP_RIGHT";
        ControlPosition.TOP_RIGHT = 11;
    })(exports.ControlPosition || (exports.ControlPosition = {}));
    var ControlPosition = exports.ControlPosition;
    var Marker = (function (_super) {
        __extends(Marker, _super);
        function Marker() {
            _super.apply(this, arguments);

        }
        return Marker;
    })(MVCObject);
    exports.Marker = Marker;    
    var MarkerImage = (function () {
        function MarkerImage() { }
        return MarkerImage;
    })();
    exports.MarkerImage = MarkerImage;    
    (function (SymbolPath) {
        SymbolPath._map = [];
        SymbolPath._map[0] = "BACKWARD_CLOSED_ARROW";
        SymbolPath.BACKWARD_CLOSED_ARROW = 0;
        SymbolPath._map[1] = "BACKWARD_OPEN_ARROW";
        SymbolPath.BACKWARD_OPEN_ARROW = 1;
        SymbolPath._map[2] = "CIRCLE";
        SymbolPath.CIRCLE = 2;
        SymbolPath._map[3] = "FORWARD_CLOSED_ARROW";
        SymbolPath.FORWARD_CLOSED_ARROW = 3;
        SymbolPath._map[4] = "FORWARD_OPEN_ARROW";
        SymbolPath.FORWARD_OPEN_ARROW = 4;
    })(exports.SymbolPath || (exports.SymbolPath = {}));
    var SymbolPath = exports.SymbolPath;
    (function (Animation) {
        Animation._map = [];
        Animation._map[0] = "BOUNCE";
        Animation.BOUNCE = 0;
        Animation._map[1] = "DROP";
        Animation.DROP = 1;
    })(exports.Animation || (exports.Animation = {}));
    var Animation = exports.Animation;
    var InfoWindow = (function (_super) {
        __extends(InfoWindow, _super);
        function InfoWindow() {
            _super.apply(this, arguments);

        }
        return InfoWindow;
    })(MVCObject);
    exports.InfoWindow = InfoWindow;    
    var Polyline = (function (_super) {
        __extends(Polyline, _super);
        function Polyline() {
            _super.apply(this, arguments);

        }
        return Polyline;
    })(MVCObject);
    exports.Polyline = Polyline;    
    var Polygon = (function (_super) {
        __extends(Polygon, _super);
        function Polygon() {
            _super.apply(this, arguments);

        }
        return Polygon;
    })(MVCObject);
    exports.Polygon = Polygon;    
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle() {
            _super.apply(this, arguments);

        }
        return Rectangle;
    })(MVCObject);
    exports.Rectangle = Rectangle;    
    var Circle = (function (_super) {
        __extends(Circle, _super);
        function Circle() {
            _super.apply(this, arguments);

        }
        return Circle;
    })(MVCObject);
    exports.Circle = Circle;    
    var GroundOverlay = (function (_super) {
        __extends(GroundOverlay, _super);
        function GroundOverlay() {
            _super.apply(this, arguments);

        }
        return GroundOverlay;
    })(MVCObject);
    exports.GroundOverlay = GroundOverlay;    
    var OverlayView = (function (_super) {
        __extends(OverlayView, _super);
        function OverlayView() {
            _super.apply(this, arguments);

        }
        return OverlayView;
    })(MVCObject);
    exports.OverlayView = OverlayView;    
    var MapCanvasProjection = (function (_super) {
        __extends(MapCanvasProjection, _super);
        function MapCanvasProjection() {
            _super.apply(this, arguments);

        }
        return MapCanvasProjection;
    })(MVCObject);
    exports.MapCanvasProjection = MapCanvasProjection;    
    var Geocoder = (function () {
        function Geocoder() { }
        return Geocoder;
    })();
    exports.Geocoder = Geocoder;    
    (function (GeocoderStatus) {
        GeocoderStatus._map = [];
        GeocoderStatus._map[0] = "ERROR";
        GeocoderStatus.ERROR = 0;
        GeocoderStatus._map[1] = "INVALID_REQUEST";
        GeocoderStatus.INVALID_REQUEST = 1;
        GeocoderStatus._map[2] = "OK";
        GeocoderStatus.OK = 2;
        GeocoderStatus._map[3] = "OVER_QUERY_LIMIT";
        GeocoderStatus.OVER_QUERY_LIMIT = 3;
        GeocoderStatus._map[4] = "REQUEST_DENIED";
        GeocoderStatus.REQUEST_DENIED = 4;
        GeocoderStatus._map[5] = "UNKNOWN_ERROR";
        GeocoderStatus.UNKNOWN_ERROR = 5;
        GeocoderStatus._map[6] = "ZERO_RESULTS";
        GeocoderStatus.ZERO_RESULTS = 6;
    })(exports.GeocoderStatus || (exports.GeocoderStatus = {}));
    var GeocoderStatus = exports.GeocoderStatus;
    (function (GeocoderLocationType) {
        GeocoderLocationType._map = [];
        GeocoderLocationType._map[0] = "APPROXIMATE";
        GeocoderLocationType.APPROXIMATE = 0;
        GeocoderLocationType._map[1] = "GEOMETRIC_CENTER";
        GeocoderLocationType.GEOMETRIC_CENTER = 1;
        GeocoderLocationType._map[2] = "RANGE_INTERPOLATED";
        GeocoderLocationType.RANGE_INTERPOLATED = 2;
        GeocoderLocationType._map[3] = "ROOFTOP";
        GeocoderLocationType.ROOFTOP = 3;
    })(exports.GeocoderLocationType || (exports.GeocoderLocationType = {}));
    var GeocoderLocationType = exports.GeocoderLocationType;
    var DirectionsRenderer = (function (_super) {
        __extends(DirectionsRenderer, _super);
        function DirectionsRenderer() {
            _super.apply(this, arguments);

        }
        return DirectionsRenderer;
    })(MVCObject);
    exports.DirectionsRenderer = DirectionsRenderer;    
    var DirectionsService = (function () {
        function DirectionsService() { }
        return DirectionsService;
    })();
    exports.DirectionsService = DirectionsService;    
    (function (TravelMode) {
        TravelMode._map = [];
        TravelMode._map[0] = "BICYCLING";
        TravelMode.BICYCLING = 0;
        TravelMode._map[1] = "DRIVING";
        TravelMode.DRIVING = 1;
        TravelMode._map[2] = "TRANSIT";
        TravelMode.TRANSIT = 2;
        TravelMode._map[3] = "WALKING";
        TravelMode.WALKING = 3;
    })(exports.TravelMode || (exports.TravelMode = {}));
    var TravelMode = exports.TravelMode;
    (function (UnitSystem) {
        UnitSystem._map = [];
        UnitSystem._map[0] = "IMPERIAL";
        UnitSystem.IMPERIAL = 0;
        UnitSystem._map[1] = "METRIC";
        UnitSystem.METRIC = 1;
    })(exports.UnitSystem || (exports.UnitSystem = {}));
    var UnitSystem = exports.UnitSystem;
    (function (DirectionsStatus) {
        DirectionsStatus._map = [];
        DirectionsStatus._map[0] = "INVALID_REQUEST";
        DirectionsStatus.INVALID_REQUEST = 0;
        DirectionsStatus._map[1] = "MAX_WAYPOINTS_EXCEEDED";
        DirectionsStatus.MAX_WAYPOINTS_EXCEEDED = 1;
        DirectionsStatus._map[2] = "NOT_FOUND";
        DirectionsStatus.NOT_FOUND = 2;
        DirectionsStatus._map[3] = "OK";
        DirectionsStatus.OK = 3;
        DirectionsStatus._map[4] = "OVER_QUERY_LIMIT";
        DirectionsStatus.OVER_QUERY_LIMIT = 4;
        DirectionsStatus._map[5] = "REQUEST_DENIED";
        DirectionsStatus.REQUEST_DENIED = 5;
        DirectionsStatus._map[6] = "UNKNOWN_ERROR";
        DirectionsStatus.UNKNOWN_ERROR = 6;
        DirectionsStatus._map[7] = "ZERO_RESULTS";
        DirectionsStatus.ZERO_RESULTS = 7;
    })(exports.DirectionsStatus || (exports.DirectionsStatus = {}));
    var DirectionsStatus = exports.DirectionsStatus;
    var ElevationService = (function () {
        function ElevationService() { }
        return ElevationService;
    })();
    exports.ElevationService = ElevationService;    
    (function (ElevationStatus) {
        ElevationStatus._map = [];
        ElevationStatus._map[0] = "INVALID_REQUEST";
        ElevationStatus.INVALID_REQUEST = 0;
        ElevationStatus._map[1] = "OK";
        ElevationStatus.OK = 1;
        ElevationStatus._map[2] = "OVER_QUERY_LIMIT";
        ElevationStatus.OVER_QUERY_LIMIT = 2;
        ElevationStatus._map[3] = "REQUEST_DENIED";
        ElevationStatus.REQUEST_DENIED = 3;
        ElevationStatus._map[4] = "UNKNOWN_ERROR";
        ElevationStatus.UNKNOWN_ERROR = 4;
    })(exports.ElevationStatus || (exports.ElevationStatus = {}));
    var ElevationStatus = exports.ElevationStatus;
    var MaxZoomService = (function () {
        function MaxZoomService() { }
        return MaxZoomService;
    })();
    exports.MaxZoomService = MaxZoomService;    
    (function (MaxZoomStatus) {
        MaxZoomStatus._map = [];
        MaxZoomStatus._map[0] = "ERROR";
        MaxZoomStatus.ERROR = 0;
        MaxZoomStatus._map[1] = "OK";
        MaxZoomStatus.OK = 1;
    })(exports.MaxZoomStatus || (exports.MaxZoomStatus = {}));
    var MaxZoomStatus = exports.MaxZoomStatus;
    var DistanceMatrixService = (function () {
        function DistanceMatrixService() { }
        return DistanceMatrixService;
    })();
    exports.DistanceMatrixService = DistanceMatrixService;    
    (function (DistanceMatrixStatus) {
        DistanceMatrixStatus._map = [];
        DistanceMatrixStatus._map[0] = "INVALID_REQUEST";
        DistanceMatrixStatus.INVALID_REQUEST = 0;
        DistanceMatrixStatus._map[1] = "MAX_DIMENSIONS_EXCEEDED";
        DistanceMatrixStatus.MAX_DIMENSIONS_EXCEEDED = 1;
        DistanceMatrixStatus._map[2] = "MAX_ELEMENTS_EXCEEDED";
        DistanceMatrixStatus.MAX_ELEMENTS_EXCEEDED = 2;
        DistanceMatrixStatus._map[3] = "OK";
        DistanceMatrixStatus.OK = 3;
        DistanceMatrixStatus._map[4] = "OVER_QUERY_LIMIT";
        DistanceMatrixStatus.OVER_QUERY_LIMIT = 4;
        DistanceMatrixStatus._map[5] = "REQUEST_DENIED";
        DistanceMatrixStatus.REQUEST_DENIED = 5;
        DistanceMatrixStatus._map[6] = "UNKNOWN_ERROR";
        DistanceMatrixStatus.UNKNOWN_ERROR = 6;
    })(exports.DistanceMatrixStatus || (exports.DistanceMatrixStatus = {}));
    var DistanceMatrixStatus = exports.DistanceMatrixStatus;
    (function (DistanceMatrixElementStatus) {
        DistanceMatrixElementStatus._map = [];
        DistanceMatrixElementStatus._map[0] = "NOT_FOUND";
        DistanceMatrixElementStatus.NOT_FOUND = 0;
        DistanceMatrixElementStatus._map[1] = "OK";
        DistanceMatrixElementStatus.OK = 1;
        DistanceMatrixElementStatus._map[2] = "ZERO_RESULTS";
        DistanceMatrixElementStatus.ZERO_RESULTS = 2;
    })(exports.DistanceMatrixElementStatus || (exports.DistanceMatrixElementStatus = {}));
    var DistanceMatrixElementStatus = exports.DistanceMatrixElementStatus;
    var MapTypeRegistry = (function (_super) {
        __extends(MapTypeRegistry, _super);
        function MapTypeRegistry() {
            _super.apply(this, arguments);

        }
        return MapTypeRegistry;
    })(MVCObject);
    exports.MapTypeRegistry = MapTypeRegistry;    
    var ImageMapType = (function () {
        function ImageMapType() { }
        return ImageMapType;
    })();
    exports.ImageMapType = ImageMapType;    
    var StyledMapType = (function () {
        function StyledMapType() { }
        return StyledMapType;
    })();
    exports.StyledMapType = StyledMapType;    
    (function (MapTypeStyleElementType) {
        MapTypeStyleElementType._map = [];
        MapTypeStyleElementType._map[0] = "all";
        MapTypeStyleElementType.all = 0;
        MapTypeStyleElementType._map[1] = "geometry";
        MapTypeStyleElementType.geometry = 1;
        MapTypeStyleElementType._map[2] = "labels";
        MapTypeStyleElementType.labels = 2;
    })(exports.MapTypeStyleElementType || (exports.MapTypeStyleElementType = {}));
    var MapTypeStyleElementType = exports.MapTypeStyleElementType;
    var BicyclingLayer = (function (_super) {
        __extends(BicyclingLayer, _super);
        function BicyclingLayer() {
            _super.apply(this, arguments);

        }
        return BicyclingLayer;
    })(MVCObject);
    exports.BicyclingLayer = BicyclingLayer;    
    var FusionTablesLayer = (function (_super) {
        __extends(FusionTablesLayer, _super);
        function FusionTablesLayer() {
            _super.apply(this, arguments);

        }
        return FusionTablesLayer;
    })(MVCObject);
    exports.FusionTablesLayer = FusionTablesLayer;    
    var KmlLayer = (function (_super) {
        __extends(KmlLayer, _super);
        function KmlLayer() {
            _super.apply(this, arguments);

        }
        return KmlLayer;
    })(MVCObject);
    exports.KmlLayer = KmlLayer;    
    (function (KmlLayerStatus) {
        KmlLayerStatus._map = [];
        KmlLayerStatus._map[0] = "DOCUMENT_NOT_FOUND";
        KmlLayerStatus.DOCUMENT_NOT_FOUND = 0;
        KmlLayerStatus._map[1] = "DOCUMENT_TOO_LARGE";
        KmlLayerStatus.DOCUMENT_TOO_LARGE = 1;
        KmlLayerStatus._map[2] = "FETCH_ERROR";
        KmlLayerStatus.FETCH_ERROR = 2;
        KmlLayerStatus._map[3] = "INVALID_DOCUMENT";
        KmlLayerStatus.INVALID_DOCUMENT = 3;
        KmlLayerStatus._map[4] = "INVALID_REQUEST";
        KmlLayerStatus.INVALID_REQUEST = 4;
        KmlLayerStatus._map[5] = "LIMITS_EXCEEDED";
        KmlLayerStatus.LIMITS_EXCEEDED = 5;
        KmlLayerStatus._map[6] = "OK";
        KmlLayerStatus.OK = 6;
        KmlLayerStatus._map[7] = "TIMED_OUT";
        KmlLayerStatus.TIMED_OUT = 7;
        KmlLayerStatus._map[8] = "UNKNOWN";
        KmlLayerStatus.UNKNOWN = 8;
    })(exports.KmlLayerStatus || (exports.KmlLayerStatus = {}));
    var KmlLayerStatus = exports.KmlLayerStatus;
    var TrafficLayer = (function (_super) {
        __extends(TrafficLayer, _super);
        function TrafficLayer() {
            _super.apply(this, arguments);

        }
        return TrafficLayer;
    })(MVCObject);
    exports.TrafficLayer = TrafficLayer;    
    var TransitLayer = (function (_super) {
        __extends(TransitLayer, _super);
        function TransitLayer() {
            _super.apply(this, arguments);

        }
        return TransitLayer;
    })(MVCObject);
    exports.TransitLayer = TransitLayer;    
    var StreetViewPanorama = (function () {
        function StreetViewPanorama() { }
        return StreetViewPanorama;
    })();
    exports.StreetViewPanorama = StreetViewPanorama;    
    (function (StreetViewStatus) {
        StreetViewStatus._map = [];
        StreetViewStatus._map[0] = "OK";
        StreetViewStatus.OK = 0;
        StreetViewStatus._map[1] = "UNKNOWN_ERROR";
        StreetViewStatus.UNKNOWN_ERROR = 1;
        StreetViewStatus._map[2] = "ZERO_RESULTS";
        StreetViewStatus.ZERO_RESULTS = 2;
    })(exports.StreetViewStatus || (exports.StreetViewStatus = {}));
    var StreetViewStatus = exports.StreetViewStatus;
    var event = (function () {
        function event() { }
        return event;
    })();
    exports.event = event;    
    var LatLng = (function () {
        function LatLng() { }
        return LatLng;
    })();
    exports.LatLng = LatLng;    
    var LatLngBounds = (function () {
        function LatLngBounds() { }
        return LatLngBounds;
    })();
    exports.LatLngBounds = LatLngBounds;    
    var Point = (function () {
        function Point() { }
        return Point;
    })();
    exports.Point = Point;    
    var Size = (function () {
        function Size() { }
        return Size;
    })();
    exports.Size = Size;    
    (function (geometry) {
        var encoding = (function () {
            function encoding() { }
            return encoding;
        })();
        geometry.encoding = encoding;        
        var spherical = (function () {
            function spherical() { }
            return spherical;
        })();
        geometry.spherical = spherical;        
        var poly = (function () {
            function poly() { }
            return poly;
        })();
        geometry.poly = poly;        
    })(exports.geometry || (exports.geometry = {}));
    var geometry = exports.geometry;
    (function (adsense) {
        var AdUnit = (function (_super) {
            __extends(AdUnit, _super);
            function AdUnit() {
                _super.apply(this, arguments);

            }
            return AdUnit;
        })(MVCObject);
        adsense.AdUnit = AdUnit;        
        (function (AdFormat) {
            AdFormat._map = [];
            AdFormat._map[0] = "BANNER";
            AdFormat.BANNER = 0;
            AdFormat._map[1] = "BUTTON";
            AdFormat.BUTTON = 1;
            AdFormat._map[2] = "HALF_BANNER";
            AdFormat.HALF_BANNER = 2;
            AdFormat._map[3] = "LARGE_RECTANGLE";
            AdFormat.LARGE_RECTANGLE = 3;
            AdFormat._map[4] = "LEADERBOARD";
            AdFormat.LEADERBOARD = 4;
            AdFormat._map[5] = "MEDIUM_RECTANGLE";
            AdFormat.MEDIUM_RECTANGLE = 5;
            AdFormat._map[6] = "SKYSCRAPER";
            AdFormat.SKYSCRAPER = 6;
            AdFormat._map[7] = "SMALL_RECTANGLE";
            AdFormat.SMALL_RECTANGLE = 7;
            AdFormat._map[8] = "SMALL_SQUARE";
            AdFormat.SMALL_SQUARE = 8;
            AdFormat._map[9] = "SQUARE";
            AdFormat.SQUARE = 9;
            AdFormat._map[10] = "VERTICAL_BANNER";
            AdFormat.VERTICAL_BANNER = 10;
            AdFormat._map[11] = "WIDE_SKYSCRAPER";
            AdFormat.WIDE_SKYSCRAPER = 11;
        })(adsense.AdFormat || (adsense.AdFormat = {}));
        var AdFormat = adsense.AdFormat;
    })(exports.adsense || (exports.adsense = {}));
    var adsense = exports.adsense;
    (function (panoramio) {
        var PanoramioLayer = (function (_super) {
            __extends(PanoramioLayer, _super);
            function PanoramioLayer() {
                _super.apply(this, arguments);

            }
            return PanoramioLayer;
        })(MVCObject);
        panoramio.PanoramioLayer = PanoramioLayer;        
    })(exports.panoramio || (exports.panoramio = {}));
    var panoramio = exports.panoramio;
    (function (places) {
        var Autocomplete = (function (_super) {
            __extends(Autocomplete, _super);
            function Autocomplete() {
                _super.apply(this, arguments);

            }
            return Autocomplete;
        })(MVCObject);
        places.Autocomplete = Autocomplete;        
        var PlacesService = (function () {
            function PlacesService() { }
            return PlacesService;
        })();
        places.PlacesService = PlacesService;        
        (function (PlacesServiceStatus) {
            PlacesServiceStatus._map = [];
            PlacesServiceStatus._map[0] = "INVALID_REQUEST";
            PlacesServiceStatus.INVALID_REQUEST = 0;
            PlacesServiceStatus._map[1] = "OK";
            PlacesServiceStatus.OK = 1;
            PlacesServiceStatus._map[2] = "OVER_QUERY_LIMIT";
            PlacesServiceStatus.OVER_QUERY_LIMIT = 2;
            PlacesServiceStatus._map[3] = "REQUEST_DENIED";
            PlacesServiceStatus.REQUEST_DENIED = 3;
            PlacesServiceStatus._map[4] = "UNKNOWN_ERROR";
            PlacesServiceStatus.UNKNOWN_ERROR = 4;
            PlacesServiceStatus._map[5] = "ZERO_RESULTS";
            PlacesServiceStatus.ZERO_RESULTS = 5;
        })(places.PlacesServiceStatus || (places.PlacesServiceStatus = {}));
        var PlacesServiceStatus = places.PlacesServiceStatus;
        (function (RankBy) {
            RankBy._map = [];
            RankBy._map[0] = "DISTANCE";
            RankBy.DISTANCE = 0;
            RankBy._map[1] = "PROMINENCE";
            RankBy.PROMINENCE = 1;
        })(places.RankBy || (places.RankBy = {}));
        var RankBy = places.RankBy;
    })(exports.places || (exports.places = {}));
    var places = exports.places;
    (function (drawing) {
        var DrawingManager = (function (_super) {
            __extends(DrawingManager, _super);
            function DrawingManager() {
                _super.apply(this, arguments);

            }
            return DrawingManager;
        })(MVCObject);
        drawing.DrawingManager = DrawingManager;        
        (function (OverlayType) {
            OverlayType._map = [];
            OverlayType._map[0] = "CIRCLE";
            OverlayType.CIRCLE = 0;
            OverlayType._map[1] = "MARKER";
            OverlayType.MARKER = 1;
            OverlayType._map[2] = "POLYGON";
            OverlayType.POLYGON = 2;
            OverlayType._map[3] = "POLYLINE";
            OverlayType.POLYLINE = 3;
            OverlayType._map[4] = "RECTANGLE";
            OverlayType.RECTANGLE = 4;
        })(drawing.OverlayType || (drawing.OverlayType = {}));
        var OverlayType = drawing.OverlayType;
    })(exports.drawing || (exports.drawing = {}));
    var drawing = exports.drawing;
    (function (weather) {
        var CloudLayer = (function (_super) {
            __extends(CloudLayer, _super);
            function CloudLayer() {
                _super.apply(this, arguments);

            }
            return CloudLayer;
        })(MVCObject);
        weather.CloudLayer = CloudLayer;        
        var WeatherLayer = (function (_super) {
            __extends(WeatherLayer, _super);
            function WeatherLayer() {
                _super.apply(this, arguments);

            }
            return WeatherLayer;
        })(MVCObject);
        weather.WeatherLayer = WeatherLayer;        
        (function (TemperatureUnit) {
            TemperatureUnit._map = [];
            TemperatureUnit._map[0] = "CELSIUS";
            TemperatureUnit.CELSIUS = 0;
            TemperatureUnit._map[1] = "FAHRENHEIT";
            TemperatureUnit.FAHRENHEIT = 1;
        })(weather.TemperatureUnit || (weather.TemperatureUnit = {}));
        var TemperatureUnit = weather.TemperatureUnit;
        (function (WindSpeedUnit) {
            WindSpeedUnit._map = [];
            WindSpeedUnit._map[0] = "KILOMETERS_PER_HOUR";
            WindSpeedUnit.KILOMETERS_PER_HOUR = 0;
            WindSpeedUnit._map[1] = "METERS_PER_SECOND";
            WindSpeedUnit.METERS_PER_SECOND = 1;
            WindSpeedUnit._map[2] = "MILES_PER_HOUR";
            WindSpeedUnit.MILES_PER_HOUR = 2;
        })(weather.WindSpeedUnit || (weather.WindSpeedUnit = {}));
        var WindSpeedUnit = weather.WindSpeedUnit;
        (function (LabelColor) {
            LabelColor._map = [];
            LabelColor._map[0] = "BLACK";
            LabelColor.BLACK = 0;
            LabelColor._map[1] = "WHITE";
            LabelColor.WHITE = 1;
        })(weather.LabelColor || (weather.LabelColor = {}));
        var LabelColor = weather.LabelColor;
    })(exports.weather || (exports.weather = {}));
    var weather = exports.weather;
    (function (visualization) {
        var HeatmapLayer = (function (_super) {
            __extends(HeatmapLayer, _super);
            function HeatmapLayer() {
                _super.apply(this, arguments);

            }
            return HeatmapLayer;
        })(MVCObject);
        visualization.HeatmapLayer = HeatmapLayer;        
        var MouseEvent = (function () {
            function MouseEvent() { }
            return MouseEvent;
        })();
        visualization.MouseEvent = MouseEvent;        
        var MapsEventListener = (function () {
            function MapsEventListener() { }
            return MapsEventListener;
        })();
        visualization.MapsEventListener = MapsEventListener;        
    })(exports.visualization || (exports.visualization = {}));
    var visualization = exports.visualization;
})
