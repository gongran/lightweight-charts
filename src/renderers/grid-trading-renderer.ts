import { ensureNotNull } from '../helpers/assertions';
import { Coordinate } from '../model/coordinate';
import { Pane } from '../model/pane';

import { PriceMark } from '../model/price-scale';

import { LineStyle, setLineStyle, strokeInPixel } from './draw-line';
import { IPaneRenderer } from './ipane-renderer';

const enum TradingGridType {
	Geometric, // 等比
	Arithmetic // 等差
}
export interface GridTradingRendererData {
	horzLinesVisible?: boolean | undefined;
	horzLinesColor?: string | undefined;
	horzLineStyle?: LineStyle | undefined;
	priceMarks?: PriceMark[] | undefined;

	h?: number | undefined;
	w?: number | undefined;

	tradingGridData?: TradingGridData | undefined;
}

export interface TradingGridData {
	lowPrice?: number;
	lowCoordinate?: number;
	highPrice?: number;
	highCoordinate?: number;
	gridQuantity?: number;
	tradingGridType?: TradingGridType;
	preY?: number;
	nowY?: number;
	color?: string | 'orange';
	eventType?: string;
	lines?: number[];
}

export class GridTradingRenderer implements IPaneRenderer {
	private _pane: Pane | null = null;
	private _data: GridTradingRendererData | null = null;

	public setPane(pane: Pane): void {
		this._pane = pane;
	}

	public setData(data: GridTradingRendererData | null): void {
		this._data = data;
	}
	public getData(): GridTradingRendererData | null {
		return this._data;
	}

	formatPrice(price: number) {
		const scale = 16;

		// 使用正则表达式获取小数位数
		const divisor = Math.pow(10, scale);
		// 根据小数位数进行四舍五入操作
		return Math.round(price * divisor) / divisor;
	}

	calculateGeometricGridLines(
		highPrice: number,
		lowPrice: number,
		gridQuantity: number
	) {
		const grids = new Array(gridQuantity);

		const gridQuantityBigDecimal = gridQuantity - 1;
		const ratio = Math.pow(highPrice / lowPrice, 1 / gridQuantityBigDecimal);

		const gridLines = [];

		for (let i = 0; i < gridQuantity; i++) {
			grids[i] = this.formatPrice(lowPrice * Math.pow(ratio, i));
			const gridLine = {
				price: grids[i],
				gridLineNumber: i
			};
			gridLines.push(gridLine);
		}
		return gridLines;
	}

	public draw(
		ctx: CanvasRenderingContext2D,
		pixelRatio: number,
		isHovered: boolean,
		hitTestData?: unknown
	): void {
		if (this._data === null) {
			return;
		}
		const lineWidth = Math.max(1, Math.floor(pixelRatio));
		ctx.lineWidth = lineWidth;
		const width = Math.ceil(this._data.w || 0 * pixelRatio);
		strokeInPixel(ctx, () => {
			ctx.clearRect(0, 0, this._data?.w || 0, this._data?.h || 0);
			const data = ensureNotNull(this._data);
			let movingDistance =
				(this._data?.tradingGridData?.nowY || 0) -
				(this._data?.tradingGridData?.preY || 0);
			if (data.horzLinesVisible) {
				ctx.strokeStyle = data.horzLinesColor || '';
				setLineStyle(ctx, data.horzLineStyle || 0);
				ctx.beginPath();

				// 根据价格获取坐标
				let priceMarksLabel = 0;
				if (data.priceMarks) {
					let lastValue = data.priceMarks[data.priceMarks.length - 1];
					priceMarksLabel = Number(lastValue.label);
				}
				const highPrice = Number(this._data?.tradingGridData?.highPrice || 0);
				const lowPrice = Number(this._data?.tradingGridData?.lowPrice || 0);
				const gridQuantity = Number(
					this._data?.tradingGridData?.gridQuantity || 0
				);

				// create grid

				const tradingGridType =
					this._data?.tradingGridData?.tradingGridType ||
					TradingGridType.Geometric;
				const lines = [];
				let afterMvTopPrice = 0;
				let afterMvLowPrice = 0;
				if (tradingGridType === TradingGridType.Geometric) {
					const gridLines = this.calculateGeometricGridLines(
						highPrice,
						lowPrice,
						gridQuantity
					);
					for (const gridLine of gridLines) {
						const priceCoordinate = this._pane
							?.rightPriceScale()
							.priceToCoordinate(gridLine.price, priceMarksLabel);
						const priceCoordinateNumber =
							Number(priceCoordinate) + movingDistance;
						ctx.moveTo(0, priceCoordinateNumber);
						ctx.lineTo(width, priceCoordinateNumber);
						const afterMvPrice = Number(
							this._pane
								?.rightPriceScale()
								.coordinateToPrice(
									priceCoordinateNumber as Coordinate,
									priceMarksLabel
								)
						);
						lines.push(afterMvPrice);
						if (gridLine.gridLineNumber === 0) {
							afterMvLowPrice = afterMvPrice;
						}
						if (gridLine.gridLineNumber === gridQuantity - 1) {
							afterMvTopPrice = afterMvPrice;
						}
					}
				}
				ctx.strokeStyle = this._data?.tradingGridData?.color || 'orange';
				ctx.stroke();

				if (this._data?.tradingGridData?.eventType === 'mouseUpEvent') {
					this._data.tradingGridData.highPrice = afterMvTopPrice;
					this._data.tradingGridData.lowPrice = afterMvLowPrice;
					this._data.tradingGridData.nowY = 0;
					this._data.tradingGridData.preY = 0;
					this._data.tradingGridData.lines = lines;
				}
			}
		});
	}
}
