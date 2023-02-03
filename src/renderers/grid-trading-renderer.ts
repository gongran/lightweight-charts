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
	highPrice?: number;
	gridQuantity?: number;
	tradingGridType?: TradingGridType;
	preY?: number;
	nowY?: number;
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
				const priceTopCoordinate = this._pane
					?.rightPriceScale()
					.priceToCoordinate(highPrice, priceMarksLabel);

				const priceLowCoordinate = this._pane
					?.rightPriceScale()
					.priceToCoordinate(lowPrice, priceMarksLabel);

				const topPriceCoordinate = Number(priceTopCoordinate) + movingDistance;
				const lowPriceCoordinate = Number(priceLowCoordinate) + movingDistance;

				
				// ctx.rect(0, Number(priceCoordinate), width, 2000);
				ctx.moveTo(0, topPriceCoordinate);
				ctx.lineTo(width, topPriceCoordinate);
				ctx.moveTo(0, lowPriceCoordinate);
				ctx.lineTo(width, lowPriceCoordinate);

				// create grid

				const gridQuantity = Number(
					this._data?.tradingGridData?.gridQuantity || 0
				);
				const tradingGridType =
					this._data?.tradingGridData?.tradingGridType ||
					TradingGridType.Geometric;

				if (tradingGridType === TradingGridType.Geometric) {
					// 等比
					const gridPrice = (highPrice - lowPrice) / gridQuantity;

					for (let i = 1; i < gridQuantity; i++) {
						const gridPriceCoordinate = this._pane
							?.rightPriceScale()
							.priceToCoordinate(lowPrice + gridPrice * i, priceMarksLabel);
						ctx.moveTo(0, Number(gridPriceCoordinate) + movingDistance);
						ctx.lineTo(width, Number(gridPriceCoordinate) + movingDistance);
					}
				}
				ctx.strokeStyle = 'orange';
				ctx.stroke();

				const afterMvTopPrice = this._pane
					?.rightPriceScale()
					.coordinateToPrice(topPriceCoordinate as Coordinate, priceMarksLabel);
				const afterMvLowPrice = this._pane
					?.rightPriceScale()
					.coordinateToPrice(lowPriceCoordinate as Coordinate, priceMarksLabel);
				// if (this._data?.tradingGridData?.highPrice) {
				// 	this._data.tradingGridData.highPrice = afterMvTopPrice;
				// }
				// if (this._data?.tradingGridData?.lowPrice) {
				// 	this._data.tradingGridData.lowPrice = afterMvLowPrice;
				// }

				if (priceTopCoordinate) {
					console.log(
						'Coordinate to top price',
						priceTopCoordinate,
						afterMvTopPrice
					);
				}
				if (priceLowCoordinate) {
					console.log(
						'Coordinate to low price',
						priceLowCoordinate,
						afterMvLowPrice
					);
				}
			}
		});
	}
}
