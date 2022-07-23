export default class DialogNode extends CustomElement {
	
	static {
		
		this.tagName = 'dialog-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		this.logsNode.addLogs(logs, placeholder);
		
	}
	
	get dialog() {
		
		return this.q('slot[name="dialog"]').assignedElements()[0];
		
	}
	
}