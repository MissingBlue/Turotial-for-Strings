export default class CharacterNode extends CustomElement {
	
	static bound = {
		
	};
	
	static {
		
		this.tagName = 'character-node';
		
	}
	
	constructor() {
		
		super();
		
		this.setData();
		
	}
	static get observedAttributes() {
		
		return [ 'data-data' ];
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		switch (name) {
			case 'data-data': newValue === this.dataset.data || this.setData(newValue); break;
		}
		
	}
	
	setData(selector) {
		
		if (selector && selector !== this.dataset.data) {
			
			this.dataset.data = selector;
			return;
			
		}
		
		const dataNode = document.querySelector(selector || this.dataset.data);
		
		if (!(dataNode instanceof HTMLTemplateElement)) return;
		
		const content = dataNode.content.cloneNode(true);
		
		this.loadResources(content), this.appendChild(content);
		
	}
	
	loadResources(content) {
		
		const resources = content.getElementById('resources')?.children, l = resources.length;
		let i, r;
		
		i = -1;
		while (++i < l) {
			
			if (!(r = resources[i]).id) continue;
			
			switch ((r = resources[i]).tagName) {
				case 'IMG':
				r.decode().then((r => () => {
					
					document.documentElement.style.setProperty(`--img-${r.id}-url`, `url("${r.src}")`),
					document.documentElement.style.setProperty(`--img-${r.id}-width-px`, r.width + 'px'),
					document.documentElement.style.setProperty(`--img-${r.id}-width`, r.width),
					document.documentElement.style.setProperty(`--img-${r.id}-height-px`, r.height + 'px'),
					document.documentElement.style.setProperty(`--img-${r.id}-height`, r.height);
					
				})(r));
				break;
			}
			
		}
		
	}
	
	evaluateAll(inputs) {
		
		let i,l,i0, logs, values;
		
		i = -1, l = (Array.isArray(inputs) ? inputs : [ inputs ]).length, values = [];
		while (++i < l) values[i] = this.evaluate(inputs[i]);
		
		i = i0 = -1, l = (values = values.flat(1)).length, logs = [];
		while (++i < l) values[i]?.dialogs && (logs[++i0] = values[i]?.dialogs);
		
		return logs.flat(1);
		
	}
	
	evaluate(input) {
		
		const	conditions = this.querySelectorAll('#conditions > condition-block[data-has~="input"]'),
				l = conditions.length, values = [];
		let i;
		
		i = -1;
		while (++i < l) values[i] = conditions[i].evaluate(input);
		
		return values;
		
	}
	
	get metadata() {
		
		return this.querySelector('#metadata').get();
		
	}
	
}