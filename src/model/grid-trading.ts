import { GridTradingPaneView } from '../views/pane/grid-trading-pane-view';
import { IUpdatablePaneView } from '../views/pane/iupdatable-pane-view';

import { Pane } from './pane';

export class GridTrading {
	private _paneView: GridTradingPaneView;
	public constructor(pane: Pane) {
		this._paneView = new GridTradingPaneView(pane);
	}
	public panView(): IUpdatablePaneView {
		return this._paneView;
	}
}
