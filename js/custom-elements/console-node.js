
// 入力用のカスタム要素

export class ConsolesNode extends CustomElement {
	
	static bound = {};
	
	static {
		
		this.tagName = 'consoles-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	disableConsoles(disables = true) {
		
		const consoleNodes = this.querySelectorAll('console-node'), l = consoleNodes.length;
		let i;
		
		i = -1;
		while (++i < l) consoleNodes[i].disabled = disables;
		
	}
	
}
export default class ConsoleNode extends CustomElement {
	
	static bound = {
		
		clickedSendButton(event) {
			
			this.emitInput(event);
			
		},
		
		pressedKey(event) {
			
			const { key, type } = event;
			
			event[ConsoleNode.targetNode] = this;
			
			switch (type) {
				
				case 'keypress':
				switch (key) {
					case 'Enter': this.emitInput(event); break;
				}
				break;
				
			}
			
			this.emit('console-' + type, event);
			
		}
		
	};
	
	static {
		
		this.tagName = 'console-node',
		this.targetNode = Symbol('ConsoleNode.targetNode'),
		
		this.element = {},
		
		this.shadowElement = {
			inputForm: '#inputform',
			inputButton: '#send'
		};
		
	}
	
	constructor() {
		
		super();
		
		const { clickedSendButton, inputButton, inputForm, pressedKey } = this;
		
		this.addEvent(inputForm, 'keypress', pressedKey),
		this.addEvent(inputForm, 'keyup', pressedKey),
		this.addEvent(inputForm, 'keydown', pressedKey),
		this.addEvent(inputButton, 'click', clickedSendButton);
		
	}
	connectedCallback() {
		
		
	}
	disconnectedCallback() {
		
		//this.abortEvents();
		
	}
	
	emitInput(event) {
		
		//this.closest('console-node')?.emit('input', targetEvent);
		this.emit('console-input', { event, target: this });
		
	}
	
	get disabled() {
		
		const	components = this.qq('input, button'), l = components.length;
		let i;
		
		i = -1;
		while (++i < l && components[i].hasAttribute('disabled'));
		
		return i === l;
		
	}
	set disabled(v) {
		
		const	components = this.qq('input, button'), l = components.length,
				method = (v ? 'set' : 'remove') + 'Attribute';
		let i;
		
		i = -1;
		while (++i < l) components[i][method]('disabled', '');
		
	}
	get value() {
		
		return this.inputForm.value;
		
	}
	set value(v) {
		
		this.inputForm.value = v;
		
	}
	
}