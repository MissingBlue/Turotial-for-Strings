export class LogsNode extends CustomElement {
	
	static {
		
		this.tagName = 'logs-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		const logsContainer = document.createElement('logs-container');
		
		logsContainer.addLogs(logs, placeholder),
		
		this.root.prepend(logsContainer);
		
	}
	
}
export class LogsContainer extends CustomElement {
	
	static {
		
		this.tagName = 'logs-container';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		const l = (Array.isArray(logs) ? logs : (logs = [ logs ])).length, logNodes = [];
		let i, slotNode;
		
		i = -1;
		while (++i < l) (logNodes[i] = document.createElement('log-node')).setContent(logs[i], placeholder);
		
		this.root.prepend(...logNodes);
		
	}
	
}
export default class LogNode extends CustomElement {
	
	static replace(node, placeholder) {
		
		if (!placeholder || typeof placeholder !== 'object') return node;
		
		const { children } = node, l = children.length, { replace } = LogNode;
		let i;
		
		if (l) {
			
			i = -1;
			while (++i < l) replace(children[i], placeholder);
			
		} else node.innerText = strings(node.innerText, placeholder)[0];
		
		return node;
		
	}
	
	static {
		
		this.tagName = 'log-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	setContent(content, placeholder) {
		
		const slotNode = this.querySelector('[slot="content"]') || document.createElement('div');
		
		slotNode.slot = 'content',
		slotNode.append(content instanceof Node ? LogNode.replace(content, placeholder) : content),
		this.appendChild(slotNode);
		
	}
	
}