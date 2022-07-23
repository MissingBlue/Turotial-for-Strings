import SubscriptionNode from './subscription-node.js';
import ScriptProxyHandler from './script-proxy-handler.js';

// <reg-exp pattern="^\s*$" flags="" method="test" source="input"></reg-exp>
export default class RegExpNode extends SubscriptionNode {
	
	static bound = {
		
		mutated() {
			
			this.exec();
			
		}
		
	};
	
	static {
		
		this.tagName = 'reg-exp',
		
		this.mutationInit = { subtree: true, characterData: true };
		
	}
	
	constructor() {
		
		super();
		
		this.observeMutation(this.mutated, this, RegExpNode.mutationInit);
		
	}
	
	evaluate(values, shared) {
		
		return this.exec();
		
	}
	play(shared) {
		
		return this.exec();
		
	}
	
	exec(str) {
		
		const { method, replacer, source } = this, regexp = this[Symbol.toPrimitive]();
		
		switch (method) {
			
			case 'replace': return source[method](regexp, replacer);
			case 'replace-all': return source.replaceAll(regexp, replacer);
			
			default: return	typeof regexp[method] === 'function' ? regexp[method](source) :
										typeof source[method] === 'function' ? source[method](regexp) : pattern === source;
			
		}
		
	}
	
	get noTrim() {
		
		return this.hasAttribute('no-trim');
		
	}
	set noTrim(v) {
		
		return this[(v === false ? 'remove' : 'set') + 'Attribute']('no-trim', v);
		
	}
	get replacer() {
		
		return this.getAttribute('replacer') || '';
		
	}
	set replacer(v) {
		
		return this.setAttribute('replacer', v);
		
	}
	get method() {
		
		let v;
		
		switch (v = this.getAttribute('method').toLowerCase()) {
			
			case 'replace': case 'test': case 'match': case 'exec': return v;
			
			case 'replace-all': return 'replaceAll';
			case 'match-all': return 'matchAll'; 
			
			default: return 'test';
			
		}
		
	}
	get pattern() {
		
		return this.getAttribute('pattern');
		
	}
	set pattern(v) {
		
		this.setAttribute('pattern', v);
		
	}
	get flags() {
		
		this.getAttribute('flags');
		
	}
	set flags(v) {
		
		this.setAttribute('flags', v);
		
	}
	get source() {
		
		let v;
		
		switch (this.getAttribute('source').toLowerCase()) {
			
			case 'inner-html': v = this.innerHTML;
			case 'outer-html': v = this.outerHTML;
			case 'inner-text': v = this.innerText;
			default: v = this.textContent;
			
		}
		
		return this.noTrim ? v : v.trim();
		
	}
	set source(v) {
		
		this.setAttribute('source', v);
		
	}
	
	[Symbol.toPrimitive]() {
		
		return new RegExp(this.pattern, this.flags);
		
	}
	
}