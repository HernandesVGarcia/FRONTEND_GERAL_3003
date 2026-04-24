import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';
import {
  DIO_CONECTORES_LABEL_STRIP,
  buildDioConectoresDioTextBlock,
} from '../dio-stencil-conectores-label';

/** DIO 48 fibras: retângulo com 48 conectores (quadrados verdes numerados de cima para baixo). */
@Component({
  selector: 'app-dio-48f',
  templateUrl: './dio-48-f.component.html',
  styleUrls: ['./dio-48-f.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class Dio48FComponent {
  private static readonly FIBER_COUNT = 48;

  private readonly connectorSize = 30;
  private readonly rowSpacing = 6;
  private readonly pad = 12;

  readonly width: number =
    this.pad * 2 + this.connectorSize + 16 + DIO_CONECTORES_LABEL_STRIP;
  readonly height: number =
    this.pad * 2 +
    Dio48FComponent.FIBER_COUNT * this.connectorSize +
    (Dio48FComponent.FIBER_COUNT - 1) * this.rowSpacing;

  getModelDefinition(): go.ObjectData {
    return {
      key: 'dio48F',
      width: this.width,
      height: this.height,
      category: 'dio48F',
      resizable: true,
      rotatable: true,
    };
  }

  getNodeTemplate(): go.Node {
    const n = Dio48FComponent.FIBER_COUNT;
    const connectorSize = this.connectorSize;
    const rowSpacing = this.rowSpacing;
    const pad = this.pad;

    const vertical = new go.Panel(go.Panel.Vertical, {
      alignment: go.Spot.Center,
      defaultAlignment: go.Spot.Center,
      padding: pad,
    });

    for (let i = 1; i <= n; i++) {
      vertical.add(
        new go.Panel(go.Panel.Spot, {
          isClipping: false,
          margin: new go.Margin(0, 0, i < n ? rowSpacing : 0, 0),
        })
          .add(
            new go.Shape('Rectangle', {
              fill: '#229A00',
              stroke: '#155d15',
              strokeWidth: 1,
              width: connectorSize,
              height: connectorSize,
              portId: `D${i}`,
              fromSpot: go.Spot.RightSide,
              toSpot: go.Spot.RightSide,
              cursor: 'pointer',
              fromLinkable: true,
              toLinkable: true,
              fromLinkableSelfNode: true,
              toLinkableSelfNode: true,
              toMaxLinks: 1,
              fromMaxLinks: 1,
            }),
          )
          .add(
            new go.TextBlock({
              text: String(i),
              font: 'bold 8px sans-serif',
              stroke: '#ffffff',
              alignment: go.Spot.Center,
              pickable: false,
            }),
          ),
      );
    }

    return new go.Node(go.Panel.Spot, {
      selectionAdorned: true,
      resizable: true,
      rotatable: true,
      locationSpot: go.Spot.TopLeft,
    })
      .add(
        new go.Shape('RoundedRectangle', {
          fill: '#eceff1',
          stroke: '#2196F3',
          strokeWidth: 2,
        })
          .bind('width', 'width')
          .bind('height', 'height'),
      )
      .add(
        buildDioConectoresDioTextBlock(),
      )
      .add(
        new go.Panel(go.Panel.Spot, {
          alignment: go.Spot.Right,
        }).add(vertical),
      )
      .bind(
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
          go.Point.stringify,
        ),
      );
  }
}
