declare module 'react-canvas-draw' {
  import { Component } from 'react';

  export interface CanvasDrawProps {
    canvasWidth?: number | string;
    canvasHeight?: number | string;
    brushColor?: string;
    brushRadius?: number;
    lazyRadius?: number;
    hideGrid?: boolean;
    saveData?: string;
    loadTimeOffset?: number;
    immediateLoading?: boolean;
    disabled?: boolean;
    imgSrc?: string;
    backgroundColor?: string;
    catenaryColor?: string;
    gridColor?: string;
    hideInterface?: boolean;
    onChange?: (canvas: any) => void;
    className?: string;
    style?: React.CSSProperties;
    ref?: React.Ref<any>;
  }

  export default class CanvasDraw extends Component<CanvasDrawProps> {
    clear(): void;
    undo(): void;
    getSaveData(): string;
    loadSaveData(saveData: string, immediate?: boolean): void;
    getDataURL(fileType?: string, useBgImage?: boolean, backgroundColour?: string): string;
  }
}
