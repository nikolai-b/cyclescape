/**
 *
 * Using an external set of controls to edit features on the openlayers map.
 *
 */
MapEdit = {
  map: null,
  geo_field: null,
  point_zoom: null,
  area_only: null,
  current_control: null,

  init: function(m, v, g, p, a) {
    this.map = m;
    this.vectorlayer = v;
    this.geo_field = g;
    this.point_zoom = p;
    this.area_only = a;
    this.registerEvents();
    this.addControls();
    this.positionMap();
  },

  registerEvents: function() {
    this.vectorlayer.events.on({featureadded: this.feature_added});
    this.vectorlayer.events.on({featuremodified: this.feature_modified});
  },

  addControls: function() {
    // Add the controls to openlayers
    var controls = [
        new OpenLayers.Control.DrawFeature(this.vectorlayer, OpenLayers.Handler.Point, {
            id: "point",
            handlerOptions: {citeCompliant: this.citeCompliant}
        }),
        new OpenLayers.Control.DrawFeature(this.vectorlayer, OpenLayers.Handler.Path, {
            id: "path",
            handlerOptions: {citeCompliant: this.citeCompliant}
        }),
        new OpenLayers.Control.DrawFeature(this.vectorlayer, OpenLayers.Handler.Polygon, {
            id: "polygon",
            handlerOptions: {citeCompliant: this.citeCompliant}
        }),
        new OpenLayers.Control.ModifyFeature(this.vectorlayer, { id: "modify" })
      ];
    this.map.addControls(controls);
    // bind them to the buttons
    $(".map-tools-overlay li.area a").click(function() { MapEdit.activate_control("polygon"); });
    $(".map-tools-overlay li.route a").click(function() { MapEdit.activate_control("path"); });
    $(".map-tools-overlay li.point a").click(function() { MapEdit.activate_control("point"); });
    $(".map-tools-overlay a.edit-undo").click(function() { MapEdit.undo_clicked(); });
    $(".map-tools-overlay a.edit-clear").click(function() { MapEdit.clear_clicked(); });
    // Activate the default editing control
    if (this.area_only) {
      this.current_control = this.map.getControl("polygon");
      this.current_control.activate();
      $(".map-tools-overlay li.point").remove();
      $(".map-tools-overlay li.route").remove();
      $(".map-tools-overlay .pane.point").remove();
      $(".map-tools-overlay .pane.route").remove();
    } else {
      this.current_control = this.map.getControl("polygon");
      this.current_control.activate();
    }
  },

  positionMap: function() {
    // This is also triggered if the user refreshes the page, and the browser persists
    // the hidden form value. Ensures the map ends up where the feature is.
    if ( document.getElementById(this.geo_field).value != '' ) {
      vectorlayer.addFeatures( format.read(document.getElementById(this.geo_field).value));
      geom = vectorlayer.features[0].geometry;
      if (geom.CLASS_NAME == 'OpenLayers.Geometry.Point') {
        map.setCenter(new OpenLayers.LonLat(geom.x, geom.y), point_zoom);
      } else {
        map.zoomToExtent(geom.bounds);
      }
    }
  },

  activate_control: function(id) {
    controls = ["point", "path", "polygon"]
    this.clear_features();
    for (i in controls) {
      if (controls[i] == id) {
        this.current_control = this.map.getControl(controls[i]);
        this.current_control.activate();
      } else {
        this.map.getControl(controls[i]).deactivate();
      }
    }
  },

  undo_clicked: function() {
    if (this.current_control) {
      this.current_control.undo();
    }
  },

  clear_clicked: function() {
    if (this.current_control.active) {
      this.current_control.cancel();
    } else {
      this.clear_features();
      this.current_control.activate();
    }
  },

  serialize: function(feature) {
    var str = format.write(feature);
    document.getElementById(this.geo_field).value = str;
  },

  feature_added: function(event) {
    this.map.getControl("polygon").deactivate();
    this.map.getControl("path").deactivate();
    this.map.getControl("point").deactivate();
    var modify = this.map.getControl("modify");
    modify.activate();
    modify.selectControl.select(event.feature);
    MapEdit.serialize(event.feature);
  },

  feature_modified: function(event) {
    MapEdit.serialize(event.feature);
  },

  clear_features: function(event) {
    this.map.getControl("modify").deactivate();
    document.getElementById(this.geo_field).value = "";
    vectorlayer.removeAllFeatures();
  }
};