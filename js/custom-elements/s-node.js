import SubscriptionNode from './subscription-node.js';
import ScriptProxyHandler from './script-proxy-handler.js';

export default class SNode extends SubscriptionNode {
	
	static bound = {
		
	};
	
	static acc = {
		
		content(name, oldValue, newValue) {
			
			this.setContent(newValue);
			
		}
		
	};
	
	static {
		
		this.slotName = 'content',
		
		this.tagName = 's-node',
		
		this[ScriptProxyHandler.iteratorName] = 'assignedNodes';
		
	}
	
	constructor() {
		
		super(),
		
		this.setContent();
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	play() {
		
		return Promise.resolve();
		
	}
	
	setContent(selector = this.content, appends = this.appends) {
		
		if (selector !== this.content) {
			
			this.content = selector;
			return;
			
		}
		
		appends || this.removeContent();
		
		const contents = document.querySelectorAll(selector), l = contents.length;
		
		if (!l) return;
		
		const contentNode = document.createElement('div');
		let i;
		
		i = -1, contentNode.slot = this.slotName;
		while (++i < l) contentNode.appendChild(contents[i].content.cloneNode(true));
		
		this.appendChild(contentNode);
		
	}
	removeContent() {
		
		const { assignedNodes } = this;
		
		if (assignedNodes) for (const v of assignedNodes) v.remove();
		
	}
	
	get slotName() {
		
		return this.constructor.slotName || SNode.slotName;
		
	}
	get slotQuery() {
		
		return `slot[name="${this.slotName}"]`;
		
	}
	get assignedNodes() {
		
		return this.shadowRoot.querySelector(this.slotQuery)?.assignedNodes?.() || [];
		
	}
	
	get content() {
		
		return this.getAttribute('content');
		
	}
	set content(v) {
		
		this.setAttribute('content', v);
		
	}
	get appends() {
		
		return this.getAttribute('appends');
		
	}
	set appends(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('appends', v);
		
	}
	
}