declare module 'react-canvas-draw' {
  import { Component } from 'react';

  export interface CanvasDrawProps {
    ref?: any;
    canvasWidth?: number;
    canvasHeight?: number;
    brushColor?: string;
    brushRadius?: number;
    lazyRadius?: number;
    hideGrid?: boolean;
    backgroundColor?: string;
  }

  export default class CanvasDraw extends Component<CanvasDrawProps> {
    clear(): void;
    undo(): void;
    getSaveData(): string;
    loadSaveData(saveData: string, immediate?: boolean): void;
  }
}
