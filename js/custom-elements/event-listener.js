import SubscriptionNode from './subscription-node.js';
import ScriptProxyHandler from './script-proxy-handler.js';

export default class EventListener extends SubscriptionNode {
	
	static bound = {
		
		async listened(event) {
			
			const { proxy, revoke } = Proxy.revocable(this, ScriptProxyHandler);
			
			for await (const handler of proxy);
			
			revoke();
			
		}
		
	};
	
	static acc = {
		
		selector(name, oldValue, newValue) {
			
			this.listen(newValue, this.type);
			
		},
		
		type(name, oldValue, newValue) {
			
			this.listen(this.selctor, newValue);
			
		},
		
	};
	
	static {
		
		this.tagName = 'event-listener',
		
		this[ScriptProxyHandler.noRecursion] = true;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	play() {
		
		this.listen();
		
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	listen(selector = this.selector, type = this.type) {
		
		const target = this.composeClosest('app-node')?.q(selector), { listenerAC, listend } = this;
		
		target && type && (
				listenerAC?.abort?.(),
				target.addEventListener(type, this.listened, { signal: (this.listenerAC = new AbortController()).signal })
			);
		
		
	}
	
	get selector() {
		
		return this.getAttribute('selector');
		
	}
	set selector(v) {
		
		this.setAttribute('selector', v);
		
	}
	
	get type() {
		
		return this.getAttribute('type');
		
	}
	set type(v) {
		
		this.setAttribute('type', v);
		
	}
	
}