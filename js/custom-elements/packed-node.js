export default class PackedNode extends CustomElement {
	
	static bound = {
		
		changed() {
			
			this.specify();
			
		}
		
	};
	
	static specify(str, escapes) {
		
		if (!(escapes instanceof RegExp)) return [];
		
		const matches = str.matchAll(escapes), matched = [];
		let i,k;
		
		i = -1;
		for (const { groups } of matches) for (k in groups) groups[k] === undefined || (matched[++i] = k);
		
		return matched;
		
	}
	
	static {
		
		this.tagName = 'packed-node',
		
		this.escapesFlags = /([^dgimsuy]|d.*?d|g.*?g|i.*?i|m.*?m|s.*?s|u.*?u|y.*?y)/i,
		
		this.observeInit = { characterData: true };
		
	}
	
	constructor() {
		
		super(),
		
		this.specify(),
		
		(this.mo = new MutationObserver(this.changed)).observe(this, PackedNode.observeInit);
		
	}
	
	specify() {
		
		this.dataset.packedSpec = PackedNode.specify(this.textContent, this.escapes).join(' ');
		
	}
	
	get escapes() {
		
		return new RegExp(this.getAttribute('escapes'), this.escapesFlags);
		
	}
	set escapes(v) {
		
		this.setAttribute('escapes', v);
		
	}
	get escapesFlags() {
		
		const v = this.getAttribute('escapes-flags');
		
		return (!v || PackedNode.escapesFlags.test(v)) ? 'g' : v.indexOf('g') === -1 ? (v + 'g') : v;
		
	}
	set escapesFlags(v) {
		
		return this.setAttribute('escapes-flags', v);
		
	}
	
}