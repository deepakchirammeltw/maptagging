import * as fabric from 'fabric';
import { Point } from 'fabric'; // v6

class MapTaggingComponent {
  private rect: fabric.Rect | undefined;
  private boundingBox: {
    top: number; left: number; width: number; height: number
  } = {
    top: 210, left: 420, width: 120, height: 90
  };// default pointing to TW HYD office boundary

  private geofenceCoords: {
    pointA: { latitude: number; longitude: number },
    pointB: { latitude: number; longitude: number },
    pointC: { latitude: number; longitude: number },
    pointD: { latitude: number; longitude: number }
  } = {
    pointA: { latitude: 17.425665, longitude: 78.334189 },
    pointB: { latitude: 17.425665, longitude: 78.343362 },
    pointC: { latitude: 17.421448, longitude: 78.343362 },
    pointD: { latitude: 17.421448, longitude: 78.334189 }
  };

  private readonly canvas: fabric.Canvas;
  private readonly mapImageSource: string = '/hyd-map.png';
  private readonly mapCoords: {
    bottomLeft: { latitude: number; longitude: number },
    bottomRight: { latitude: number; longitude: number },
    topLeft: { latitude: number; longitude: number },
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
    this.rect = new fabric.Rect({
      angle: 0,
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: 6,
      hasBorders: false,
      hasControls: true,
      lockRotation: true,//Set to false, for enabling rotations
      transparentCorners: false,
      top: boundingBox.top,
      left: boundingBox.left,
      width: boundingBox.width,
      height: boundingBox.height
    });
    this.rect.on('mouseup:before', () => {
      let rect = this.rect!!;
      this.setupNewBoundary(rect);
    });
    this.canvas.add(this.rect);
  }

  private setupNewBoundary(rect: fabric.Rect): void {
    if (rect.scaleX != 1) {
      rect.width = rect.width * rect.scaleX;
      rect.scaleX = 1;
    }
    if (rect.scaleY != 1) {
      rect.height = rect.height * rect.scaleY;
      rect.scaleY = 1;
    }
    this.boundingBox.top = rect.top;
    this.boundingBox.left = rect.left;
    this.boundingBox.width = rect.width;
    this.boundingBox.height = rect.height;
    console.log(this.boundingBox);
    this.populateGeofenceCoords(rect.getCoords());
  }

  private populateGeofenceCoords(coords: Point[]) {
    let pointA: { latitude: number, longitude: number } = {
      latitude: this.mapCoords.topLeft.latitude - ((this.mapCoords.topLeft.latitude - this.mapCoords.bottomLeft.latitude) * coords[0].y / 400),
      longitude: this.mapCoords.topLeft.longitude + (((this.mapCoords.topRight.longitude - this.mapCoords.topLeft.longitude)) * coords[0].x / 800)
    };
    let pointB: { latitude: number, longitude: number } = {
      latitude: this.mapCoords.topLeft.latitude - ((this.mapCoords.topLeft.latitude - this.mapCoords.bottomLeft.latitude) * coords[1].y / 400),
      longitude: this.mapCoords.topLeft.longitude + (((this.mapCoords.topRight.longitude - this.mapCoords.topLeft.longitude)) * coords[1].x / 800)
    };
    let pointC: { latitude: number, longitude: number } = {
      latitude: this.mapCoords.topLeft.latitude - ((this.mapCoords.topLeft.latitude - this.mapCoords.bottomLeft.latitude) * coords[2].y / 400),
      longitude: this.mapCoords.topLeft.longitude + (((this.mapCoords.topRight.longitude - this.mapCoords.topLeft.longitude)) * coords[2].x / 800)
    };
    let pointD: { latitude: number, longitude: number } = {
      latitude: this.mapCoords.topLeft.latitude - ((this.mapCoords.topLeft.latitude - this.mapCoords.bottomLeft.latitude) * coords[3].y / 400),
      longitude: this.mapCoords.topLeft.longitude + (((this.mapCoords.topRight.longitude - this.mapCoords.topLeft.longitude)) * coords[3].x / 800)
    };
    this.geofenceCoords = { pointA, pointB, pointC, pointD };
    this.onGeofenceCoordsModified();
  }

  public onGeofenceCoordsModified() {
    //TODO: Save to UDS->LDM DB and reflect in config_policy
    console.log(this.geofenceCoords);
  }

  private populateBoundingBox(geofence: {
    pointA: { latitude: number; longitude: number },
    pointB: { latitude: number; longitude: number },
    pointC: { latitude: number; longitude: number },
    pointD: { latitude: number; longitude: number }
  }) {
    //TODO, if co-ordinates previously set
  }
}

let mapTaggingComponent: MapTaggingComponent = new MapTaggingComponent();
let geofenceCoords = null; //provide geofenceCoords: {
//     pointA: { latitude: number; longitude: number },
//     pointB: { latitude: number; longitude: number },
//     pointC: { latitude: number; longitude: number },
//     pointD: { latitude: number; longitude: number }
//   } in the above format, if available/set previously
mapTaggingComponent.render(geofenceCoords);
