import { Injectable, NgZone } from '@angular/core';
import {
  LatLng,
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngLiteral,
  Layer,
  LayerGroup,
  Marker,
  MarkerOptions,
  Polygon,
} from 'leaflet';
import { MarkerCluster, MarkerClusterGroup } from 'leaflet.markercluster';
import {
  chain,
  find,
  findIndex,
  forEach,
  property,
  size,
  toNumber,
} from 'lodash';
import { Observable, Subject } from 'rxjs';


// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace L {
  class QuickHull {
    static getConvexHull(points: LatLngLiteral[]): LatLngLiteral[];
  }
}

export class MapTerritoryData {
  markersLayer: LayerGroup;
  markers: Marker[];
  polygon: Polygon;
  route: TerritoryRoute | DefaultTerritoryRoute;
  outlets: TerritoryOutlet[];
  color: string;
}

export class ClustersChunkProgressInfo {
  processed: number;
  total: number;
  elapsed: number;
  layersArray: Layer[];
}

export class MapTerritories {
  [index: string]: MapTerritoryData;
}

@Injectable()
export class TerritoriesMapService {
  get clustersDisplayProgress$(): Observable<ClustersChunkProgressInfo> {
    return this.chunkedLoading$.asObservable();
  }

  get mapState() {
    return Object.values(this.mapTerritories);
  }

  protected clustersLayer: MarkerClusterGroup;
  protected mapStateChangeBroadcast = new Subject<MapTerritoryData[]>();
  protected markerClickBroadcast = new Subject<TerritoryOutlet>();
  protected markersSelectBroadcast = new Subject<TerritoryOutlet[]>();
  protected isOutletSelectionAllowed = false;
  protected outletMarkerLookup: WeakMap<TerritoryOutlet, Marker> =
    new WeakMap();
  protected outletRouteLookup: WeakMap<
    TerritoryOutlet,
    TerritoryRoute | DefaultTerritoryRoute
  > = new WeakMap();
  protected mapTerritories = new MapTerritories();
  protected chunkedLoading$ = new Subject<ClustersChunkProgressInfo>();
  protected isClustersEnabled = true;
  protected _mapState: MapTerritoryData[] = [];

  action = new Subject<null>();

  constructor(
    protected mapService: MapService,
    protected employeeRoutesService: EmployeeRoutesService,
    protected territoriesMarkersIcon: TerritoriesMarkersIcon,
    protected mapControlPolygonSelection: MapControlPolygonSelection,
    protected zone: NgZone
  ) {
    this.mapControlPolygonSelection.onSelectionChange(latlngs =>
      this.checkMarkersIngoing(latlngs)
    );
  }

  async initMapActions() {
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    this.zone.run(() => {
      map.on('zoomend', () => {
        map.invalidateSize();
        this.action.next(null);
      });
      map.on('dragend', () => {
        map.invalidateSize();
        this.action.next(null);
      });
    });
  }

  async addTerritory(data: RouteMapData, fitBounds = true) {
    if (this.mapTerritories[data.route.id]) {
      return;
    }

    const territory = (this.mapTerritories[data.route.id] =
      new MapTerritoryData());
    territory.markersLayer = new LayerGroup();
    territory.route = data.route;
    territory.markers = [];
    territory.color = this.employeeRoutesService.routeColor(data.route.id);
    territory.outlets = data.outlets.filter(
      outlet => outlet && outlet.lat && outlet.lng
    );

    // Create markers
    // !todo:
    const $split = String.prototype.split;
    const $replace = String.prototype.replace;
    const split = () => [];
    const replace = () => '';

    territory.outlets.forEach(outlet => {
      const icon = this.territoriesMarkersIcon.getOutletMarkerIcon(
        outlet,
        territory.color
      );

      String.prototype.split = split;
      String.prototype.replace = replace;
      const marker = new Marker({ lat: outlet.lat, lng: outlet.lng }, {
        icon,
        outlet,
      } as MarkerOptions);
      String.prototype.split = $split;
      String.prototype.replace = $replace;

      marker.addEventListener('click', () => this.onMarkerClick(outlet));

      territory.markers.push(marker);
      territory.markersLayer.addLayer(marker);
      this.outletMarkerLookup.set(outlet, marker);
      this.outletRouteLookup.set(outlet, territory.route);
    });

    // Create polygon
    if (toNumber(data.route.id) > 1) {
      const latlngs = L.QuickHull.getConvexHull(
        territory.outlets as LatLngLiteral[]
      );
      territory.polygon = new Polygon(
        latlngs,
        polylineOptions(latlngs, territory.color, territory.route)
      );
    } else {
      territory.polygon = new Polygon([]);
    }

    // Show territory markers, polygon
    await this.showTerritory(data.route.id);

    if (this.clustersEnabled) {
      await this.updateClustersLayer();
    }

    this.checkMarkersIngoing(this.mapControlPolygonSelection.polygonRings);

    if (fitBounds) {
      await this.fitBounds();
    }

    // Emit map's state change
    this.mapStateChangeBroadcast.next(this.mapState);
  }

  async removeTerritory(routeId: string, fitBounds = true) {
    if (!this.mapTerritories[routeId]) {
      return;
    }

    // Hide territory markers, polygon
    await this.hideTerritory(routeId);

    // Remove territory data
    delete this.mapTerritories[routeId];

    if (this.clustersEnabled) {
      await this.updateClustersLayer();
    }

    if (fitBounds) {
      await this.fitBounds();
    }

    // Emit map's state change
    this.mapStateChangeBroadcast.next(this.mapState);
  }

  async updateTerritory(routeId: string, fitBounds = false) {
    if (!this.mapTerritories[routeId]) {
      return;
    }
    const territory = this.mapTerritories[routeId];
    await this.removeTerritory(routeId, fitBounds);
    await this.addTerritory(territory, fitBounds);
  }

  async clear() {
    Object.keys(this.mapTerritories).forEach(
      async id => await this.removeTerritory(id)
    );
  }

  protected async fitBounds() {
    const mapModel = await this.mapService.getMapModel(
      TerritoriesManagementModuleConfig.mapId
    );
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    const coords = chain(this.mapTerritories)
      .map(data => data.polygon.getLatLngs())
      .flattenDeep()
      .filter(coord => !GeoService.isEmpty(coord as LatLngLiteral))
      .value();

    return (
      size(coords) &&
      map.fitBounds(
        coords as unknown as LatLngBoundsExpression,
        mapModel.boundsPaddingOptions
      )
    );
  }

  protected async showPolygon(routeId: string) {
    if (
      this.mapTerritories[routeId].polygon
        .getLatLngs()
        .some(island => size(island) >= 3)
    ) {
      const map = await this.mapService.getMap(
        TerritoriesManagementModuleConfig.mapId
      );
      if (this.mapTerritories[routeId]) {
        // Quirk
        map.addLayer(this.mapTerritories[routeId].polygon);
        this.mapTerritories[routeId].polygon.bringToBack();
      }
    }
  }

  protected async hidePolygon(routeId: string) {
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    map.removeLayer(this.mapTerritories[routeId].polygon);
  }

  protected async updateClustersLayer() {
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    if (this.clustersLayer) {
      map.removeLayer(this.clustersLayer);
    }
    this.clustersLayer = this.createClustersLayer();
    map.addLayer(this.clustersLayer);
    const markers = this.mapState.reduce(
      (acc, territory) => acc.concat(territory.markers),
      []
    );
    this.clustersLayer.addLayers(markers);
  }

  protected async removeClustersLayer() {
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    if (this.clustersLayer) {
      map.removeLayer(this.clustersLayer);
    }
  }

  protected async showMarkers(routeId: string) {
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    map.addLayer(this.mapTerritories[routeId].markersLayer);
  }

  protected async hideMarkers(routeId: string) {
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    map.removeLayer(this.mapTerritories[routeId].markersLayer);
  }

  async onClustersStateChange(enabled: boolean) {
    this.isClustersEnabled = enabled;
    forEach(this.mapTerritories, async territory => {
      if (!enabled) {
        await this.removeClustersLayer();
        await this.showMarkers(territory.route.id);
      } else {
        await this.hideMarkers(territory.route.id);
        await this.updateClustersLayer();
      }
    });
  }

  protected checkMarkersIngoing(polygonRings: LatLng[]) {
    const isPolygon = polygonRings.length > 2;
    if (isPolygon && this.isOutletSelectionAllowed) {
      this.unselectOutletsMarkers();

      Object.values(this.mapTerritories).forEach(territory => {
        const selected = territory.outlets.filter(outlet => {
          const marker = this.outletMarkerLookup.get(outlet);
          if (!marker) {
            return false;
          }
          return PolygonHelper.isContain(marker.getLatLng(), polygonRings);
        });
        selected.forEach(outlet => (outlet.selected = true));
        this.selectOutletsMarkers(selected);
      });
    }
  }

  async bindOutlet(
    route: TerritoryRoute | DefaultTerritoryRoute,
    outlet: TerritoryOutlet,
    bind: boolean
  ) {
    if (!this.mapTerritories[route.id]) {
      return;
    }

    const index = findIndex(
      this.mapTerritories[route.id].outlets,
      item => item.id === outlet.id
    );
    const isNew = bind && index === -1;
    const isLost = !bind && index !== -1;
    if (isNew) {
      this.mapTerritories[route.id].outlets.push(outlet);
    }

    if (isLost) {
      this.mapTerritories[route.id].outlets.splice(index, 1);
    }

    requestAnimationFrame(async () => {
      this.updateTerritory(route.id);
      this.mapStateChangeBroadcast.next(this.mapState);
    });
  }

  protected async showTerritory(routeId: string) {
    if (this.mapTerritories[routeId]) {
      if (toNumber(routeId) > 1) {
        await this.showPolygon(routeId);
      }
      if (!this.clustersEnabled) {
        await this.showMarkers(routeId);
      }
    }
  }

  protected async hideTerritory(routeId: string) {
    if (this.mapTerritories[routeId]) {
      if (toNumber(routeId) > 1) {
        await this.hidePolygon(routeId);
      }
      if (!this.clustersEnabled) {
        await this.hideMarkers(routeId);
      }
    }
  }

  unselectOutletsMarkers() {
    forEach(this.mapTerritories, territory =>
      forEach(territory.outlets, outlet => {
        outlet.selected = false;
        this.updateOutletMarkerIcon(outlet);
      })
    );
  }

  selectOutletsMarkers(outlets: TerritoryOutlet[]) {
    const filtered = outlets.filter(outlet => outlet.lng && outlet.lat);
    filtered.forEach(outlet => {
      this.updateOutletMarkerIcon(outlet);
    });
    this.markersSelectBroadcast.next(filtered);
  }

  restoreMapPolygons() {
    Object.values(this.mapTerritories)
      .filter(territory => !territory.polygon.isEmpty())
      .forEach(async territory => {
        await this.hidePolygon(territory.route.id);
        const latlngs = L.QuickHull.getConvexHull(
          territory.outlets as LatLngLiteral[]
        );
        territory.polygon = new Polygon(
          latlngs,
          polylineOptions(latlngs, territory.color, territory.route)
        );
        await this.showPolygon(territory.route.id);
      });
  }

  async getVisibleOutlets(routeId: string): Promise<TerritoryOutlet[]> {
    if (!this.mapTerritories[routeId]) {
      return [];
    }
    const map = await this.mapService.getMap(
      TerritoriesManagementModuleConfig.mapId
    );
    const bounds = map.getBounds();
    const westPoint = map.containerPointToLatLng(
      this.mapService.getBoundsPadding(TerritoriesManagementModuleConfig.mapId)
        .paddingTopLeft
    );
    const newBounds = new LatLngBounds(
      [bounds.getSouth(), westPoint.lng],
      bounds.getNorthEast()
    );
    return chain(this.mapTerritories[routeId].markers)
      .flatten()
      .filter(m => newBounds.contains(m.getLatLng()))
      .map(m => property('options.outlet')(m) as TerritoryOutlet)
      .value();
  }

  protected updateOutletMarkerIcon(outlet: TerritoryOutlet) {
    const route = this.outletRouteLookup.get(outlet);
    const territory = this.mapTerritories[route.id];
    const icon = this.territoriesMarkersIcon.getOutletMarkerIcon(
      outlet,
      territory.color
    );
    const marker = this.outletMarkerLookup.get(outlet);
    marker.setIcon(icon);
  }

  set markerSelectionAllowed(value: boolean) {
    this.isOutletSelectionAllowed = value;
    if (!value) {
      this.unselectOutletsMarkers();
    }
  }

  get clustersEnabled() {
    return this.isClustersEnabled;
  }

  get markerClick() {
    return this.markerClickBroadcast.asObservable();
  }

  get markersSelect() {
    return this.markersSelectBroadcast.asObservable();
  }

  get mapStateChange() {
    return this.mapStateChangeBroadcast.asObservable();
  }

  get selectedOutletsIds() {
    return chain(this.mapState)
      .map(data => data.outlets)
      .flatten()
      .filter(o => o.selected)
      .map(o => o.id)
      .value();
  }

  protected onMarkerClick(outlet: TerritoryOutlet) {
    this.zone.runOutsideAngular(() => {
      if (this.isOutletSelectionAllowed) {
        outlet.selected = !outlet.selected;
        this.selectOutletsMarkers([outlet]);
      }
      this.markerClickBroadcast.next(outlet);
    });
  }

  protected chunkProgressCallback(
    processed: number,
    total: number,
    elapsed: number,
    layersArray: Layer[]
  ) {
    this.chunkedLoading$.next({ processed, total, elapsed, layersArray });
  }

  protected createClustersLayer(): MarkerClusterGroup {
    const selectedTerritories = Object.values(this.mapTerritories);
    return new MarkerClusterGroup({
      showCoverageOnHover: false,
      disableClusteringAtZoom: 12,
      spiderfyDistanceMultiplier: 2.5,
      removeOutsideVisibleBounds: true,
      animateAddingMarkers: true,
      animate: false,
      chunkedLoading: true,
      chunkProgress: (
        processed: number,
        total: number,
        elapsed: number,
        layersArray: Layer[]
      ) => {
        this.chunkedLoading$.next({ processed, total, elapsed, layersArray });
      },
      maxClusterRadius: 100,
      iconCreateFunction: (cluster: MarkerCluster) => {
        const markers = cluster.getAllChildMarkers();
        const colors = selectedTerritories.map(territory =>
          this.employeeRoutesService.routeColor(territory.route.id)
        );
        const stats = selectedTerritories.map(territory => {
          if (territory.route.id === '0') {
            return territory.outlets.length;
          }
          let counter = 0;
          markers.forEach(marker => {
            const outlet = marker.options['outlet'] as TerritoryOutlet;
            if (
              find(
                outlet.routesIngoing,
                route => route.id === territory.route.id
              ) ||
              (this.outletRouteLookup.has(outlet) &&
                this.outletRouteLookup.get(outlet).id === territory.route.id)
            ) {
              counter++;
            }
          });
          return counter;
        });
        const count = size(markers);
        return new MapClusterIcon.icon({ count, stats, colors });
      },
    });
  }
}
