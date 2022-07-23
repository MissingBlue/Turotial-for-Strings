export default class SHandle extends CustomElement {
	
	static bound = {
		
		fulfilled(event) {
			
			this.operate();
			
		}
		
	};
	
	static {
		
		this.tagName = 's-handle';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	operate(type, operation) {
		
		const appNode = this.composeClosest('app-node');
		
		operation ? (this.operation = operation) : (type = this.type);
		
		switch (type ? (this.type = type) : this.type) {
			case 'input':
			appNode.disableConsoles(operation);
			break;
		}
		
	}
	
	async play() {
		
		//const { proxy = this, revoke } = this[Symbol.asyncIterator] || Proxy.revocable(this, ScriptProxyHandler);
		
		this.addEvent(this, 'fulfilled', () => this.toggle, { once: true }),
		
		this.operate();
		
		//for await (const played of proxy);
		
		//revoke();
		
	}
	
	get operation() {
		
		return this.getAttribute('operation');
		
	}
	set operation(v) {
		
		this.setAttribute('operation', v);
		
	}
	get type() {
		
		return this.getAttribute('type');
		
	}
	set type(v) {
		
		this.setAttribute('type', v);
		
	}
	
}