import { ensureNotNull } from '../helpers/assertions';
import { Pane } from '../model/pane';

import { PriceMark } from '../model/price-scale';

import { LineStyle, setLineStyle, strokeInPixel } from './draw-line';
import { IPaneRenderer } from './ipane-renderer';

const enum TradingGridType {
	Geometric, // 等比
	Arithmetic // 等差
}
export interface GridTradingRendererData {
	horzLinesVisible: boolean;
	horzLinesColor: string;
	horzLineStyle: LineStyle;
	priceMarks: PriceMark[];

	h: number;
	w: number;

	tradingGridData: TradingGridData;
}

export interface TradingGridData {
	lowPrice: number;
	highPrice: number;
	gridQuantity: number;
	tradingGridType: TradingGridType;
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
	public draw(
		ctx: CanvasRenderingContext2D,
		pixelRatio: number,
		isHovered: boolean,
		hitTestData?: unknown
	): void {
		// eslint-disable-next-line no-console
		console.log('data');
		// eslint-disable-next-line no-console
		console.log(this._data);
		if (this._data === null) {
			return;
		}
		const lineWidth = Math.max(1, Math.floor(pixelRatio));
		ctx.lineWidth = lineWidth;
		const width = Math.ceil(this._data.w * pixelRatio);
		strokeInPixel(ctx, () => {
			const data = ensureNotNull(this._data);
			if (data.horzLinesVisible) {
				ctx.strokeStyle = data.horzLinesColor;
				setLineStyle(ctx, data.horzLineStyle);
				ctx.beginPath();

				// 根据价格获取坐标

				const priceTopCoordinate = this._pane
					?.rightPriceScale()
					.priceToCoordinate(
						Number(this._data?.tradingGridData.highPrice),
						Number(data.priceMarks[0].label)
					);
				const priceLowCoordinate = this._pane
					?.rightPriceScale()
					.priceToCoordinate(
						Number(this._data?.tradingGridData.lowPrice),
						Number(data.priceMarks[0].label)
					);
				// ctx.rect(0, Number(priceCoordinate), width, 2000);
				ctx.moveTo(0, Number(priceTopCoordinate));
				ctx.lineTo(width, Number(priceTopCoordinate));
				ctx.moveTo(0, Number(priceLowCoordinate));
				ctx.lineTo(width, Number(priceLowCoordinate));

				// create grid

				const gridQuantity = Number(this._data?.tradingGridData.gridQuantity);
				const tradingGridType = Number(
					this._data?.tradingGridData.tradingGridType
				);
				if (tradingGridType === TradingGridType.Geometric) {
					// 等比
					const gridPrice =
						(Number(this._data?.tradingGridData.highPrice) -
							Number(this._data?.tradingGridData.lowPrice)) /
						gridQuantity;

					for (let i = 1; i < gridQuantity; i++) {
						const gridPriceCoordinate = this._pane
							?.rightPriceScale()
							.priceToCoordinate(
								Number(this._data?.tradingGridData.lowPrice) + gridPrice * i,
								Number(data.priceMarks[0].label)
							);
						ctx.moveTo(0, Number(gridPriceCoordinate));
						ctx.lineTo(width, Number(gridPriceCoordinate));
					}
				}
				ctx.strokeStyle = 'red';
				ctx.stroke();
			}
		});
	}
}
