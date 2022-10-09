import { IPaneRenderer } from './ipane-renderer';

export class GridTradingRenderer implements IPaneRenderer {
	public draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void {
		ctx.arc(100, 200, 30, 0, Math.PI * 2, true);
		ctx.stroke();
	}
}
