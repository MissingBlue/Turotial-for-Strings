export default class SpriteNode extends CustomElement {
	
	static bound = {
		
		resized() {
			
			this.calculate();
			
		},
		
		changedSlot() {
			
			const	assignedElements = this.slotNode.assignedElements(), l = assignedElements.length;
			let i;
			
			i = -1, this.ro.disconnect(), this.isConnected && this.ro.observe(this);
			while (++i < l) this.ro.observe(assignedElements[i]);
			
		}
		
	};
	
	static {
		
		this.tagName = 'sprite-node';
		
	}
	
	constructor() {
		
		super(),
		
		this.ro = new ResizeObserver(this.resized),
		
		(this.slotNode = this.q('slot[name="sprite"]')).addEventListener('slotchange', this.changedSlot);
		
	}
	
	connectedCallback() {
		
		this.calculate(),
		
		this.ro.observe(this);
		
	}
	disconnectedCallback() {
		
		this.ro?.unobserve?.(this);
		
	}
	
	calculate() {
		
		const	assignedElements = this.slotNode.assignedElements(), l = assignedElements.length;
		let i;
		
		// assignedNodes が複数存在する時の値の決定方法がわからないため、現状は機械的に後方の要素の値で既存の値を上書きする。
		
		i = -1;
		while (++i < l) {
			const { height: h, width: w } = assignedElements[i].getBoundingClientRect();
			this.setCSSVar('sprite-size-width', w),
			this.setCSSVar('sprite-size-height', h),
			this.setCSSVar('sprite-aspect-ratio-wh', w / h),
			this.setCSSVar('sprite-aspect-ratio-hw', h / w),
			this.setCSSVar('sprite-horizontal', +(w > h)),
			this.setCSSVar('sprite-vertical', +(w < h));
		}
		
	}
	
}