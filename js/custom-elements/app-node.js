import Game from '../game.js';
import Parser from '../parser.js';
import ScriptProxyHandler from './script-proxy-handler.js';

export default class AppNode extends CustomElement {
	
	static bound = {
		
		input({ detail: { target } }) {
			
			const { value } = target, inputs = value && this.parser.parse(value);
			
			this.emit('app-input', { target, inputs }),
			
			inputs?.length && this.run(inputs);
			
		},
		
		defined() {
			
			this.play();
			
		}
		
	};
	
	static {
		
		this.tagName = 'app-node',
		
		this[ScriptProxyHandler.iteratorName] = 'scenes',
		
		this.shadowElement = {
			
			dataNode: '#data'
			
		};
		
	}
	
	constructor(game = new Game(), parser = new Parser()) {
		
		if (!(game instanceof Game)) throw new TypeError('Argument 1 must be an instance of Game.');
		if (!(parser instanceof Parser)) throw new TypeError('Argument 2 must be an instance of Parser.');
		
		super();
		
		this.game = game,
		this.parser = parser,
		
		(this.heat = document.createElement('character-node')).dataset.data = '#character-heat',
		//(this.heat = document.createElement('character-node')).
		//	appendChild(document.getElementById('character-heat').content.cloneNode(true)),
		
		this.dataNode.appendChild(this.heat),
		
		this.addEventListener('console-input', this.input);
		
	}
	connectedCallback() {
		
		this.autoplay && customElements.whenDefined(this.tagName.toLowerCase()).then(this.defined);
		
	}
	
	async play(shared = {}) {
		
		const	{ proxy, revoke } = Proxy.revocable(this, ScriptProxyHandler),
				asyncIterator = proxy[Symbol.asyncIterator](shared);
		
		for await (const v of asyncIterator);
		
		revoke();
		
	}
	
	run(inputs) {
		
		this.process(this.parseAll(inputs)),
		this.process(this.heat.evaluateAll(inputs), this.heat.metadata);
		
	}
	
	parseAll(inputs) {
		
		const	{ iterator } = Symbol,
				l = (inputs = Array.isArray(inputs) ? inputs : [ inputs ]).length, data = [];
		let i,di, v;
		
		i = di = -1;
		while (++i < l) typeof (v = this.parse(inputs[i])) !== 'string' && typeof v[iterator] === 'function' ?
			(di = data.push(...v) - 1) : (data[++di] = v);
		
		return data;
		
	}
	
	parse(input) {
		
		return typeof input === 'string' ? this.game.execute((input = input.split(' '))[0], input.slice(1)) ?? '' : '';
		
	}
	
	process(data, placeholder) {
		
		const	l = (data = Array.isArray(data) ? data : [ data ]).length,
				browserNode = this.q('browser-node'),
				{ isNotLog } = this.game.constructor, logs = [];
		let i,i0;
		
		i = i0 = -1;
		while (++i < l) data[i][isNotLog] ? browserNode.setContent(i, data[i], true) : (logs[++i0] = data[i]);
		
		logs.length && this.addLogs(logs, placeholder);
		
	}
	
	addLogs(logs, placeholder) {
		
		if (!logs || !(Array.isArray(logs) ? logs : (logs = [ logs ])).length) return;
		
		const dialogNodes = this.qq('dialog-node'), l = dialogNodes.length;
		let i;
		
		i = -1;
		while (++i < l) dialogNodes[i].dialog?.addLogs?.(logs, placeholder);
		
	}
	
	disableConsoles(disables) {
		
		const consolesNodes = this.qq('consoles-node'), l = consolesNodes.length;
		let i;
		
		i = -1;
		while (++i < l) consolesNodes[i].disableConsoles(disables);
		
	}
	
	get autoplay() {
		
		return this.hasAttribute('autoplay');
		
	}
	set autoplay(v) {
		
		return v === false ? this.removeAttribute('autoplay') : this.setAttribute('autoplay', v);
		
	}
	
	get scenes() {
		
		return this.qq('#scenes > s-node');
		
	}
	
}