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
    if (this.rect != null) {
      this.canvas.remove(this.rect);
    }
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
    this.rect.on('mouseup:before', (): void => {
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
    this.populateGeofenceCoords(rect.getCoords());
  }

  private populateGeofenceCoords(coords: Point[]): void {
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

  public onGeofenceCoordsModified(): void {
    //TODO: Save to UDS->LDM DB and reflect in config_policy
    console.log('onGeofenceCoordsModified::');
    console.log(this.geofenceCoords);
    console.log(this.boundingBox);
  }

  private populateBoundingBox(geofence: {
    pointA: { latitude: number; longitude: number },
    pointB: { latitude: number; longitude: number },
    pointC: { latitude: number; longitude: number },
    pointD: { latitude: number; longitude: number }
  }): void {
    // validate first that the co-ordinates are within the map boundary
    if (geofence.pointA.latitude <= this.mapCoords.topLeft.latitude &&
      geofence.pointA.latitude >= this.mapCoords.bottomLeft.latitude &&
      geofence.pointA.longitude >= this.mapCoords.topLeft.longitude &&
      geofence.pointA.longitude <= this.mapCoords.topRight.longitude &&
      geofence.pointB.latitude <= this.mapCoords.topLeft.latitude &&
      geofence.pointB.latitude >= this.mapCoords.bottomLeft.latitude &&
      geofence.pointB.longitude >= this.mapCoords.topLeft.longitude &&
      geofence.pointB.longitude <= this.mapCoords.topRight.longitude &&
      geofence.pointC.latitude <= this.mapCoords.topLeft.latitude &&
      geofence.pointC.latitude >= this.mapCoords.bottomLeft.latitude &&
      geofence.pointC.longitude >= this.mapCoords.topLeft.longitude &&
      geofence.pointC.longitude <= this.mapCoords.topRight.longitude &&
      geofence.pointD.latitude <= this.mapCoords.topLeft.latitude &&
      geofence.pointD.latitude >= this.mapCoords.bottomLeft.latitude &&
      geofence.pointD.longitude >= this.mapCoords.topLeft.longitude &&
      geofence.pointD.longitude <= this.mapCoords.topRight.longitude) {
      this.boundingBox.top = ((this.mapCoords.topLeft.latitude - geofence.pointA.latitude) / (this.mapCoords.topLeft.latitude - this.mapCoords.bottomLeft.latitude)) * 400;
      this.boundingBox.left = ((geofence.pointA.longitude - this.mapCoords.topLeft.longitude) / (this.mapCoords.topRight.longitude - this.mapCoords.topLeft.longitude)) * 800;
      this.boundingBox.width = (((geofence.pointB.longitude - this.mapCoords.topLeft.longitude) / (this.mapCoords.topRight.longitude - this.mapCoords.topLeft.longitude)) * 800) - this.boundingBox.left;
      this.boundingBox.height = (((this.mapCoords.topLeft.latitude - geofence.pointD.latitude) / (this.mapCoords.topLeft.latitude - this.mapCoords.bottomLeft.latitude)) * 400) - this.boundingBox.top;
    }
  }
}

let mapTaggingComponent: MapTaggingComponent = new MapTaggingComponent();
// let geofenceCoords = {
//   "pointA": {
//     "latitude": 17.42560132747525,
//     "longitude": 78.33679400012024
//   },
//   "pointB": {
//     "latitude": 17.42560132747525,
//     "longitude": 78.33796270830845
//   },
//   "pointC": {
//     "latitude": 17.424770990207723,
//     "longitude": 78.33796270830845
//   },
//   "pointD": {
//     "latitude": 17.424770990207723,
//     "longitude": 78.33679400012024
//   }
// };
let geofenceCoords = null; //provide geofenceCoords: {
//     pointA: { latitude: number; longitude: number },
//     pointB: { latitude: number; longitude: number },
//     pointC: { latitude: number; longitude: number },
//     pointD: { latitude: number; longitude: number }
//   } in the above format, if available/set previously
mapTaggingComponent.render(geofenceCoords);
