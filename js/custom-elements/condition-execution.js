import ScriptProxyHandler from './script-proxy-handler.js';

// ConditionTrue, ConditionFalse が継承するオブジェクト
export default class ConditionExecution extends CustomElement {
	
	static bound = {
		
	};
	
	static {
		
		this.tagName = 'condition-execution';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	async play() {
		
		this.execute(shared);
		
	}
	
	async execute(shared) {
		
		const	{ proxy, revoke } = Proxy.revocable(this, ScriptProxyHandler),
				asyncIterator = proxy[Symbol.asyncIterator](shared);
		
		for await (const node of asyncIterator);
		
		revoke();
		
	}
	
}