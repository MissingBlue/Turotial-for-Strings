export default class MetaData extends CustomElement {
	
	static {
		this.tagName = 'meta-data';
	}
	
	constructor() {
		super();
	}
	
	get() {
		
		const	isArray = !!this.querySelector(':scope > meta-datum:not([data-name])'),
				nodes = this.querySelectorAll(':scope > meta-datum, :scope > meta-data'), l = nodes.length,
				data = isArray ? [] : {};
		let i,i0, node;
		
		i = i0 = -1;
		while (++i < l) data[(node = nodes[i]).dataset?.name ?? ++i0] = node.get();
		
		return data;
		
	}
	
}