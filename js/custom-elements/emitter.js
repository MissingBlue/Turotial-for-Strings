export default class Emitter extends CustomElement {
	
	static bound = {
		
		dispatch(event) {
			
			const { type } = this, emissions = type[event.type];
			let v;
			
			for (v of emissions) this.emit(v || 'emit', this);
			
		}
		
	};
	
	static {
		
		this.tagName = 'emit-node';
		
	}
	
	constructor(emission) {
		
		super();
		
		this.type = {},
		
		this.addEmission(emission);
		
	}
	addEmission(emission) {
		
		if (!emission || typeof emission !== 'object') return;
		
		const { type } = this;
		
		let i,l,k, t,t0;
		
		for (k in emission) {
			i = -1, l = (Array.isArray(t = emission[k]) ? t : (t = [ t ])).length;
			while (++i < l)	typeof (t0 = t[i]) === 'string' && (
											(type[t0] || (type[t0] = new Set())).add(k),
											this.addEvent(this, t0, this.dispatch)
										);
		}
		
	}
	removeEmission(emissionName) {
		
		const { type } = this;
		let v, t;
		
		for (v of type) (t = type[v]).has?.(emissionName) && (t.delete(emissionName), t.size || delete type[v]);
		
	}
	
}
export class DeleteNode extends Emitter {
	
	static {
		
		this.tagName = 'delete-node',
		
		this.emission = {
			'pressed-delete': [ 'click' ]
		}
		
	}
	
	constructor(emission) {
		
		super(emission || DeleteNode.emission);
		
	}
	
}