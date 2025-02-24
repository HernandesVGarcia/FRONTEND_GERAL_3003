declare module 'draw2d' {
    export class Canvas {
      constructor(id: string);
      add(figure: any): void;
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
            draggable?:boolean;
          });
        }
        export class Line {
          constructor(config: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            stroke?: number;
            color?: string;
            draggable?:boolean
            
            
      }
    )
    }
      }}}