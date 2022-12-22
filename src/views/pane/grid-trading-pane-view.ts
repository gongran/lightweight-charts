import { Pane } from '../../model/pane';
import { GridTradingRenderer, GridTradingRendererData } from '../../renderers/grid-trading-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';

import { IUpdatablePaneView, UpdateType } from './iupdatable-pane-view';

export class GridTradingPaneView implements IUpdatablePaneView {
	private readonly _pane: Pane;
	private readonly _renderer: GridTradingRenderer = new GridTradingRenderer();
	private _invalidated: boolean = true;
	public constructor(pane: Pane) {
		this._pane = pane;
		this._renderer.setPane(pane);
	}
	public update(updateType?: UpdateType | undefined): void {
		throw new Error('Method not implemented.');
	}
	public renderer(height: number, width: number, addAnchors?: boolean | undefined): IPaneRenderer | null {
		if (this._invalidated) {
			const gridOptions = this._pane.model().options().grid;
			const data: GridTradingRendererData = {
				horzLinesVisible: gridOptions.horzLines.visible,
				horzLinesColor: gridOptions.horzLines.color,
				horzLineStyle: gridOptions.horzLines.style,
				priceMarks: this._pane.defaultPriceScale().marks(),
				h: height,
				w: width,
				tradingGridData: { lowPrice: 18800, highPrice: 20000, gridQuantity: 5, tradingGridType: 0 },
			};
			this._renderer.setData(data);
			this._invalidated = false;
		}
		return this._renderer;
	}
}
