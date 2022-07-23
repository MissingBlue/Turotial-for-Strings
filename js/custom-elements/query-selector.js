import SubscriptionNode from './subscription-node.js';
import ScriptProxyHandler from './script-proxy-handler.js';
import ConditionProxyHandler from './condition-proxy-handler.js';

// <query-selector selector="#dialogs .d-0" method="clone"></query-selector>
export default class QuerySelector extends SubscriptionNode {
	
	static {
		
		this.tagName = 'query-selector';
		
	}
	
	constructor() {
		
		super();
		
	}
	connectedCallback() {
		
		this.select();
		
	}
	
	async evaluate(values, shared) {
		
		const executed = this.select();
		
		if (this.method === 'replace') {
			
			const values = [];
			let i, proxy;
			
			i = -1;
			for (const node of executed) {
				
				for await (const evaluated of (proxy = Proxy.revocable(node, ConditionProxyHandler)).proxy)
					values[++i] = evaluated;
				
				proxy.revoke();
				
			}
			// 以下のプロパティ名を示す ConditionProxyHandler のプロパティは現在未作成。
			values[ConditionProxyHandler?.splices] = true;
			
			return values;
			
		}
		
	}
	async play() {
		
		const played = this.select();
		
		if (this.method === 'replace') {
			
			let proxy;
			
			for (const node of played) {
				for await (const evaluated of (proxy = Proxy.revocable(node, ScriptProxyHandler)).proxy);
				proxy.revoke();
			}
			
		}
		
	}
	
	execute() {
		
		return this.select();
		
	}
	
	select(appends = this.appends) {
		
		const { selector } = this, selected = selector ? this.composeClosest('app-node').qq(selector) : [ this.children ];
		let l;
		
		if (!(l = selected.length)) return;
		
		//appends || (this.innerHTML = '');
		
		const { all, method, source } = this, executed = [];
		let i;
		
		i = -1, all || (l = 1);
		while (++i < l) {
			switch (source) {
				case 'value': executed[i] = selected[i]?.value ?? ''; break;
				default: executed[i] = selected[i].cloneNode(true);
			}
		}
		
		switch (method) {
			case 'append': this.append(...executed); break;
			case 'replace': default: this.replaceWith(...executed);
		}
		
		return executed;
		
	}
	
	//get appends() {
	//	
	//	return this.hasAttribute('appends');
	//	
	//}
	//set appends(v) {
	//	
	//	return this[(v === false ? 'remove' : 'set') + 'Attribute']('appends', v);
	//	
	//}
	// 選択要素をすべて対象とするか、最初のものだけにするかを指定する論理値。
	// いずれの場合も querySelectorAll が使われ、取得後に指定に従った要素を対象にする。
	get all() {
		
		return this.hasAttribute('all');
		
	}
	set all(v) {
		
		return this[(v === false ? 'remove' : 'set') + 'Attribute']('all', v);
		
	}
	get source() {
		
		return this.getAttribute('source')?.toLowerCase();
		
	}
	set source(v) {
		
		this.setAttribute('source', v);
		
	}
	get method() {
		
		return this.getAttribute('method')?.toLowerCase();
		
	}
	set method(v) {
		
		this.setAttribute('method', v);
		
	}
	get selector() {
		
		return this.getAttribute('selector');
		
	}
	set selector(v) {
		
		this.setAttribute('selector', v);
		
	}
	
}