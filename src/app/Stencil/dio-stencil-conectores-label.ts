import * as go from 'gojs';

/**
 * Largura extra (px) reservada à esquerda do bloco de conectores, para o rótulo vertical
 * (estilo alinhado ao label dos cabos, ex. cabo-12-f-nac).
 */
export const DIO_CONECTORES_LABEL_STRIP = 80;

/** Texto fixo "Conectores DIO" com o mesmo aspeto do `labelText` vertical dos cabos. */
export function buildDioConectoresDioTextBlock(): go.TextBlock {
  return new go.TextBlock({
    text: 'Conectores DIO',
    name: 'LABEL',
    font: 'bold 30px arial',
    angle: -90,
    position: new go.Point(0, 0),
    stroke: '#424242',
    alignment: go.Spot.Left,
    alignmentFocus: go.Spot.Right,
    textAlign: 'center',
    margin: new go.Margin(0, 60, 0, 0),
    pickable: false,
  });
}
