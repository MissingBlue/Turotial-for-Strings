import SubscriptionNode from './subscription-node.js';

export default class ScriptNode extends SubscriptionNode {
	
	static bound = {};
	
	static acc = {
		
		content(name, oldValue, newValue) {
			
			this.setContent(newValue);
			
		}
		
	};
	
	static subscriptinos = [];
	
	static {
		
		this.tagName = 'script-node';
		
	}
	
	constructor() {
		
		super();
		
		this.setContent();
		
	}
	connectedCallback() {
		
		this.subscribe();
		
	}
	disconnectedCallback() {
		
		this.unsubscribe();
		
	}
	static get observedAttributes() {
		
		return this.__?.observedAttributeNames;
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	setContent(selector = this.content) {
		
		const contents = [ ...document.querySelectorAll(selector) ], l = contents.length;
		
		if (!l) return;
		
		const	contentNode = document.createElement('div'),
				assignedNodes = this.q('slot[name="content"]')?.assignedNodes?.();
		let i;
		
		if (assignedNodes) for (const v of assignedNodes) v.remove();
		
		i = -1, contentNode.slot = 'content';
		while (++i < l) contents[i] = contents[i].content.cloneNode(true);
		
		this.append(...contents);
		
	}
	
	play() {
		
		return Promise.resolve();
		
	}
	
	[Symbol.asyncIterator]() {
		
		const	snodes = this.q(`slot[name="${this.__.slotName}"]`)?.assignedNodes?.(), l = snodes?.length ?? 0;
		let i;
		
		i = 0;
		
		return {
			
			next: detail => {
				
				const	snode = l && snodes[i], done = ++i >= l, played = snode?.play?.(detail);
				
				return played?.then?.(value => ({ value, done })) || Promise.resolve({ value: snode, done });
				//return typeof played === 'function' ?
				//	new Promise(rs => played.then(value => rs({ value, done }))) : Promise.resolve({ value: snode, done });
				
			}
			
		}
		
	}
	
	get content() {
		
		return this.getAttribute('content');
		
	}
	set content(v) {
		
		this.setAttribute('content', v);
		
	}
	
}