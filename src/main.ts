import * as fabric from 'fabric';
import { Point } from 'fabric'; // v6

class MapTaggingComponent {
  private canvas: fabric.Canvas;
  private rect: fabric.Rect | undefined;
  private mapImageSource: string = '/hyd-map.png';
  private boundingBox: { top: number; left: number; width: number; height: number } = { top: 210, left: 420, width: 120, height: 90 };// default pointing to TW HYD office
  private geofenceCoords: {
    pointA: { latitude: number; longitude: number };
    pointB: { latitude: number; longitude: number };
    pointC: { latitude: number; longitude: number };
    pointD: { latitude: number; longitude: number }
  } = {
    pointA: { latitude: 17.425665, longitude: 78.334189 },
    pointB: { latitude: 17.425665, longitude: 78.343362 },
    pointC: { latitude: 17.421448, longitude: 78.343362 },
    pointD: { latitude: 17.421448, longitude: 78.334189 }
  }
  private mapCoords: {
    bottomLeft: { latitude: number; longitude: number };
    bottomRight: { latitude: number; longitude: number };
    topLeft: { latitude: number; longitude: number };
    topRight: { latitude: number; longitude: number }
  } = {                                                           //Map - latitude range: 17.425665 - 17.421448 & longitude range : 78.334189 - 78.343362
    topLeft: { latitude: 17.425665, longitude: 78.334189 },       //A
    topRight: { latitude: 17.425665, longitude: 78.343362 },      //B
    bottomRight: { latitude: 17.421448, longitude: 78.343362 },   //C
    bottomLeft: { latitude: 17.421448, longitude: 78.334189 }     //D
  };

  constructor() {
    this.canvas = new fabric.Canvas('map-canvas', { 'selection': false });
  }

  public render(geofenceCoords: {
    pointA: { latitude: number; longitude: number };
    pointB: { latitude: number; longitude: number };
    pointC: { latitude: number; longitude: number };
    pointD: { latitude: number; longitude: number }
  } | null) {
    if (geofenceCoords != null) {
      this.populateBoundingBox(geofenceCoords);
    }
    this.setupCanvasImage(this.canvas);
    this.drawGeofenceBoundary(this.boundingBox);
  }

  private setupCanvasImage(canvas: fabric.Canvas): void {
    let mapImage: HTMLImageElement = new Image();
    mapImage.src = this.mapImageSource;
    mapImage.onload = () => {
      canvas.backgroundImage = new fabric.Image(mapImage);
      canvas.renderAll();
    };
  }

  private drawGeofenceBoundary(boundingBox: { top: number, left: number, width: number, height: number }): void {
    let rect = new fabric.Rect({
      angle: 0,
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: 5,
      hasBorders: false,
      hasControls: true,
      lockRotation: true,//Set to false, for enabling rotations
      transparentCorners: false,
      top: boundingBox.top,
      left: boundingBox.left,
      width: boundingBox.width,
      height: boundingBox.height
    });
    rect.on('mouseup:before', () => {
      this.setupNewBoundary(rect);
    });
    this.rect = rect;
    this.canvas.add(this.rect);
  }

  private setupNewBoundary(rect: fabric.Rect): void {
    this.boundingBox.top = rect.top;
    this.boundingBox.left = rect.left;
    this.boundingBox.width = rect.width;
    this.boundingBox.height = rect.height;
    console.log(this.boundingBox);
    this.populateGeofenceCoords(rect.getCoords());
    this.onGeofenceCoordsModified();
  }

  private populateBoundingBox(geofenceCoords: {
    pointA: { latitude: number; longitude: number };
    pointB: { latitude: number; longitude: number };
    pointC: { latitude: number; longitude: number };
    pointD: { latitude: number; longitude: number }
  }) {
    //TODO
  }

  private populateGeofenceCoords(coords: Point[]) {
    //TODO
  }

  public onGeofenceCoordsModified() {
    //TODO: Save to UDS->LDM DB and reflect in config_policy
    console.log(this.geofenceCoords);
  }
}

let mapTaggingComponent: MapTaggingComponent = new MapTaggingComponent();
//provide geofenceCoords: {
//     pointA: { latitude: number; longitude: number };
//     pointB: { latitude: number; longitude: number };
//     pointC: { latitude: number; longitude: number };
//     pointD: { latitude: number; longitude: number }
//   } if available/set
let geofenceCoords = null;
mapTaggingComponent.render(geofenceCoords);
