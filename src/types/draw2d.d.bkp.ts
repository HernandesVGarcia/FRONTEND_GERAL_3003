declare module 'draw2d' {
  export class Canvas {
    constructor(id: string, options?: {
      width?: number;
      height?: number;
      grid?: boolean;
      gridColor?: string;
      gridSize?: number;
      zoomMin?: number;
      zoomMax?: number;
      scrollArea?: HTMLElement;
    });
    
    add(figure: any): void;
    installEditPolicy(policy: any): void;
    setCurrentSelection(figure: any): void;
    getWidth(): number;
    getHeight(): number;
    getDimension(): {width: number, height: number};
    setZoom(zoom: number): void;
    setDimension(width: number, height: number): void;
  }

  export namespace shape {
    export namespace basic {
      export class Rectangle {
        constructor(config: {
          x: number;
          y: number;
          width: number;
          height: number;
          color?: string;
          radius?: number;
          draggable?: boolean;
        });
        
        // Métodos necessários para Cabo12F
        getHeight(): number;
        getWidth(): number;
        createPort(type: string, locator?: any): any;
        add(figure: any, locator: any): void;
        setPosition(x: number, y: number): void;
        getX(): number;
        getY(): number;
        setDraggable(draggable: boolean): void;
      }

      export class Line {
        constructor(config: {
          x1: number;
          y1: number;
          x2: number;
          y2: number;
          stroke?: number;
          color?: string;
          draggable?: boolean;
        });
        setStroke(width: number): void;
        setColor(color: string): void;
        setPosition(x: number, y: number): void;
        getX(): number;
        getY(): number;
        setX1(x1: number): void;
        setY1(y1: number): void;
        setX2(x2: number): void;
        setY2(y2: number): void;
        getX1(): number;
        getY1(): number;
        getX2(): number;
        getY2(): number;
        setDraggable(draggable: boolean): void;
      }
      
      export class Label {
        constructor(config: {
          text: string;
          fontColor?: string;
          stroke?: number;
          fontSize?:number;
          direction?:string;
        });
      }

      export class Circle {
        constructor(config: {
          x: number;
          y: number;
          radius: number;
          color?: string;
          stroke?: number;
          selectable?: boolean;
          draggable?: boolean;
        });
        setRadius(radius: number): void;
        getRadius(): number;
        setPosition(x: number, y: number): void;
        getX(): number;
        getY(): number;
        setDraggable(draggable: boolean): void;
        // Métodos e propriedades adicionais para compatibilidade
        setBackgroundColor(color: string): void;
        setId(id: string): void;
        on(event: string, callback: Function): void;
        id: string | ((id: string) => void);
      }
    }
  }

  export namespace layout {
    export namespace locator {
      export class CenterLocator {
        constructor();
      }
      
      export class RightLocator {
        constructor();
      }
    }
  }

  export interface Port {
    setName(name: string): void;
    setPosition(x: number, y: number): void;
    setConnectionDirection(direction: number): void;
    setBackgroundColor(color: string): void;
    setRadius(radius: number): void;
    setY(y: number): void;
  }

  export const ConnectionDirection: {
    UP: number;
    RIGHT: number;
    DOWN: number;
    LEFT: number;
  };

  export namespace policy {
    export namespace connection {
      export class DragConnectionCreatePolicy {
        constructor(attributes?: any);
      }
    }
    
    export namespace canvas {
      export class FadeoutDecorationPolicy {
        constructor();
      }
      
      export class BoundingboxSelectionPolicy {
        constructor();
      }

      export class PanningSelectionPolicy {
        constructor();
      }

      export class ZoomPolicy {
        constructor(canvas: Canvas);
      }
    }
  }

  export namespace connection {
    export class Connection {
      constructor(attributes?: any);
      setRouter(router: any): void;
      setOutlineStroke(stroke: number): void;
      setOutlineColor(color: string): void;
      setStroke(stroke: number): void;
      setColor(color: string): void;
    }
  }

  export namespace layout {
    export namespace connection {
      export class ManhattanConnectionRouter {
        constructor();
      }
      export class InteractiveManhattanConnectionRouter {
        constructor();
      }
      export class DirectRouter {
        constructor();
      }
    }
  }
}
