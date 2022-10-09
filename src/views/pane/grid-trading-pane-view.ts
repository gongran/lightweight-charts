import { Pane } from '../../model/pane';
import { GridTradingRenderer } from '../../renderers/grid-trading-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';

import { IUpdatablePaneView, UpdateType } from './iupdatable-pane-view';

export class GridTradingPaneView implements IUpdatablePaneView {
	private readonly _pane: Pane;
	private readonly _renderer: GridTradingRenderer = new GridTradingRenderer();
	public constructor(pane: Pane) {
		this._pane = pane;
		// eslint-disable-next-line no-console
		console.log(this._pane);
	}
	public update(updateType?: UpdateType | undefined): void {
		throw new Error('Method not implemented.');
	}
	public renderer(height: number, width: number, addAnchors?: boolean | undefined): IPaneRenderer | null {
		return this._renderer;
	}
}
