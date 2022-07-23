export default class ComputeNode extends CustomElement {
	
	static bound = {
		
		emittedCompute() {
			
			this.compute();
			
		},
		
		mutated() {
			
			this.compute();
			
		}
		
	};
	static acc = {
		
		passive(name, oldValue, newValue) {
			
			newValue ? this.mo.disconnect(this) : this.mo.observe(this, ComputeNode.mutatedInit);
			
		}
		
	};
	
	static setCSSVar(node, name, value, prefix = '', unit = 'px') {
		
		node.style.setProperty(name = '--' + (prefix && (prefix += '-')) + name, value),
		unit === null || unit === false || node.style.setProperty(name + '-unit', value + unit);
		
	}
	static setCSSVarAll(node, object, prefix = '', unit = 'px') {
		
		if (!object || typeof object !== 'object') return;
		
		const { setCSSVar } = ComputeNode;
		let k,v,p,u;
		
		for (k in object) (v = object[k]) && typeof v === 'object' ?
			(k = v.name || k, p = v.prefix || prefix, u = v.unit || unit, v = v.value) : (p = prefix, u = unit),
			setCSSVar(node, k, v, p, u);
		
	}
	
	static compute(node, prefix, computed) {
		
		const	{ compute, getComputed, setCSSVarAll } = ComputeNode,
				{ dataset: { computeClasses }, classList } = node;
		let i, children;
		
		children = node instanceof HTMLSlotElement ? node.assignedNodes() : node.children;
		
		const l = children.length
		
		i = -1;
		while (++i < l) compute(children[i], prefix, computed);
		
		setCSSVarAll(node, getComputed(node), prefix), computed && classList.add(computed);
		
	}
	static getComputed(node) {
		
		const { x, y, width, height } = node.getBoundingClientRect(node),
				{ offsetLeft, offsetTop, offsetWidth, offsetHeight } = node;
		
		return {
			x, y, width, height,
			'offset-left': offsetLeft,
			'offset-top': offsetTop,
			'offset-width': offsetWidth,
			'offset-height': offsetHeight
		};
		
	}
	
	// node と、その子孫要素中の classNames を削除する。
	// 子孫要素中に HTMLSlotElement が存在していれば、その assignedNodes から取得できる要素の classNames も再帰して削除する。
	static removeClassNames(node, ...classNames) {
		
		const	nodes = node.querySelectorAll('.' + classNames.join('.')),
				slots = node.getElementsByTagName('slot'),
				{ removeClassNames } = ComputeNode;
		let i,l,i0,l0, assignedNodes;
		
		i = -1, l = nodes.length, node.classList.remove(...classNames);
		while (++i < l) nodes[i].classList.remove(...classNames);
		
		i = -1, l = slots.length;
		while (++i < l) {
			
			i0 = -1, l0 = (assignedNodes = slots[i].assignedNodes()).length;
			while (++i0 < l0) removeClassNames(assignedNodes[i0], ...classNames);
			
		}
		
	}
	
	static {
		
		this.tagName = 'compute-node',
		
		this.mutatedInit = { subtree: true, childList: true, characterData: true };
		
	}
	
	constructor() {
		
		super(),
		
		this.addEvent(this, 'compute', this.emittedCompute),
		
		(this.ro = new ResizeObserver(this.mutated)).observe(this),
		
		this.passive || (this.mo = new MutationObserver(this.mutated)).observe(this, ComputeNode.mutatedInit);
		
	}
	connectedCallback() {
		
		let ancestor;
		
		this.ro.observe(ancestor = this);
		while ((ancestor = ancestor?.parentElement || ancestor?.getRootNode?.()?.host)) this.ro.observe(ancestor);
		
	}
	disconnectedCallback() {
		
		this.ro.disconnect();
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	compute() {
		
		const { classList, dataset: { computeContexts, computed }, mo } = this,
				{ compute, mutatedInit, removeClassNames } = ComputeNode,
				contexts = computeContexts?.split?.(' ') || [];
		let i,l,l0, ctx;
		
		mo?.disconnect?.(this),
		
		removeClassNames(this, computed),
		
		i = -1, (!(l = contexts.length) || contexts.indexOf('') === -1) && (contexts[l++] = ''), l0 = l - 1;
		while (++i < l)	(ctx = contexts[i]) && classList.add(ctx),
								compute(this, 'computed' + (ctx && '-' + ctx), i === l0 && computed),
								ctx && classList.remove(ctx);
		
		mo?.observe?.(this, mutatedInit), this.emit('computed', this);
		
	}
	
	get passive() {
		
		return this.hasAttribute('passive');
		
	}
	set passive(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('passive', v);
		
	}
	
}