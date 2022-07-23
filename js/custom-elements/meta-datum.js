export default class MetaDatum extends CustomElement {
	
	static {
		this.tagName = 'meta-datum';
	}
	
	constructor() {
		super();
	}
	
	get(as = this.dataset.type) {
		
		let v;
		
		switch (as) {
			
			case 'boolean':
			v = this.textContent.trim();
			return v === '0' || v.toLowerCase() === 'false' ? false : !!v;
			
			case 'number': return +this.textContent.trim();
			
			case 'undefined': return undefined;
			
			case 'null': return null;
			
			case 'json':
			try {
				v = JSON.parse(this.textContent.trim());
			} catch(error) {
				v = null, console.error(error);
			}
			return v;
			
			case 'dom':
			(v = document.createDocumentFragment()).append(...this.cloneNode(true).children);
			return v;
			
			case 'text': return this.innerText.trim();
			
			default: return this.textContent.trim();
			
		}
		
	}
	
}