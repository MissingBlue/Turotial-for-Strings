export default class DisableInput extends CustomElement {
	
	static {
		
		this.tagName = 'disable-input';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	async play() {
		
		this.disable();
		
	}
	async played() {
		
		this.disable(false);
		
	}
	
	disable(disables) {
		
		this.composeClosest('app-node')?.disableConsoles(disables);
		
	}
	
}