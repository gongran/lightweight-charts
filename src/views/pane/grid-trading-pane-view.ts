import { Pane } from '../../model/pane';
import { GridTradingRenderer, GridTradingRendererData } from '../../renderers/grid-trading-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';

import { IUpdatablePaneView, UpdateType } from './iupdatable-pane-view';
import * as _ from  'lodash';

export class GridTradingPaneView implements IUpdatablePaneView {
	private readonly _pane: Pane;
	private readonly _renderer: GridTradingRenderer = new GridTradingRenderer();
	private _data: GridTradingRendererData | null = null;
	private _invalidated: boolean = true;
	public constructor(pane: Pane) {
		this._pane = pane;
		this._renderer.setPane(pane);
	}
	public update(updateType?: UpdateType | undefined): void {
		throw new Error('Method not implemented.');
	}
	public setData(data: GridTradingRendererData | null){
		this._data=data;
	}
	public renderer(height: number, width: number, addAnchors?: boolean | undefined): IPaneRenderer | null {
		if (this._invalidated) {
			const gridOptions = this._pane.model().options().grid;
			const data: GridTradingRendererData = {
				horzLinesVisible: gridOptions.horzLines.visible || false,
				horzLinesColor: gridOptions.horzLines.color|| '#000000',
				horzLineStyle: gridOptions.horzLines.style|| 0,
				priceMarks: this._pane.defaultPriceScale().marks()|| [],
				h: height|| 0,
				w: width,
				tradingGridData: { lowPrice: 18800, highPrice: 20000, gridQuantity: 5, tradingGridType: 0 },
			};
			let sourceData=this._renderer.getData();
			if(!sourceData){
				sourceData=data;
			}
			let otherData=this._data;
			_.merge(sourceData,otherData);
			this._renderer.setData(sourceData);
			this._invalidated = false;
		}
		return this._renderer;
	}
}
